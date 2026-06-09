import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

type Params = { params: Promise<{ id: string }> };

/** Rattache une scène (texte) à la classe. */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_scene_attach:${id}`, max: 60 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  let body: { sceneId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.sceneId) {
    return NextResponse.json({ error: "sceneId requis." }, { status: 400 });
  }

  // La scène doit être lisible par le professeur (RLS sur scenes).
  const { data: scene } = await supabase
    .from("scenes")
    .select("id")
    .eq("id", body.sceneId)
    .maybeSingle();
  if (!scene) {
    return NextResponse.json({ error: "Scène introuvable." }, { status: 404 });
  }

  const { error } = await supabase
    .from("class_scenes")
    .insert({ class_id: classId, scene_id: body.sceneId });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce texte est déjà dans la classe." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Impossible d'ajouter le texte." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Retire une scène de la classe (et la distribution associée). */
export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_scene_detach:${id}`, max: 60 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  const sceneId = request.nextUrl.searchParams.get("sceneId");
  if (!sceneId) {
    return NextResponse.json({ error: "sceneId requis." }, { status: 400 });
  }

  // Membres concernés par une distribution de cette scène (pour retirer leurs accès).
  const { data: assignments } = await supabase
    .from("class_assignments")
    .select("member_id, class_members(user_id)")
    .eq("class_id", classId)
    .eq("scene_id", sceneId);

  const { error: assignmentsError } = await supabase
    .from("class_assignments")
    .delete()
    .eq("class_id", classId)
    .eq("scene_id", sceneId);

  const { error } = await supabase
    .from("class_scenes")
    .delete()
    .eq("class_id", classId)
    .eq("scene_id", sceneId);

  if (error || assignmentsError) {
    console.error(error ?? assignmentsError);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  type AssignmentRow = { member_id: string; class_members: { user_id: string | null } | null };
  const userIds = ((assignments ?? []) as unknown as AssignmentRow[])
    .map((a) => a.class_members?.user_id)
    .filter((id): id is string => Boolean(id));

  if (userIds.length > 0) {
    try {
      const admin = createSupabaseAdminClient();
      for (const userId of userIds) {
        const { data: remaining } = await admin
          .from("class_assignments")
          .select("id, class_members!inner(user_id)")
          .eq("scene_id", sceneId)
          .eq("class_members.user_id", userId)
          .limit(1);

        if (!remaining || remaining.length === 0) {
          await admin
            .from("user_work_access")
            .delete()
            .eq("user_id", userId)
            .eq("scene_id", sceneId)
            .eq("access_type", "private");
        }
      }
    } catch (e) {
      console.error("Nettoyage des accès impossible:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

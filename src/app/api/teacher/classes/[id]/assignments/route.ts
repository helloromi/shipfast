import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

type Params = { params: Promise<{ id: string }> };

/**
 * Distribue une scène à un élève (avec personnage optionnel).
 * Crée aussi l'accès en lecture (user_work_access 'private') si l'élève a un compte lié.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_assign:${id}`, max: 120 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  let body: {
    memberId?: string;
    sceneId?: string;
    characterId?: string | null;
    note?: string | null;
    dueDate?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.memberId || !body.sceneId) {
    return NextResponse.json({ error: "memberId et sceneId requis." }, { status: 400 });
  }

  const { data: assignment, error } = await supabase
    .from("class_assignments")
    .upsert(
      {
        class_id: classId,
        member_id: body.memberId,
        scene_id: body.sceneId,
        character_id: body.characterId ?? null,
        note: body.note?.trim() || null,
        due_date: body.dueDate || null,
      },
      { onConflict: "class_id,member_id,scene_id" }
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Distribution impossible." }, { status: 500 });
  }

  // Donner accès au texte si l'élève a déjà rejoint.
  try {
    const admin = createSupabaseAdminClient();
    const { data: member } = await admin
      .from("class_members")
      .select("user_id")
      .eq("id", body.memberId)
      .maybeSingle();

    if (member?.user_id) {
      await admin
        .from("user_work_access")
        .upsert(
          { user_id: member.user_id, scene_id: body.sceneId, access_type: "private" },
          { onConflict: "user_id,scene_id" }
        );
    }
  } catch (e) {
    console.error("Création de l'accès impossible:", e);
  }

  return NextResponse.json({ assignment });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_unassign:${id}`, max: 120 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  const assignmentId = request.nextUrl.searchParams.get("assignmentId");
  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId requis." }, { status: 400 });
  }

  const { data: assignment } = await supabase
    .from("class_assignments")
    .select("id, scene_id, class_members(user_id)")
    .eq("id", assignmentId)
    .eq("class_id", classId)
    .maybeSingle();

  const { error } = await supabase
    .from("class_assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("class_id", classId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  // Retirer l'accès si plus aucune distribution ne le justifie.
  type AssignmentRow = { scene_id: string; class_members: { user_id: string | null } | null };
  const row = (assignment as unknown as AssignmentRow | null) ?? null;
  const userId = row?.class_members?.user_id ?? undefined;
  const sceneId = row?.scene_id;
  if (userId && sceneId) {
    try {
      const admin = createSupabaseAdminClient();
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
    } catch (e) {
      console.error("Nettoyage de l'accès impossible:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

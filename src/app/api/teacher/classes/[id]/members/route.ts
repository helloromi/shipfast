import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

type Params = { params: Promise<{ id: string }> };

/**
 * Ajoute un élève à la classe (par email).
 * Si un compte existe déjà avec cet email, le membre est lié immédiatement.
 */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_member_add:${id}`, max: 60 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  let body: { email?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  // RLS: l'insertion échoue si l'utilisateur n'est pas le professeur de la classe.
  const { data: member, error } = await supabase
    .from("class_members")
    .insert({
      class_id: classId,
      email,
      display_name: body.displayName?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Cet élève est déjà dans la classe." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Impossible d'ajouter l'élève." }, { status: 500 });
  }

  // Lier le compte existant si l'email correspond à un utilisateur connu.
  try {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();

    if (profile?.user_id) {
      const { data: linked } = await admin
        .from("class_members")
        .update({ user_id: profile.user_id, joined_at: new Date().toISOString() })
        .eq("id", member.id)
        .select()
        .single();
      return NextResponse.json({ member: linked ?? member, linked: true });
    }
  } catch (e) {
    console.error("Liaison du membre impossible:", e);
  }

  return NextResponse.json({ member, linked: false });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_member_remove:${id}`, max: 60 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id: classId } = await params;

  const memberId = request.nextUrl.searchParams.get("memberId");
  if (!memberId) {
    return NextResponse.json({ error: "memberId requis." }, { status: 400 });
  }

  // Récupérer le membre avant suppression pour nettoyer ses accès.
  const { data: member } = await supabase
    .from("class_members")
    .select("id, user_id")
    .eq("id", memberId)
    .eq("class_id", classId)
    .maybeSingle();

  const { data: assignments } = await supabase
    .from("class_assignments")
    .select("scene_id")
    .eq("class_id", classId)
    .eq("member_id", memberId);

  const { error } = await supabase
    .from("class_members")
    .delete()
    .eq("id", memberId)
    .eq("class_id", classId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  // Retirer les accès aux scènes qui venaient de cette classe.
  if (member?.user_id && assignments && assignments.length > 0) {
    try {
      const admin = createSupabaseAdminClient();
      for (const a of assignments) {
        const { data: remaining } = await admin
          .from("class_assignments")
          .select("id, class_members!inner(user_id)")
          .eq("scene_id", a.scene_id)
          .eq("class_members.user_id", member.user_id)
          .limit(1);

        if (!remaining || remaining.length === 0) {
          await admin
            .from("user_work_access")
            .delete()
            .eq("user_id", member.user_id)
            .eq("scene_id", a.scene_id)
            .eq("access_type", "private");
        }
      }
    } catch (e) {
      console.error("Nettoyage des accès impossible:", e);
    }
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

/**
 * Un élève rejoint une classe avec le code d'invitation.
 * - Si le professeur l'avait pré-inscrit (même email), on lie la ligne existante.
 * - Sinon, on crée son inscription.
 * Dans les deux cas, on matérialise les accès aux textes déjà distribués.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `class_join:${id}`, max: 20 });
  if (!auth.ok) return auth.response;
  const { user } = auth;

  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ error: "Code d'invitation requis." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: klass } = await admin
    .from("teacher_classes")
    .select("id, name, teacher_id")
    .eq("invite_code", code)
    .maybeSingle();

  if (!klass) {
    return NextResponse.json({ error: "Code d'invitation inconnu." }, { status: 404 });
  }
  if (klass.teacher_id === user.id) {
    return NextResponse.json({ error: "Tu es le professeur de cette classe." }, { status: 400 });
  }

  const email = (user.email ?? "").toLowerCase();
  const nowIso = new Date().toISOString();

  // Ligne pré-créée par le professeur ?
  const { data: existing } = await admin
    .from("class_members")
    .select("id, user_id")
    .eq("class_id", klass.id)
    .ilike("email", email)
    .maybeSingle();

  let memberId: string;
  if (existing) {
    memberId = existing.id;
    if (!existing.user_id) {
      await admin
        .from("class_members")
        .update({ user_id: user.id, joined_at: nowIso })
        .eq("id", existing.id);
    }
  } else {
    const { data: created, error: insertError } = await admin
      .from("class_members")
      .insert({
        class_id: klass.id,
        user_id: user.id,
        email,
        joined_at: nowIso,
      })
      .select("id")
      .single();

    if (insertError || !created) {
      console.error(insertError);
      return NextResponse.json({ error: "Impossible de rejoindre la classe." }, { status: 500 });
    }
    memberId = created.id;
  }

  // Donner accès aux textes déjà distribués à cet élève.
  const { data: assignments } = await admin
    .from("class_assignments")
    .select("scene_id")
    .eq("class_id", klass.id)
    .eq("member_id", memberId);

  for (const a of assignments ?? []) {
    await admin
      .from("user_work_access")
      .upsert(
        { user_id: user.id, scene_id: a.scene_id, access_type: "private" },
        { onConflict: "user_id,scene_id" }
      );
  }

  return NextResponse.json({ ok: true, className: klass.name });
}

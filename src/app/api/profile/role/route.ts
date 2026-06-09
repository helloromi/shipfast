import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/utils/api-auth";

/** Choix du rôle (comédien / professeur) pendant l'onboarding. */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `profile_role:${id}`, max: 20 });
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (body.role !== "student" && body.role !== "teacher") {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_profiles")
    .upsert({ user_id: user.id, email: user.email ?? null, role: body.role }, { onConflict: "user_id" });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'enregistrer le rôle." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, role: body.role });
}

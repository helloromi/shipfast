import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_class_create:${id}`, max: 20 });
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  let body: { name?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Le nom de la classe est requis." }, { status: 400 });
  }

  const { data: klass, error } = await supabase
    .from("teacher_classes")
    .insert({
      teacher_id: user.id,
      name,
      description: body.description?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible de créer la classe." }, { status: 500 });
  }

  // Créer une classe fait de l'utilisateur un professeur.
  await supabase
    .from("user_profiles")
    .upsert({ user_id: user.id, email: user.email ?? null, role: "teacher" }, { onConflict: "user_id" });

  return NextResponse.json({ class: klass });
}

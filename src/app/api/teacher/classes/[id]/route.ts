import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/utils/api-auth";

type Params = { params: Promise<{ id: string }> };

const UPDATABLE_FIELDS = ["name", "description", "show_title", "show_date", "show_venue"] as const;

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_class_update:${id}`, max: 60 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in body) {
      const value = body[field];
      update[field] = typeof value === "string" && value.trim() === "" ? null : value;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  // RLS: seul le professeur propriétaire peut modifier sa classe.
  const { data, error } = await supabase
    .from("teacher_classes")
    .update(update)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Classe introuvable." }, { status: 404 });
  }

  return NextResponse.json({ class: data });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAuth(request, { key: (id) => `teacher_class_delete:${id}`, max: 20 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  const { error } = await supabase.from("teacher_classes").delete().eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

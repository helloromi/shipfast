import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/utils/api-auth";

/** Annotations du professeur, visibles par toute la classe (RLS: écriture prof uniquement). */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_annotation:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: { classId?: string; sceneId?: string; lineId?: string | null; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!body.classId || !body.sceneId || !content) {
    return NextResponse.json({ error: "classId, sceneId et content requis." }, { status: 400 });
  }

  const { data: annotation, error } = await supabase
    .from("class_annotations")
    .insert({
      class_id: body.classId,
      scene_id: body.sceneId,
      line_id: body.lineId ?? null,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'enregistrer l'annotation." }, { status: 500 });
  }

  return NextResponse.json({ annotation });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_annotation:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: { id?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!body.id || !content) {
    return NextResponse.json({ error: "id et content requis." }, { status: 400 });
  }

  const { data: annotation, error } = await supabase
    .from("class_annotations")
    .update({ content })
    .eq("id", body.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
  if (!annotation) {
    return NextResponse.json({ error: "Annotation introuvable." }, { status: 404 });
  }

  return NextResponse.json({ annotation });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_annotation:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }

  const { error } = await supabase.from("class_annotations").delete().eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

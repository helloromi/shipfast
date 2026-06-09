import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/utils/api-auth";

const CATEGORIES = ["mise_en_scene", "costumes", "decors", "accessoires", "technique", "autre"];
const STATUSES = ["todo", "in_progress", "done"];

/** Préparation du spectacle : éléments de mise en scène, costumes, décors, etc. */
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_show_note:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: {
    classId?: string;
    sceneId?: string | null;
    memberId?: string | null;
    category?: string;
    title?: string;
    content?: string | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!body.classId || !title) {
    return NextResponse.json({ error: "classId et title requis." }, { status: 400 });
  }
  const category = CATEGORIES.includes(body.category ?? "") ? body.category : "mise_en_scene";

  const { data: note, error } = await supabase
    .from("class_show_notes")
    .insert({
      class_id: body.classId,
      scene_id: body.sceneId ?? null,
      member_id: body.memberId ?? null,
      category,
      title,
      content: body.content?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Impossible d'enregistrer l'élément." }, { status: 500 });
  }

  return NextResponse.json({ note });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_show_note:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: Record<string, unknown> & { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) update.title = body.title.trim();
  if ("content" in body) update.content = typeof body.content === "string" ? body.content.trim() || null : null;
  if ("sceneId" in body) update.scene_id = body.sceneId ?? null;
  if ("memberId" in body) update.member_id = body.memberId ?? null;
  if (typeof body.category === "string" && CATEGORIES.includes(body.category)) update.category = body.category;
  if (typeof body.status === "string" && STATUSES.includes(body.status)) update.status = body.status;
  if (typeof body.position === "number") update.position = body.position;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  const { data: note, error } = await supabase
    .from("class_show_notes")
    .update(update)
    .eq("id", body.id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
  if (!note) {
    return NextResponse.json({ error: "Élément introuvable." }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth(request, { key: (id) => `teacher_show_note:${id}`, max: 240 });
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id requis." }, { status: 400 });
  }

  const { error } = await supabase.from("class_show_notes").delete().eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

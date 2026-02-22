import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/utils/admin";
import { requireAuth } from "@/lib/utils/api-auth";

type EditorCharacter = {
  id: string;
  name: string;
};

type EditorLine = {
  id: string;
  characterId: string;
  text: string;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sceneId } = await params;
  if (!sceneId) {
    return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
  }

  const auth = await requireAuth(request, {
    key: (id) => `scene_editor:${id}:${sceneId}`,
    max: 30,
  });
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : null;
  const summary = typeof body?.summary === "string" ? body.summary.trim() || null : body?.summary === null ? null : undefined;
  const characters = Array.isArray(body?.characters) ? (body.characters as EditorCharacter[]) : null;
  const lines = Array.isArray(body?.lines) ? (body.lines as EditorLine[]) : null;
  
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!characters || !lines) {
    return NextResponse.json({ error: "Missing characters or lines" }, { status: 400 });
  }

  // Validation de base
  for (const c of characters) {
    if (!isNonEmptyString(c?.id) || !isNonEmptyString(c?.name)) {
      return NextResponse.json({ error: "Invalid character payload" }, { status: 400 });
    }
  }
  for (const l of lines) {
    if (!isNonEmptyString(l?.id) || !isNonEmptyString(l?.characterId) || !isNonEmptyString(l?.text)) {
      return NextResponse.json({ error: "Invalid line payload" }, { status: 400 });
    }
  }

  const incomingCharacterIds = new Set<string>(characters.map((c) => c.id));
  const incomingLineIds = new Set<string>(lines.map((l) => l.id));

  if (incomingCharacterIds.size !== characters.length) {
    return NextResponse.json({ error: "Duplicate character ids" }, { status: 400 });
  }
  if (incomingLineIds.size !== lines.length) {
    return NextResponse.json({ error: "Duplicate line ids" }, { status: 400 });
  }

  for (const l of lines) {
    if (!incomingCharacterIds.has(l.characterId)) {
      return NextResponse.json({ error: "A line references an unknown characterId" }, { status: 400 });
    }
  }

  // Contrôle d'accès: scène privée owned, ou admin.
  const admin = await isAdmin(user.id);
  const adminClient = createSupabaseAdminClient();

  const { data: sceneRow, error: sceneError } = await adminClient
    .from("scenes")
    .select("id, is_private, owner_user_id")
    .eq("id", sceneId)
    .maybeSingle<{ id: string; is_private: boolean; owner_user_id: string | null }>();

  if (sceneError) {
    console.error("Error fetching scene:", sceneError);
    return NextResponse.json({ error: "Failed to fetch scene" }, { status: 500 });
  }

  if (!sceneRow) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  if (!sceneRow.is_private || !sceneRow.owner_user_id) {
    return NextResponse.json({ error: "Only private scenes can be edited" }, { status: 403 });
  }

  if (sceneRow.owner_user_id !== user.id && !admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Charger l'existant pour calculer les deletes + un base order safe.
  const [{ data: existingLines, error: existingLinesError }, { data: existingCharacters, error: existingCharsError }] =
    await Promise.all([
      adminClient
        .from("lines")
        .select("id, order, character_id")
        .eq("scene_id", sceneId)
        .returns<{ id: string; order: number; character_id: string }[]>(),
      adminClient
        .from("characters")
        .select("id")
        .eq("scene_id", sceneId)
        .returns<{ id: string }[]>(),
    ]);

  if (existingLinesError) {
    console.error("Error fetching existing lines:", existingLinesError);
    return NextResponse.json({ error: "Failed to fetch lines" }, { status: 500 });
  }
  if (existingCharsError) {
    console.error("Error fetching existing characters:", existingCharsError);
    return NextResponse.json({ error: "Failed to fetch characters" }, { status: 500 });
  }

  const maxOrder = Math.max(0, ...(existingLines ?? []).map((l) => l.order ?? 0));
  const tempBase = maxOrder + 1_000_000;

  const toDeleteLineIds = (existingLines ?? [])
    .filter((l) => !incomingLineIds.has(l.id))
    .map((l) => l.id);

  const toDeleteCharacterIds = (existingCharacters ?? [])
    .filter((c) => !incomingCharacterIds.has(c.id))
    .map((c) => c.id);

  // Si on supprime un personnage, il ne doit plus être référencé par les lignes finales.
  const finalReferencedCharacterIds = new Set(lines.map((l) => l.characterId));
  for (const charId of toDeleteCharacterIds) {
    if (finalReferencedCharacterIds.has(charId)) {
      return NextResponse.json({ error: "Cannot delete a character still used by lines" }, { status: 400 });
    }
  }

  // Upsert personnages (insert + update name)
  const charactersToUpsert = characters.map((c) => ({
    id: c.id,
    scene_id: sceneId,
    name: c.name.trim(),
  }));

  const { error: upsertCharsError } = await adminClient
    .from("characters")
    .upsert(charactersToUpsert, { onConflict: "id" });

  if (upsertCharsError) {
    console.error("Error upserting characters:", upsertCharsError);
    return NextResponse.json({ error: "Failed to save characters" }, { status: 500 });
  }

  // Pass 1: déplacer les lignes sur des ordres temporaires uniques (évite le conflit unique(scene_id, order)).
  const tempLinesToUpsert = lines.map((l, idx) => ({
    id: l.id,
    scene_id: sceneId,
    character_id: l.characterId,
    text: l.text.trim(),
    order: tempBase + idx + 1,
  }));

  const { error: tempUpsertError } = await adminClient
    .from("lines")
    .upsert(tempLinesToUpsert, { onConflict: "id" });

  if (tempUpsertError) {
    console.error("Error temp-upserting lines:", tempUpsertError);
    return NextResponse.json({ error: "Failed to save lines" }, { status: 500 });
  }

  // Supprimer les lignes absentes du snapshot (avant le passage final, pour éviter collisions d'ordre).
  if (toDeleteLineIds.length > 0) {
    const { error: deleteLinesError } = await adminClient.from("lines").delete().in("id", toDeleteLineIds);
    if (deleteLinesError) {
      console.error("Error deleting lines:", deleteLinesError);
      return NextResponse.json({ error: "Failed to delete lines" }, { status: 500 });
    }
  }

  // Pass 2: ordres finaux séquentiels + update fields
  const finalLinesToUpsert = lines.map((l, idx) => ({
    id: l.id,
    scene_id: sceneId,
    character_id: l.characterId,
    text: l.text.trim(),
    order: idx + 1,
  }));

  const { error: finalUpsertError } = await adminClient
    .from("lines")
    .upsert(finalLinesToUpsert, { onConflict: "id" });

  if (finalUpsertError) {
    console.error("Error final-upserting lines:", finalUpsertError);
    return NextResponse.json({ error: "Failed to finalize line order" }, { status: 500 });
  }

  // Supprimer les personnages absents du snapshot (après mise à jour des lignes).
  if (toDeleteCharacterIds.length > 0) {
    const { error: deleteCharsError } = await adminClient
      .from("characters")
      .delete()
      .in("id", toDeleteCharacterIds);
    if (deleteCharsError) {
      console.error("Error deleting characters:", deleteCharsError);
      return NextResponse.json({ error: "Failed to delete characters" }, { status: 500 });
    }
  }

  // Mettre à jour le titre et la description de la scène
  const { error: updateSceneError } = await adminClient
    .from("scenes")
    .update({ title, summary })
    .eq("id", sceneId);

  if (updateSceneError) {
    console.error("Error updating scene:", updateSceneError);
    return NextResponse.json({ error: "Failed to update scene" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


import { createSupabaseServerClient } from "@/lib/supabase-server";
import { hasAccess } from "@/lib/queries/access";
import { fetchSceneWithRelations } from "@/lib/queries/scenes";

type EnsurePersonalSceneResult =
  | { ok: true; personalSceneId: string }
  | { ok: false; reason: "no_access" | "not_found" | "invalid_source" | "error"; message?: string };

/**
 * Assure l'existence d'une copie privée "personnelle" d'une scène publique pour l'utilisateur courant,
 * et migre l'historique (feedback + sessions) de la scène source vers la copie.
 *
 * Important:
 * - Ne crée PAS de copie si l'utilisateur n'a pas accès à la scène.
 * - Retourne l'ID de la copie (existante ou nouvellement créée).
 */
export async function ensurePersonalSceneForCurrentUser(sourceSceneId: string): Promise<EnsurePersonalSceneResult> {
  if (!sourceSceneId) return { ok: false, reason: "invalid_source" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: "no_access" };

  // Charger la scène source (doit être publique).
  const source = await fetchSceneWithRelations(sourceSceneId);
  if (!source) return { ok: false, reason: "not_found" };
  if (source.is_private) {
    // Si on pointe déjà vers une scène privée appartenant à l'utilisateur, on la renvoie telle quelle.
    if (source.owner_user_id === user.id) {
      return { ok: true, personalSceneId: source.id };
    }
    return { ok: false, reason: "invalid_source" };
  }

  const access = await hasAccess(user.id, source.work_id ?? undefined, sourceSceneId);
  if (!access) return { ok: false, reason: "no_access" };

  // Copie existante ?
  const { data: existing, error: existingError } = await supabase
    .from("scenes")
    .select("id")
    .eq("is_private", true)
    .eq("owner_user_id", user.id)
    .eq("source_scene_id", sourceSceneId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    console.error("Error fetching personal copy:", existingError);
    return { ok: false, reason: "error", message: existingError.message };
  }

  if (existing?.id) {
    // Best-effort: tenter de migrer encore les éventuels feedbacks restants (no-op si déjà migré).
    await migrateHistory({
      supabase,
      userId: user.id,
      sourceSceneId,
      personalSceneId: existing.id,
    });
    return { ok: true, personalSceneId: existing.id };
  }

  // Créer la copie
  const { data: createdScene, error: createSceneError } = await supabase
    .from("scenes")
    .insert({
      work_id: source.work_id ?? null,
      title: source.title,
      author: source.author ?? null,
      summary: source.summary ?? null,
      chapter: source.chapter ?? null,
      is_private: true,
      owner_user_id: user.id,
      source_scene_id: sourceSceneId,
    })
    .select("id")
    .single<{ id: string }>();

  if (createSceneError || !createdScene?.id) {
    console.error("Error creating personal scene:", createSceneError);
    return { ok: false, reason: "error", message: createSceneError?.message };
  }

  const personalSceneId = createdScene.id;

  // Copier personnages (en conservant mapping par ID source).
  const characterIdMap = new Map<string, string>(); // sourceCharId -> newCharId
  for (const character of source.characters ?? []) {
    const { data: createdChar, error: charError } = await supabase
      .from("characters")
      .insert({
        scene_id: personalSceneId,
        name: character.name,
      })
      .select("id")
      .single<{ id: string }>();

    if (charError || !createdChar?.id) {
      console.error("Error copying character:", charError);
      // Cleanup best-effort
      await supabase.from("scenes").delete().eq("id", personalSceneId);
      return { ok: false, reason: "error", message: "Failed to copy characters" };
    }
    characterIdMap.set(character.id, createdChar.id);
  }

  // Copier lignes (même order) + mapping order -> newLineId.
  const sortedSourceLines = [...(source.lines ?? [])].sort((a, b) => a.order - b.order);
  const linesToInsert = sortedSourceLines.map((line) => {
    const newCharacterId = characterIdMap.get(line.character_id);
    if (!newCharacterId) throw new Error("Missing character mapping");
    return {
      scene_id: personalSceneId,
      character_id: newCharacterId,
      order: line.order,
      text: line.text,
    };
  });

  if (linesToInsert.length > 0) {
    const { error: insertLinesError } = await supabase.from("lines").insert(linesToInsert);
    if (insertLinesError) {
      console.error("Error copying lines:", insertLinesError);
      await supabase.from("scenes").delete().eq("id", personalSceneId);
      return { ok: false, reason: "error", message: "Failed to copy lines" };
    }
  }

  // Migrer historique
  await migrateHistory({
    supabase,
    userId: user.id,
    sourceSceneId,
    personalSceneId,
  });

  return { ok: true, personalSceneId };
}

async function migrateHistory(args: {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  sourceSceneId: string;
  personalSceneId: string;
}) {
  const { supabase, userId, sourceSceneId, personalSceneId } = args;

  // Mapper order -> lineId pour source et copie.
  const [{ data: sourceLines, error: sourceLinesError }, { data: personalLines, error: personalLinesError }] =
    await Promise.all([
      supabase
        .from("lines")
        .select("id, order")
        .eq("scene_id", sourceSceneId)
        .returns<{ id: string; order: number }[]>(),
      supabase
        .from("lines")
        .select("id, order")
        .eq("scene_id", personalSceneId)
        .returns<{ id: string; order: number }[]>(),
    ]);

  if (sourceLinesError) {
    console.error("Error fetching source lines for migration:", sourceLinesError);
    return;
  }
  if (personalLinesError) {
    console.error("Error fetching personal lines for migration:", personalLinesError);
    return;
  }

  const newLineIdByOrder = new Map<number, string>();
  for (const l of personalLines ?? []) newLineIdByOrder.set(l.order, l.id);

  // Move feedback: update all user feedback rows from old line_id to new line_id (by order).
  for (const oldLine of sourceLines ?? []) {
    const newLineId = newLineIdByOrder.get(oldLine.order);
    if (!newLineId) continue;
    const { error } = await supabase
      .from("user_line_feedback")
      .update({ line_id: newLineId })
      .eq("user_id", userId)
      .eq("line_id", oldLine.id);
    if (error) {
      console.error("Error migrating feedback:", error);
      // best-effort: continue
    }
  }

  // Move sessions: update scene_id + character_id (map by character name).
  const [{ data: sourceCharacters }, { data: personalCharacters }] = await Promise.all([
    supabase
      .from("characters")
      .select("id, name")
      .eq("scene_id", sourceSceneId)
      .returns<{ id: string; name: string }[]>(),
    supabase
      .from("characters")
      .select("id, name")
      .eq("scene_id", personalSceneId)
      .returns<{ id: string; name: string }[]>(),
  ]);

  const newCharIdByName = new Map<string, string>();
  for (const c of personalCharacters ?? []) newCharIdByName.set((c.name ?? "").trim(), c.id);

  const oldCharNameById = new Map<string, string>();
  for (const c of sourceCharacters ?? []) oldCharNameById.set(c.id, (c.name ?? "").trim());

  const { data: sessions, error: sessionsError } = await supabase
    .from("user_learning_sessions")
    .select("id, character_id")
    .eq("user_id", userId)
    .eq("scene_id", sourceSceneId)
    .returns<{ id: string; character_id: string }[]>();

  if (sessionsError) {
    console.error("Error fetching sessions to migrate:", sessionsError);
    return;
  }

  const fallbackCharId = (personalCharacters ?? [])[0]?.id ?? null;

  for (const s of sessions ?? []) {
    const oldName = oldCharNameById.get(s.character_id) ?? "";
    const newCharId = newCharIdByName.get(oldName) ?? fallbackCharId;
    if (!newCharId) continue;
    const { error } = await supabase
      .from("user_learning_sessions")
      .update({ scene_id: personalSceneId, character_id: newCharId })
      .eq("id", s.id)
      .eq("user_id", userId);
    if (error) {
      console.error("Error migrating session:", error);
    }
  }
}


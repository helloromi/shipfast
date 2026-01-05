import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Character, Scene, SceneWithRelations } from "@/types/scenes";

/**
 * Convertit un score de l'ancien format (0-3) vers le nouveau (0-10).
 * Si le score est déjà en format 0-10, il est retourné tel quel.
 */
function normalizeScore(score: number): number {
  if (score <= 3) {
    // Ancien format : convertir 0-3 vers 0-10
    return (score / 3) * 10;
  }
  // Déjà en format 0-10
  return score;
}

type SceneAverage = {
  sceneId: string;
  average: number;
};

type SceneQueryResult = Scene & {
  works?: { id: string; title: string } | null;
  characters: Character[];
  lines: {
    id: string;
    order: number;
    text: string;
    character_id: string;
    characters: Character | null;
  }[];
};

export type SceneProgress = {
  sceneId: string;
  title: string;
  author: string | null;
  summary: string | null;
  chapter: string | null;
  average: number;
  lastCharacterId: string | null;
  lastCharacterName: string | null;
};

export async function getSupabaseSessionUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function fetchScenes(): Promise<Scene[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scenes")
    .select("id, work_id, title, author, summary, chapter, is_private, owner_user_id")
    .eq("is_private", false)
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((scene) => ({
    id: scene.id,
    work_id: scene.work_id ?? null,
    title: scene.title,
    author: scene.author,
    summary: scene.summary,
    chapter: scene.chapter,
    is_private: scene.is_private ?? false,
    owner_user_id: scene.owner_user_id ?? null,
  }));
}

export async function fetchUserPrivateScenes(userId: string): Promise<Scene[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scenes")
    .select("id, work_id, title, author, summary, chapter, is_private, owner_user_id")
    .eq("is_private", true)
    .eq("owner_user_id", userId)
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? []).map((scene) => ({
    id: scene.id,
    work_id: scene.work_id ?? null,
    title: scene.title,
    author: scene.author,
    summary: scene.summary,
    chapter: scene.chapter,
    is_private: scene.is_private ?? true,
    owner_user_id: scene.owner_user_id ?? null,
  }));
}

export async function fetchSceneWithRelations(id: string): Promise<SceneWithRelations | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scenes")
    .select(
      `
        id,
        work_id,
        title,
        author,
        summary,
        chapter,
        works ( id, title ),
        characters ( id, name ),
        lines (
          id,
          order,
          text,
          character_id,
          characters ( id, name )
        )
      `
    )
    .eq("id", id)
    .single<SceneQueryResult>();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    characters: data.characters ?? [],
    lines: (data.lines ?? []).map((line) => ({
      ...line,
      scene_id: id,
    })),
    work: data.works ?? null,
  };
}

export async function fetchUserSceneAverages(userId: string): Promise<SceneAverage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_feedback")
    .select("score, lines!inner(scene_id)")
    .eq("user_id", userId)
    .returns<{ score: number; lines: { scene_id: string } | null }[]>();

  if (error) {
    console.error(error);
    return [];
  }

  const grouped = new Map<string, { sum: number; count: number }>();
  for (const row of data ?? []) {
    const sceneId = row.lines?.scene_id;
    if (!sceneId) continue;
    const normalized = normalizeScore(row.score);
    const entry = grouped.get(sceneId) ?? { sum: 0, count: 0 };
    grouped.set(sceneId, { sum: entry.sum + normalized, count: entry.count + 1 });
  }

  return Array.from(grouped.entries()).map(([sceneId, { sum, count }]) => ({
    sceneId,
    average: count ? Math.round((sum / count) * 100) / 100 : 0,
  }));
}

type UserProgressQueryResult = {
  score: number;
  created_at: string;
  lines: {
    scene_id: string;
    character_id: string;
    scenes: Scene;
    characters: Character | null;
  };
};

export async function fetchUserProgressScenes(userId: string): Promise<SceneProgress[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_feedback")
    .select(
      `
        score,
        created_at,
        lines!inner (
          scene_id,
          character_id,
          scenes ( id, title, author, summary, chapter ),
          characters ( id, name )
        )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<UserProgressQueryResult[]>();

  if (error || !data) {
    console.error(error);
    return [];
  }

  const grouped = new Map<
    string,
    {
      scene: Scene;
      lastCharacterId: string | null;
      lastCharacterName: string | null;
      sum: number;
      count: number;
    }
  >();

  for (const row of data) {
    const line = row.lines;
    if (!line?.scene_id || !line?.scenes) continue;
    const normalized = normalizeScore(row.score);
    const sceneId = line.scene_id;
    const scene = line.scenes;
    const character = line.characters;
    const entry = grouped.get(sceneId);
    if (!entry) {
      grouped.set(sceneId, {
        scene,
        lastCharacterId: character?.id ?? null,
        lastCharacterName: character?.name ?? null,
        sum: normalized,
        count: 1,
      });
    } else {
      grouped.set(sceneId, {
        scene: entry.scene,
        lastCharacterId: entry.lastCharacterId,
        lastCharacterName: entry.lastCharacterName,
        sum: entry.sum + normalized,
        count: entry.count + 1,
      });
    }
  }

  return Array.from(grouped.values()).map((entry) => ({
    sceneId: entry.scene.id,
    title: entry.scene.title,
    author: entry.scene.author,
    summary: entry.scene.summary,
    chapter: entry.scene.chapter,
    average: entry.count ? Math.round((entry.sum / entry.count) * 100) / 100 : 0,
    lastCharacterId: entry.lastCharacterId,
    lastCharacterName: entry.lastCharacterName,
  }));
}

export async function countPublicScenes(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("scenes")
    .select("*", { count: "exact", head: true })
    .eq("is_private", false);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}






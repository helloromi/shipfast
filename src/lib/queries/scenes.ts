import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Character, Scene, SceneWithRelations } from "@/types/scenes";
import { weightedAverageScoreByRecency } from "@/lib/utils/score";

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
    .select("id, work_id, title, author, summary, chapter, is_private, owner_user_id, source_scene_id")
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
    source_scene_id: (scene as any).source_scene_id ?? null,
  }));
}

export async function fetchUserPrivateScenes(userId: string): Promise<Scene[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("scenes")
    .select("id, work_id, title, author, summary, chapter, is_private, owner_user_id, source_scene_id")
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
    source_scene_id: (scene as any).source_scene_id ?? null,
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
        is_private,
        owner_user_id,
        source_scene_id,
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
  const { data: sessions, error } = await supabase
    .from("user_learning_sessions")
    .select("scene_id, started_at, average_score, ended_at, completed_lines")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .gt("completed_lines", 0)
    .order("started_at", { ascending: false })
    .returns<
      {
        scene_id: string;
        started_at: string;
        average_score: number | null;
        ended_at: string | null;
        completed_lines: number | null;
      }[]
    >();

  if (error || !sessions) {
    console.error(error);
    return [];
  }

  const grouped = new Map<string, { points: { started_at: string; average_score: number | null }[] }>();
  for (const s of sessions) {
    if (!s.scene_id) continue;
    const entry = grouped.get(s.scene_id) ?? { points: [] };
    entry.points.push({ started_at: s.started_at, average_score: s.average_score });
    grouped.set(s.scene_id, entry);
  }

  return Array.from(grouped.entries()).map(([sceneId, { points }]) => {
    const avg = weightedAverageScoreByRecency(points, 14);
    return { sceneId, average: Math.round(avg * 100) / 100 };
  });
}

type UserProgressQueryResult = {
  average_score: number | null;
  started_at: string;
  scene_id: string;
  character_id: string | null;
  scenes: Scene | null;
  characters: Character | null;
};

export async function fetchUserProgressScenes(userId: string): Promise<SceneProgress[]> {
  const supabase = await createSupabaseServerClient();
  
  // Récupérer toutes les sessions (terminées et non terminées) pour obtenir toutes les scènes actives
  const { data: allSessionsData, error: allSessionsError } = await supabase
    .from("user_learning_sessions")
    .select(
      `
        average_score,
        started_at,
        scene_id,
        character_id,
        ended_at,
        completed_lines,
        scenes ( id, title, author, summary, chapter ),
        characters ( id, name )
      `
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false })
    .returns<
      (UserProgressQueryResult & {
        ended_at: string | null;
        completed_lines: number | null;
      })[]
    >();

  if (allSessionsError) {
    console.error(allSessionsError);
    return [];
  }

  const grouped = new Map<
    string,
    {
      scene: Scene;
      lastCharacterId: string | null;
      lastCharacterName: string | null;
      points: { started_at: string; average_score: number | null }[];
    }
  >();

  // Traiter toutes les sessions pour regrouper par scène
  if (allSessionsData) {
    for (const row of allSessionsData) {
      if (!row.scene_id || !row.scenes) continue;
      const sceneId = row.scene_id;
      const scene = row.scenes;
      const character = row.characters;
      
      const entry = grouped.get(sceneId);
      
      // Ajouter le point de données seulement si la session est terminée avec des répliques notées
      const hasValidScore = row.ended_at !== null && (row.completed_lines ?? 0) > 0;
      
      if (!entry) {
        grouped.set(sceneId, {
          scene,
          lastCharacterId: character?.id ?? null,
          lastCharacterName: character?.name ?? null,
          points: hasValidScore 
            ? [{ started_at: row.started_at, average_score: row.average_score }]
            : [],
        });
      } else {
        // Mettre à jour le dernier personnage si c'est la session la plus récente
        const currentLastStarted = entry.points.length > 0 
          ? entry.points[entry.points.length - 1]?.started_at 
          : null;
        const shouldUpdateCharacter = !currentLastStarted || row.started_at > currentLastStarted;
        
        grouped.set(sceneId, {
          scene: entry.scene,
          lastCharacterId: shouldUpdateCharacter ? (character?.id ?? entry.lastCharacterId) : entry.lastCharacterId,
          lastCharacterName: shouldUpdateCharacter ? (character?.name ?? entry.lastCharacterName) : entry.lastCharacterName,
          points: hasValidScore
            ? [...entry.points, { started_at: row.started_at, average_score: row.average_score }]
            : entry.points,
        });
      }
    }
  }

  return Array.from(grouped.values()).map((entry) => {
    const avg = entry.points.length > 0 
      ? weightedAverageScoreByRecency(entry.points, 14)
      : 0;
    return {
      sceneId: entry.scene.id,
      title: entry.scene.title,
      author: entry.scene.author,
      summary: entry.scene.summary,
      chapter: entry.scene.chapter,
      average: entry.points.length > 0 ? Math.round(avg * 100) / 100 : 0,
      lastCharacterId: entry.lastCharacterId,
      lastCharacterName: entry.lastCharacterName,
    };
  });
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

export type PendingImport = {
  jobId: string;
  title: string;
  author: string | null;
  created_at: string;
  draft_data: any;
};

export async function fetchPendingImports(userId: string): Promise<PendingImport[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("import_jobs")
    .select("id, draft_data, created_at")
    .eq("user_id", userId)
    .eq("status", "preview_ready")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return (data ?? [])
    .filter((job) => job.draft_data && typeof job.draft_data === "object")
    .map((job) => ({
      jobId: job.id,
      title: (job.draft_data as any)?.title || "Scène importée",
      author: (job.draft_data as any)?.author || null,
      created_at: job.created_at,
      draft_data: job.draft_data,
    }));
}

/**
 * Récupère les IDs des scènes actives (en cours de travail) pour un utilisateur
 */
export async function fetchActiveSceneIds(userId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_feedback")
    .select("lines!inner(scene_id)")
    .eq("user_id", userId)
    .returns<{ lines: { scene_id: string } | null }[]>();

  if (error || !data) {
    console.error(error);
    return new Set();
  }

  const sceneIds = new Set<string>();
  for (const row of data) {
    const sceneId = row.lines?.scene_id;
    if (sceneId) {
      sceneIds.add(sceneId);
    }
  }

  return sceneIds;
}






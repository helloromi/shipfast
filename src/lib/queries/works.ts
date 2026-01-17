import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Scene, Work, WorkWithScenes } from "@/types/scenes";
import { weightedAverageScoreByRecency } from "@/lib/utils/score";

type WorkQueryResult = Work & {
  scenes: Scene[];
  scenes_count: number;
};

type WorkWithScenesQueryResult = Work & {
  scenes: (Scene & {
    characters_count: number;
    lines_count: number;
  })[];
};

type WorkAverage = {
  workId: string;
  average: number;
};

export async function fetchWorks(
  authorFilter?: string,
  sortBy: "title" | "scenes" | "mastery" = "title"
): Promise<(Work & { scenesCount: number })[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("works")
    .select(
      `
      id,
      title,
      author,
      summary,
      scenes (id)
      `
    );

  if (authorFilter && authorFilter !== "all") {
    query = query.eq("author", authorFilter);
  }

  // Tri
  if (sortBy === "title") {
    query = query.order("title", { ascending: true });
  } else if (sortBy === "scenes") {
    // Pour le tri par nombre de scènes, on récupère tout et on trie après
    query = query.order("title", { ascending: true });
  } else {
    // Pour la maîtrise, on trie aussi après
    query = query.order("title", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  let works = data.map((work: any) => ({
    id: work.id,
    title: work.title,
    author: work.author,
    summary: work.summary,
    scenesCount: Array.isArray(work.scenes) ? work.scenes.length : 0,
  }));

  // Tri par nombre de scènes ou maîtrise (fait après car nécessite le calcul)
  if (sortBy === "scenes") {
    works = works.sort((a, b) => b.scenesCount - a.scenesCount);
  }

  return works;
}

export async function searchWorks(
  searchQuery: string,
  authorFilter?: string,
  sortBy: "title" | "scenes" | "mastery" = "title"
): Promise<(Work & { scenesCount: number })[]> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return fetchWorks(authorFilter, sortBy);
  }

  const supabase = await createSupabaseServerClient();
  const searchTerm = `%${searchQuery.trim()}%`;
  
  let query = supabase
    .from("works")
    .select(
      `
      id,
      title,
      author,
      summary,
      scenes (id)
      `
    )
    .or(`title.ilike.${searchTerm},author.ilike.${searchTerm}`);

  if (authorFilter && authorFilter !== "all") {
    query = query.eq("author", authorFilter);
  }

  if (sortBy === "title") {
    query = query.order("title", { ascending: true });
  } else {
    query = query.order("title", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  let works = data.map((work: any) => ({
    id: work.id,
    title: work.title,
    author: work.author,
    summary: work.summary,
    scenesCount: Array.isArray(work.scenes) ? work.scenes.length : 0,
  }));

  if (sortBy === "scenes") {
    works = works.sort((a, b) => b.scenesCount - a.scenesCount);
  }

  return works;
}

export async function fetchWorkWithScenes(workId: string): Promise<WorkWithScenes | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("works")
    .select(
      `
      id,
      title,
      author,
      summary,
      scenes (
        id,
        work_id,
        title,
        author,
        summary,
        chapter
      )
      `
    )
    .eq("id", workId)
    .single<WorkQueryResult>();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    summary: data.summary,
    scenes: (data.scenes ?? []).map((scene: any) => ({
      id: scene.id,
      work_id: scene.work_id,
      title: scene.title,
      author: scene.author,
      summary: scene.summary,
      chapter: scene.chapter,
    })),
  };
}

export async function fetchWorkWithScenesAndStats(
  workId: string,
  userId?: string
): Promise<(WorkWithScenes & { scenes: (Scene & { average?: number; charactersCount: number; linesCount: number; lastCharacterId?: string | null; lastCharacterName?: string | null })[] }) | null> {
  const supabase = await createSupabaseServerClient();

  // Récupérer l'œuvre avec ses scènes
  const { data: workData, error: workError } = await supabase
    .from("works")
    .select(
      `
      id,
      title,
      author,
      summary,
      scenes (
        id,
        work_id,
        title,
        author,
        summary,
        chapter
      )
      `
    )
    .eq("id", workId)
    .single<WorkQueryResult>();

  if (workError || !workData) {
    console.error(workError);
    return null;
  }

  const scenes = workData.scenes ?? [];

  // Récupérer les statistiques pour chaque scène
  const scenesWithStats = await Promise.all(
    scenes.map(async (scene: any) => {
      // Compter les personnages
      const { count: charactersCount } = await supabase
        .from("characters")
        .select("*", { count: "exact", head: true })
        .eq("scene_id", scene.id);

      // Compter les répliques
      const { count: linesCount } = await supabase
        .from("lines")
        .select("*", { count: "exact", head: true })
        .eq("scene_id", scene.id);

      // Calculer la moyenne et récupérer le dernier personnage si l'utilisateur est connecté
      let average: number | undefined;
      let lastCharacterId: string | null = null;
      let lastCharacterName: string | null = null;
      if (userId) {
        // Sessions terminées: même métrique que "Score moyen" (pondérée par récence)
        const { data: sessions } = await supabase
          .from("user_learning_sessions")
          .select("started_at, average_score, ended_at, completed_lines, characters(id, name)")
          .eq("user_id", userId)
          .eq("scene_id", scene.id)
          .not("ended_at", "is", null)
          .gt("completed_lines", 0)
          .order("started_at", { ascending: false })
          .returns<
            {
              started_at: string;
              average_score: number | null;
              ended_at: string | null;
              completed_lines: number | null;
              characters: { id: string; name: string } | null;
            }[]
          >();

        if (sessions && sessions.length > 0) {
          const avg = weightedAverageScoreByRecency(
            sessions.map((s) => ({ started_at: s.started_at, average_score: s.average_score })),
            14
          );
          average = Math.round(avg * 100) / 100;

          const last = sessions[0]?.characters;
          lastCharacterId = last?.id ?? null;
          lastCharacterName = last?.name ?? null;
        }
      }

      return {
        id: scene.id,
        work_id: scene.work_id,
        title: scene.title,
        author: scene.author,
        summary: scene.summary,
        chapter: scene.chapter,
        average,
        charactersCount: charactersCount ?? 0,
        linesCount: linesCount ?? 0,
        lastCharacterId,
        lastCharacterName,
      };
    })
  );

  return {
    id: workData.id,
    title: workData.title,
    author: workData.author,
    summary: workData.summary,
    scenes: scenesWithStats,
  };
}

export async function fetchUserWorkAverages(userId: string): Promise<WorkAverage[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_learning_sessions")
    .select("started_at, average_score, ended_at, completed_lines, scenes ( work_id )")
    .eq("user_id", userId)
    .not("ended_at", "is", null)
    .gt("completed_lines", 0)
    .order("started_at", { ascending: false })
    .returns<
      {
        started_at: string;
        average_score: number | null;
        ended_at: string | null;
        completed_lines: number | null;
        scenes: { work_id: string | null } | null;
      }[]
    >();

  if (error || !data) {
    console.error(error);
    return [];
  }

  const grouped = new Map<string, { points: { started_at: string; average_score: number | null }[] }>();
  for (const row of data) {
    const workId = row.scenes?.work_id;
    if (!workId) continue;
    const entry = grouped.get(workId) ?? { points: [] };
    entry.points.push({ started_at: row.started_at, average_score: row.average_score });
    grouped.set(workId, entry);
  }

  return Array.from(grouped.entries()).map(([workId, { points }]) => {
    const avg = weightedAverageScoreByRecency(points, 14);
    return { workId, average: Math.round(avg * 100) / 100 };
  });
}

/**
 * Récupère les IDs des œuvres qui ont des scènes actives (en cours de travail) pour un utilisateur
 */
export async function fetchWorksWithActiveScenes(userId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_feedback")
    .select("lines!inner(scene_id, scenes!inner(work_id))")
    .eq("user_id", userId)
    .returns<{ lines: { scene_id: string; scenes: { work_id: string | null } | null } | null }[]>();

  if (error || !data) {
    console.error(error);
    return new Set();
  }

  const workIds = new Set<string>();
  for (const row of data) {
    const workId = row.lines?.scenes?.work_id;
    if (workId) {
      workIds.add(workId);
    }
  }

  return workIds;
}






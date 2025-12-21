import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Scene, Work, WorkWithScenes } from "@/types/scenes";

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

export async function fetchWorks(): Promise<(Work & { scenesCount: number })[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  return data.map((work: any) => ({
    id: work.id,
    title: work.title,
    author: work.author,
    summary: work.summary,
    scenesCount: Array.isArray(work.scenes) ? work.scenes.length : 0,
  }));
}

export async function searchWorks(query: string): Promise<(Work & { scenesCount: number })[]> {
  if (!query || query.trim().length === 0) {
    return fetchWorks();
  }

  const supabase = await createSupabaseServerClient();
  const searchTerm = `%${query.trim()}%`;
  
  const { data, error } = await supabase
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
    .or(`title.ilike.${searchTerm},author.ilike.${searchTerm}`)
    .order("title", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  if (!data) return [];

  return data.map((work: any) => ({
    id: work.id,
    title: work.title,
    author: work.author,
    summary: work.summary,
    scenesCount: Array.isArray(work.scenes) ? work.scenes.length : 0,
  }));
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
): Promise<(WorkWithScenes & { scenes: (Scene & { average?: number; charactersCount: number; linesCount: number })[] }) | null> {
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

      // Calculer la moyenne si l'utilisateur est connecté
      let average: number | undefined;
      if (userId) {
        const { data: feedbackData } = await supabase
          .from("user_line_feedback")
          .select("score, lines!inner(scene_id)")
          .eq("user_id", userId)
          .eq("lines.scene_id", scene.id);

        if (feedbackData && feedbackData.length > 0) {
          const sum = feedbackData.reduce((acc, f) => acc + f.score, 0);
          average = Math.round((sum / feedbackData.length) * 100) / 100;
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
    .from("user_line_feedback")
    .select("score, lines!inner(scene_id, scenes!inner(work_id))")
    .eq("user_id", userId)
    .returns<{ score: number; lines: { scene_id: string; scenes: { work_id: string | null } | null } | null }[]>();

  if (error || !data) {
    console.error(error);
    return [];
  }

  const grouped = new Map<string, { sum: number; count: number }>();

  for (const row of data) {
    const workId = row.lines?.scenes?.work_id;
    if (!workId) continue;

    const entry = grouped.get(workId) ?? { sum: 0, count: 0 };
    grouped.set(workId, {
      sum: entry.sum + row.score,
      count: entry.count + 1,
    });
  }

  return Array.from(grouped.entries()).map(([workId, { sum, count }]) => ({
    workId,
    average: count ? Math.round((sum / count) * 100) / 100 : 0,
  }));
}


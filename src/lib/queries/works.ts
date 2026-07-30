import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabasePublicClient } from "@/lib/supabase-public";
import { Scene, Work, WorkWithScenes } from "@/types/scenes";
import { weightedAverageScoreByRecency } from "@/lib/utils/score";
import { sortScenesDramaturgical } from "@/lib/utils/scene-order";
import { slugify } from "@/lib/utils/slugify";

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
      slug,
      scenes!inner (id)
      `
    )
    .eq("is_public_domain", true)
    .eq("scenes.is_private", false);

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
    slug: work.slug,
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
      slug,
      scenes!inner (id)
      `
    )
    .eq("is_public_domain", true)
    .eq("scenes.is_private", false)
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
    slug: work.slug,
    scenesCount: Array.isArray(work.scenes) ? work.scenes.length : 0,
  }));

  if (sortBy === "scenes") {
    works = works.sort((a, b) => b.scenesCount - a.scenesCount);
  }

  return works;
}

export type PublicWorkWithScenes = {
  id: string;
  title: string;
  author: string | null;
  summary: string | null;
  slug: string;
  scenes: { id: string; title: string; chapter: string | null; slug: string }[];
};

/**
 * Œuvre du domaine public résolue par son slug, avec ses scènes publiques déjà
 * sluggées, dans l'ordre dramaturgique.
 *
 * Portée volontairement identique au sitemap et à la route scène : `is_public_domain`,
 * `is_private = false`, `slug` non nul des deux côtés. Une œuvre qui ne satisfait pas
 * ces conditions n'a pas de page indexable, la route renvoie 404.
 */
export async function fetchPublicWorkBySlug(workSlug: string): Promise<PublicWorkWithScenes | null> {
  // Catalogue du domaine public : aucune session en jeu, donc client sans cookies —
  // c'est ce qui rend la page œuvre cachable (cf. @/lib/supabase-public).
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("works")
    .select("id, title, author, summary, slug, scenes(id, title, chapter, slug, is_private)")
    .eq("slug", workSlug)
    .eq("is_public_domain", true)
    .maybeSingle<{
      id: string;
      title: string;
      author: string | null;
      summary: string | null;
      slug: string;
      scenes: { id: string; title: string; chapter: string | null; slug: string | null; is_private: boolean }[];
    }>();

  if (error) {
    console.error(error);
    return null;
  }
  if (!data) return null;

  const scenes = (data.scenes ?? [])
    .filter((s): s is typeof s & { slug: string } => !s.is_private && !!s.slug)
    .map(({ id, title, chapter, slug }) => ({ id, title, chapter, slug }));

  // Une œuvre sans aucune scène publiable n'a rien à afficher ni à indexer.
  if (scenes.length === 0) return null;

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    summary: data.summary,
    slug: data.slug,
    scenes: sortScenesDramaturgical(scenes),
  };
}

/**
 * Chemin canonique de la page œuvre correspondant à un UUID d'œuvre, ou null si
 * l'œuvre n'a pas de page indexable (hors domaine public, ou pas encore sluggée).
 *
 * Sert au 308 de /works/[id] : cette route était indexable sur URL UUID, sans
 * canonical, avec le title du layout racine, et recevait les 22 liens de la page
 * liste. Un seul SELECT, pas de chargement de scènes ni de stats.
 */
export async function fetchWorkCanonicalPath(workId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("works")
    .select("slug, author, is_public_domain")
    .eq("id", workId)
    .maybeSingle<{ slug: string | null; author: string | null; is_public_domain: boolean | null }>();

  if (error) {
    console.error(error);
    return null;
  }
  if (!data?.slug || data.is_public_domain !== true) return null;

  return `/scenes/${slugify(data.author ?? "")}/${data.slug}`;
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
    // Ordre dramaturgique (acte puis scène), pas l'ordre d'insertion en base.
    scenes: sortScenesDramaturgical(
      (data.scenes ?? []).map((scene: any) => ({
        id: scene.id,
        work_id: scene.work_id,
        title: scene.title,
        author: scene.author,
        summary: scene.summary,
        chapter: scene.chapter,
      }))
    ),
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

  if (scenes.length === 0) {
    return {
      id: workData.id,
      title: workData.title,
      author: workData.author,
      summary: workData.summary,
      scenes: [],
    };
  }

  type SessionRow = {
    scene_id: string;
    started_at: string;
    average_score: number | null;
    ended_at: string | null;
    completed_lines: number | null;
    characters: { id: string; name: string } | null;
  };

  const sceneIds = scenes.map((s: any) => s.id as string);

  // 3 requêtes batch au lieu de 2N–3N requêtes individuelles
  const [charsRes, linesRes, sessionsRes] = await Promise.all([
    supabase.from("characters").select("scene_id").in("scene_id", sceneIds),
    supabase.from("lines").select("scene_id").in("scene_id", sceneIds),
    userId
      ? supabase
          .from("user_learning_sessions")
          .select("scene_id, started_at, average_score, ended_at, completed_lines, characters(id, name)")
          .eq("user_id", userId)
          .in("scene_id", sceneIds)
          .not("ended_at", "is", null)
          .gt("completed_lines", 0)
          .order("started_at", { ascending: false })
          .returns<SessionRow[]>()
      : Promise.resolve({ data: [] as SessionRow[], error: null }),
  ]);

  const charCountByScene = (charsRes.data ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.scene_id] = (acc[c.scene_id] ?? 0) + 1;
    return acc;
  }, {});

  const lineCountByScene = (linesRes.data ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.scene_id] = (acc[l.scene_id] ?? 0) + 1;
    return acc;
  }, {});

  const sessionsByScene = (sessionsRes.data ?? []).reduce<Record<string, SessionRow[]>>((acc, s) => {
    if (!acc[s.scene_id]) acc[s.scene_id] = [];
    acc[s.scene_id].push(s);
    return acc;
  }, {});

  const scenesWithStats = scenes.map((scene: any) => {
    const sessions = sessionsByScene[scene.id] ?? [];
    let average: number | undefined;
    let lastCharacterId: string | null = null;
    let lastCharacterName: string | null = null;

    if (sessions.length > 0) {
      const avg = weightedAverageScoreByRecency(
        sessions.map((s) => ({ started_at: s.started_at, average_score: s.average_score })),
        14
      );
      average = Math.round(avg * 100) / 100;
      const last = sessions[0]?.characters;
      lastCharacterId = last?.id ?? null;
      lastCharacterName = last?.name ?? null;
    }

    return {
      id: scene.id,
      work_id: scene.work_id,
      title: scene.title,
      author: scene.author,
      summary: scene.summary,
      chapter: scene.chapter,
      average,
      charactersCount: charCountByScene[scene.id] ?? 0,
      linesCount: lineCountByScene[scene.id] ?? 0,
      lastCharacterId,
      lastCharacterName,
    };
  });

  return {
    id: workData.id,
    title: workData.title,
    author: workData.author,
    summary: workData.summary,
    // Ordre dramaturgique (acte puis scène), pas l'ordre d'insertion en base.
    scenes: sortScenesDramaturgical(scenesWithStats),
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






/**
 * Slugs des œuvres publiables, pour le prérendu des pages œuvre au build.
 * Même portée que le sitemap : domaine public, sluggée, avec au moins une scène
 * publique sluggée — sinon la route 404 et on prérendrait une page morte.
 */
export async function fetchPublicWorkSlugs(): Promise<{ slug: string; author: string | null }[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("works")
    .select("slug, author, scenes!inner(id)")
    .eq("is_public_domain", true)
    .not("slug", "is", null)
    .eq("scenes.is_private", false)
    .not("scenes.slug", "is", null)
    .returns<{ slug: string; author: string | null }[]>();

  if (error) {
    console.error("fetchPublicWorkSlugs", error);
    return [];
  }
  // `!inner` renvoie une ligne par scène : on dédoublonne sur le slug d'œuvre.
  return [...new Map((data ?? []).map((w) => [w.slug, w])).values()];
}

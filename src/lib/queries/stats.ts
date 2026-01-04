import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LearningSession, LineMasteryPoint, SceneStats, TimeSeriesDataPoint, UserStatsSummary } from "@/types/stats";

export async function trackSessionStart(
  userId: string,
  sceneId: string,
  characterId: string,
  totalLines: number
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_learning_sessions")
    .insert({
      user_id: userId,
      scene_id: sceneId,
      character_id: characterId,
      total_lines: totalLines,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error tracking session start:", error);
    return null;
  }

  return data?.id ?? null;
}

export async function trackSessionEnd(
  sessionId: string,
  completedLines: number,
  averageScore: number
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const session = await supabase
    .from("user_learning_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .single();

  if (!session.data) {
    console.error("Session not found");
    return false;
  }

  const startedAt = new Date(session.data.started_at);
  const endedAt = new Date();
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

  const { error } = await supabase
    .from("user_learning_sessions")
    .update({
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      completed_lines: completedLines,
      average_score: averageScore,
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Error tracking session end:", error);
    return false;
  }

  return true;
}

export async function fetchUserStatsSummary(userId: string): Promise<UserStatsSummary> {
  const supabase = await createSupabaseServerClient();

  // Récupérer toutes les sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("user_learning_sessions")
    .select("duration_seconds, average_score, started_at, scene_id")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (sessionsError || !sessions) {
    console.error("Error fetching sessions:", sessionsError);
    return {
      totalSessions: 0,
      totalTimeMinutes: 0,
      totalScenesWorked: 0,
      averageScore: 0,
      currentStreak: 0,
      lastActivityDate: null,
    };
  }

  const totalSessions = sessions.length;
  const totalTimeMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60
  );
  const uniqueScenes = new Set(sessions.map((s) => s.scene_id)).size;
  const scores = sessions.filter((s) => s.average_score !== null).map((s) => s.average_score!);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Calculer le streak
  let currentStreak = 0;
  let lastActivityDate: string | null = null;
  if (sessions.length > 0) {
    lastActivityDate = sessions[0].started_at;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activityDates = new Set<string>();
    sessions.forEach((s) => {
      const date = new Date(s.started_at);
      date.setHours(0, 0, 0, 0);
      activityDates.add(date.toISOString().split("T")[0]);
    });

    const sortedDates = Array.from(activityDates)
      .map((d) => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    let checkDate = new Date(today);
    for (const activityDate of sortedDates) {
      const activityDateStr = activityDate.toISOString().split("T")[0];
      const checkDateStr = checkDate.toISOString().split("T")[0];
      if (activityDateStr === checkDateStr) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (currentStreak > 0) {
        break;
      }
    }
  }

  return {
    totalSessions,
    totalTimeMinutes,
    totalScenesWorked: uniqueScenes,
    averageScore: Math.round(averageScore * 100) / 100,
    currentStreak,
    lastActivityDate,
  };
}

export async function fetchSceneStats(userId: string, sceneId: string): Promise<SceneStats | null> {
  const supabase = await createSupabaseServerClient();

  // Récupérer toutes les sessions pour cette scène
  const { data: sessions, error: sessionsError } = await supabase
    .from("user_learning_sessions")
    .select(
      `
      id,
      started_at,
      ended_at,
      duration_seconds,
      completed_lines,
      average_score,
      character_id,
      characters ( name )
    `
    )
    .eq("user_id", userId)
    .eq("scene_id", sceneId)
    .order("started_at", { ascending: false });

  if (sessionsError || !sessions) {
    console.error("Error fetching scene sessions:", sessionsError);
    return null;
  }

  if (sessions.length === 0) {
    return {
      sceneId,
      totalSessions: 0,
      totalTimeMinutes: 0,
      totalLinesLearned: 0,
      averageScore: 0,
      scoreEvolution: [],
      recentSessions: [],
    };
  }

  const totalSessions = sessions.length;
  const totalTimeMinutes = Math.round(
    sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60
  );
  const totalLinesLearned = sessions.reduce((acc, s) => acc + (s.completed_lines ?? 0), 0);
  const scores = sessions.filter((s) => s.average_score !== null).map((s) => s.average_score!);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  // Évolution des scores (par session, ordre chronologique)
  const scoreEvolution: TimeSeriesDataPoint[] = sessions
    .filter((s) => s.average_score !== null)
    .map((s) => ({
      date: new Date(s.started_at).toISOString().split("T")[0],
      value: s.average_score!,
      label: new Date(s.started_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
    }))
    .reverse(); // Ordre chronologique

  // Sessions récentes (5 dernières)
  const recentSessions = sessions.slice(0, 5).map((s) => ({
    date: new Date(s.started_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    durationMinutes: Math.round((s.duration_seconds ?? 0) / 60),
    score: s.average_score ?? 0,
    characterName: (s.characters as any)?.name ?? "—",
  }));

  return {
    sceneId,
    totalSessions,
    totalTimeMinutes,
    totalLinesLearned,
    averageScore: Math.round(averageScore * 100) / 100,
    scoreEvolution,
    recentSessions,
  };
}

export async function fetchLineMastery(
  userId: string,
  sceneId: string,
  characterId: string,
  halfLifeDays = 14
): Promise<LineMasteryPoint[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_line_feedback")
    .select(
      `
      score,
      created_at,
      lines!inner (
        id,
        order,
        text,
        scene_id,
        character_id
      )
    `
    )
    .eq("user_id", userId)
    .eq("lines.scene_id", sceneId)
    .eq("lines.character_id", characterId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching line mastery:", error);
    return [];
  }

  const now = Date.now();
  const halfLifeSeconds = halfLifeDays * 24 * 60 * 60;
  const lambda = Math.log(2) / halfLifeSeconds;

  const agg = new Map<
    string,
    { order: number; text: string; attempts: number; sumW: number; sumWS: number }
  >();

  for (const row of data as any[]) {
    const line = row.lines;
    if (!line?.id || typeof line.order !== "number" || typeof row.score !== "number") continue;
    const createdAt = typeof row.created_at === "string" ? new Date(row.created_at).getTime() : NaN;
    const deltaSeconds = Number.isFinite(createdAt) ? (now - createdAt) / 1000 : 0;
    const w = Math.exp(-lambda * Math.max(0, deltaSeconds));

    const prev = agg.get(line.id);
    if (!prev) {
      agg.set(line.id, {
        order: line.order,
        text: line.text ?? "",
        attempts: 1,
        sumW: w,
        sumWS: w * row.score,
      });
    } else {
      agg.set(line.id, {
        order: prev.order,
        text: prev.text,
        attempts: prev.attempts + 1,
        sumW: prev.sumW + w,
        sumWS: prev.sumWS + w * row.score,
      });
    }
  }

  const points: LineMasteryPoint[] = Array.from(agg.entries()).map(([lineId, v]) => ({
    lineId,
    order: v.order,
    userIndex: 0, // rempli après tri
    text: v.text,
    attempts: v.attempts,
    mastery: v.sumW > 0 ? v.sumWS / v.sumW : 0,
  }));

  points.sort((a, b) => a.order - b.order);
  for (let i = 0; i < points.length; i += 1) {
    points[i].userIndex = i + 1;
  }
  return points;
}





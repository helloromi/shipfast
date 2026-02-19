import { createSupabaseServerClient } from "@/lib/supabase-server";
import { LearningSession, LineMasteryPoint, SceneStats, TimeSeriesDataPoint, UserStatsSummary } from "@/types/stats";
import { normalizeScore, weightedAverageScoreByRecency } from "@/lib/utils/score";

type SessionWithScoreAndStart = {
  started_at: string;
  average_score: number | null;
};

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
    .select("duration_seconds, average_score, started_at, scene_id, ended_at, completed_lines")
    .eq("user_id", userId)
    // Ne compter que les sessions terminées et où au moins 1 réplique a été notée.
    .not("ended_at", "is", null)
    .gt("completed_lines", 0)
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
  const averageScore = weightedAverageScoreByRecency(sessions as any, 14);

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
    // Ne compter que les sessions terminées et où au moins 1 réplique a été notée.
    .not("ended_at", "is", null)
    .gt("completed_lines", 0)
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

  // Compter les répliques uniques effectivement travaillées (pas la somme cumulée des sessions)
  const { data: feedbackLines } = await supabase
    .from("user_line_feedback")
    .select("line_id, lines!inner(scene_id)")
    .eq("user_id", userId)
    .eq("lines.scene_id", sceneId);
  const totalLinesLearned = new Set((feedbackLines ?? []).map((f: any) => f.line_id as string)).size;

  const averageScore = weightedAverageScoreByRecency(sessions as any, 14);

  // Évolution des scores (agrégée par jour pour éviter plusieurs points avec la même date)
  const byDay = new Map<string, { sum: number; count: number }>();
  for (const s of sessions) {
    if (s.average_score === null || s.average_score === undefined) continue;
    const normalized = normalizeScore(s.average_score);
    const dayKey = new Date(s.started_at).toISOString().split("T")[0]; // YYYY-MM-DD
    const prev = byDay.get(dayKey) ?? { sum: 0, count: 0 };
    byDay.set(dayKey, { sum: prev.sum + normalized, count: prev.count + 1 });
  }

  const scoreEvolution: TimeSeriesDataPoint[] = Array.from(byDay.entries())
    .map(([dayKey, v]) => {
      const dateObj = new Date(dayKey);
      return {
        date: dayKey,
        value: v.count ? v.sum / v.count : 0,
        label: dateObj.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date)); // ordre chronologique

  // Sessions récentes (5 dernières)
  const recentSessions = sessions.slice(0, 5).map((s) => ({
    date: new Date(s.started_at).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    durationMinutes: Math.round((s.duration_seconds ?? 0) / 60),
    score: s.average_score !== null ? normalizeScore(s.average_score) : 0,
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
    const normalizedScore = normalizeScore(row.score);
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
        sumWS: w * normalizedScore,
      });
    } else {
      agg.set(line.id, {
        order: prev.order,
        text: prev.text,
        attempts: prev.attempts + 1,
        sumW: prev.sumW + w,
        sumWS: prev.sumWS + w * normalizedScore,
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





import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";
import { weightedAverageScoreByRecency } from "@/lib/utils/score";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireAuth(request, null, {
      skipCsrf: true,
      requireAdmin: true,
    });
    if (!auth.ok) return auth.response;

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    const { data: sessions, error: sessionsError } = await admin
      .from("user_learning_sessions")
      .select(
        "id, started_at, ended_at, duration_seconds, average_score, completed_lines, scene_id, character_id, characters(name)"
      )
      .eq("user_id", userId)
      .not("ended_at", "is", null)
      .gt("completed_lines", 0)
      .order("started_at", { ascending: false })
      .limit(200);

    if (sessionsError) {
      console.error("Error fetching user sessions:", sessionsError);
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 }
      );
    }

    const sessionsList = sessions ?? [];
    const totalSessions = sessionsList.length;
    const totalTimeMinutes = Math.round(
      sessionsList.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60
    );
    const uniqueScenes = new Set(sessionsList.map((s) => s.scene_id)).size;
    const averageScore =
      sessionsList.length > 0
        ? weightedAverageScoreByRecency(sessionsList as any, 14)
        : 0;
    let currentStreak = 0;
    let lastActivityDate: string | null = null;

    if (sessionsList.length > 0) {
      lastActivityDate = sessionsList[0].started_at;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activityDates = new Set<string>();
      sessionsList.forEach((s) => {
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
        } else if (currentStreak > 0) break;
      }
    }

    const getCharacterName = (c: unknown): string => {
      if (c && typeof c === "object" && "name" in c && typeof (c as { name: unknown }).name === "string") {
        return (c as { name: string }).name;
      }
      if (Array.isArray(c) && c[0] && typeof c[0] === "object" && "name" in c[0]) {
        return String((c[0] as { name: unknown }).name ?? "—");
      }
      return "—";
    };

    const recentSessions = sessionsList.slice(0, 20).map((s) => ({
      id: s.id,
      date: s.started_at,
      durationMinutes: Math.round((s.duration_seconds ?? 0) / 60),
      score: s.average_score ?? 0,
      characterName: getCharacterName(s.characters),
    }));

    const { data: sub } = await admin
      .from("billing_subscriptions")
      .select("status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      summary: {
        totalSessions,
        totalTimeMinutes,
        totalScenesWorked: uniqueScenes,
        averageScore: Math.round(averageScore * 100) / 100,
        currentStreak,
        lastActivityDate,
      },
      recentSessions,
      subscription: sub
        ? {
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        : null,
    });
  } catch (err) {
    console.error("Error in admin user activity:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

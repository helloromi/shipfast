import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

const DAILY_DAYS = 30;
const WEEKLY_WEEKS = 12;

function getStartOfWeek(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, null, {
      skipCsrf: true,
      requireAdmin: true,
    });
    if (!auth.ok) return auth.response;

    const admin = createSupabaseAdminClient();
    const now = new Date();
    const dailyStart = new Date(now);
    dailyStart.setDate(dailyStart.getDate() - DAILY_DAYS);
    const weeklyStart = new Date(now);
    weeklyStart.setDate(weeklyStart.getDate() - WEEKLY_WEEKS * 7);

    const { data: sessions, error } = await admin
      .from("user_learning_sessions")
      .select("user_id, started_at")
      .gte("started_at", weeklyStart.toISOString())
      .not("started_at", "is", null);

    if (error) {
      console.error("Error fetching activity:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity" },
        { status: 500 }
      );
    }

    const dailyMap = new Map<string, Set<string>>();
    const weeklyMap = new Map<string, Set<string>>();

    for (const row of sessions ?? []) {
      const startedAt = row.started_at as string;
      const d = new Date(startedAt);
      const dateKey = d.toISOString().split("T")[0];
      const weekKey = getStartOfWeek(d);

      if (d >= dailyStart) {
        if (!dailyMap.has(dateKey)) dailyMap.set(dateKey, new Set());
        dailyMap.get(dateKey)!.add(row.user_id as string);
      }
      if (d >= weeklyStart) {
        if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, new Set());
        weeklyMap.get(weekKey)!.add(row.user_id as string);
      }
    }

    const daily: { date: string; count: number; label?: string }[] = [];
    for (let i = DAILY_DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      daily.push({
        date: key,
        count: dailyMap.get(key)?.size ?? 0,
        label: key.slice(5),
      });
    }

    const weekly: { period: string; count: number; label?: string }[] = [];
    for (let w = WEEKLY_WEEKS - 1; w >= 0; w--) {
      const d = new Date(now);
      d.setDate(d.getDate() - w * 7);
      const key = getStartOfWeek(d);
      weekly.push({
        period: key,
        count: weeklyMap.get(key)?.size ?? 0,
        label: `S${key}`,
      });
    }

    return NextResponse.json({ daily, weekly });
  } catch (err) {
    console.error("Error in admin dashboard activity:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

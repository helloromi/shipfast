import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

const DAYS = 30;
const WEEKS = 12;
const MONTHS = 12;

function getStartOfWeek(d: Date): string {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

function getStartOfMonth(d: Date): string {
  return d.toISOString().slice(0, 7) + "-01";
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, null, {
      skipCsrf: true,
      requireAdmin: true,
    });
    if (!auth.ok) return auth.response;

    const groupBy = request.nextUrl.searchParams.get("groupBy") ?? "day";
    const validGroupBy = groupBy === "day" || groupBy === "week" || groupBy === "month" ? groupBy : "day";

    const admin = createSupabaseAdminClient();

    const [{ count, error: countError }, ctaResult] = await Promise.all([
      admin.from("landing_page_views").select("id", { count: "exact", head: true }),
      Promise.resolve(
        admin.from("landing_cta_clicks").select("id", { count: "exact", head: true })
      ).catch(() => ({ count: 0, error: null, data: null })),
    ]);
    const ctaCount = ctaResult?.error ? 0 : (ctaResult?.count ?? 0);

    if (countError) {
      console.error("Error fetching landing views count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch landing views" },
        { status: 500 }
      );
    }

    const now = new Date();
    let startDate: Date;
    let periodKeys: string[] = [];

    if (validGroupBy === "day") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - DAYS);
      for (let i = DAYS - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        periodKeys.push(d.toISOString().split("T")[0]);
      }
    } else if (validGroupBy === "week") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - WEEKS * 7);
      for (let w = WEEKS - 1; w >= 0; w--) {
        const d = new Date(now);
        d.setDate(d.getDate() - w * 7);
        periodKeys.push(getStartOfWeek(d));
      }
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth() - MONTHS, 1);
      for (let m = MONTHS - 1; m >= 0; m--) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
        periodKeys.push(getStartOfMonth(d));
      }
    }

    const [{ data: viewRows, error: listError }, ctaListResult] = await Promise.all([
      admin.from("landing_page_views").select("viewed_at").gte("viewed_at", startDate.toISOString()),
      Promise.resolve(
        admin.from("landing_cta_clicks").select("clicked_at").gte("clicked_at", startDate.toISOString())
      ).catch(() => ({ data: [] as { clicked_at: string }[], error: null })),
    ]);
    const ctaRows = ctaListResult?.error ? [] : (ctaListResult?.data ?? []);

    if (listError) {
      console.error("Error fetching landing views:", listError);
      return NextResponse.json(
        { error: "Failed to fetch landing views" },
        { status: 500 }
      );
    }

    const countByPeriod = new Map<string, number>();
    const ctaCountByPeriod = new Map<string, number>();
    for (const key of periodKeys) {
      countByPeriod.set(key, 0);
      ctaCountByPeriod.set(key, 0);
    }

    for (const row of viewRows ?? []) {
      const viewedAt = row.viewed_at as string;
      const d = new Date(viewedAt);
      let key: string;
      if (validGroupBy === "day") {
        key = d.toISOString().split("T")[0];
      } else if (validGroupBy === "week") {
        key = getStartOfWeek(d);
      } else {
        key = getStartOfMonth(d);
      }
      if (countByPeriod.has(key)) {
        countByPeriod.set(key, (countByPeriod.get(key) ?? 0) + 1);
      }
    }

    for (const row of ctaRows ?? []) {
      const clickedAt = row.clicked_at as string;
      const d = new Date(clickedAt);
      let key: string;
      if (validGroupBy === "day") {
        key = d.toISOString().split("T")[0];
      } else if (validGroupBy === "week") {
        key = getStartOfWeek(d);
      } else {
        key = getStartOfMonth(d);
      }
      if (ctaCountByPeriod.has(key)) {
        ctaCountByPeriod.set(key, (ctaCountByPeriod.get(key) ?? 0) + 1);
      }
    }

    const series = periodKeys.map((period) => ({
      period,
      count: countByPeriod.get(period) ?? 0,
      ctaClicks: ctaCountByPeriod.get(period) ?? 0,
    }));

    return NextResponse.json({
      total: count ?? 0,
      ctaClicksTotal: ctaCount,
      series,
    });
  } catch (err) {
    console.error("Error in admin landing-views:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

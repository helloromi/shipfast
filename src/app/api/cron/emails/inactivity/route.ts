import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertCronAuth } from "@/lib/utils/cron";
import { sendInactivityEmailIfNeeded } from "@/lib/resend/automation";

type InactivityCandidate = {
  user_id: string;
  email: string | null;
  last_activity_at: string | null;
};

export async function POST(request: NextRequest) {
  const auth = assertCronAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const days = Number(request.nextUrl.searchParams.get("days") ?? "7");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "500");

  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  const cutoff = new Date(cutoffMs).toISOString();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("get_inactive_users_for_email", {
      p_cutoff: cutoff,
      p_limit: Number.isFinite(limit) ? limit : 500,
    });
    if (error) throw error;

    const rows = (data ?? []) as InactivityCandidate[];
    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const r of rows) {
      if (!r.last_activity_at) {
        skipped += 1;
        continue;
      }
      const result = await sendInactivityEmailIfNeeded({
        userId: r.user_id,
        lastActivityAt: r.last_activity_at,
        inactivityDays: days,
      }).catch((e) => {
        errors += 1;
        return { sent: false as const, reason: "exception" as const, error: e instanceof Error ? e.message : String(e) };
      });
      if (result.sent) sent += 1;
      else skipped += 1;
    }

    return NextResponse.json({ ok: true, days, cutoff, candidates: rows.length, sent, skipped, errors });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


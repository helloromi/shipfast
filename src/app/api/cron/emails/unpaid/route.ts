import { NextRequest, NextResponse } from "next/server";

import { assertCronAuth } from "@/lib/utils/cron";
import { sendUnpaidReminder1Email } from "@/lib/resend/automation";

type UnpaidCandidate = {
  user_id: string;
  email: string | null;
  auth_created_at: string | null;
};

export async function POST(request: NextRequest) {
  const auth = assertCronAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "500");

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("get_unpaid_users_for_reminder", {
      p_cutoff: cutoff,
      p_limit: Number.isFinite(limit) ? limit : 500,
    });
    if (error) throw error;

    const rows = (data ?? []) as UnpaidCandidate[];
    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const r of rows) {
      const userId = r.user_id;
      const result = await sendUnpaidReminder1Email(userId).catch((e) => {
        errors += 1;
        return { sent: false as const, reason: "exception" as const, error: e instanceof Error ? e.message : String(e) };
      });
      if (result.sent) sent += 1;
      else skipped += 1;
    }

    return NextResponse.json({ ok: true, cutoff, candidates: rows.length, sent, skipped, errors });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


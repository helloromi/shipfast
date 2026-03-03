import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request, null, {
      skipCsrf: true,
      requireAdmin: true,
    });
    if (!auth.ok) return auth.response;

    const admin = createSupabaseAdminClient();

    const { data: subscriptions, error: subError } = await admin
      .from("billing_subscriptions")
      .select("user_id, status, current_period_end, cancel_at_period_end")
      .order("current_period_end", { ascending: false })
      .limit(100);

    if (subError) {
      console.error("Error fetching billing:", subError);
      return NextResponse.json(
        { error: "Failed to fetch billing" },
        { status: 500 }
      );
    }

    const list = subscriptions ?? [];
    const activeCount = list.filter(
      (s) => s.status === "active" || s.status === "trialing"
    ).length;
    const cancelAtPeriodEndCount = list.filter(
      (s) => s.cancel_at_period_end === true
    ).length;

    const userIds = [...new Set(list.map((s) => s.user_id))];
    const emails = new Map<string, string>();
    await Promise.all(
      userIds.slice(0, 50).map(async (id) => {
        const { data } = await admin.auth.admin.getUserById(id);
        if (data?.user?.email) emails.set(id, data.user.email);
      })
    );

    const items = list.map((s) => ({
      userId: s.user_id,
      email: emails.get(s.user_id) ?? undefined,
      status: s.status,
      currentPeriodEnd: s.current_period_end,
      cancelAtPeriodEnd: s.cancel_at_period_end,
    }));

    return NextResponse.json({
      activeCount,
      cancelAtPeriodEndCount,
      items,
    });
  } catch (err) {
    console.error("Error in admin dashboard billing:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

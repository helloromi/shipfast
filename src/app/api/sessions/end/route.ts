import { NextRequest, NextResponse } from "next/server";
import { trackSessionEnd } from "@/lib/queries/stats";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = await getSupabaseSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`session_end:${user.id}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { sessionId, completedLines, averageScore } = body;

    if (!sessionId || completedLines === undefined || averageScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ne conserver une session que si au moins 1 réplique a été notée.
    // Si 0, on la supprime pour ne pas polluer les stats.
    if (Number(completedLines) < 1) {
      const admin = createSupabaseAdminClient();
      const { error, count } = await admin
        .from("user_learning_sessions")
        .delete({ count: "exact" })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error discarding empty session:", error);
        return NextResponse.json({ error: "Failed to discard empty session" }, { status: 500 });
      }

      return NextResponse.json({ success: true, discarded: true, deletedCount: count ?? 0 });
    }

    const success = await trackSessionEnd(sessionId, completedLines, averageScore);

    if (!success) {
      return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error ending session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}





import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/utils/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rl = checkRateLimit(`admin_purge_empty_sessions:${user.id}`, { windowMs: 60_000, max: 30 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { error, count } = await supabaseAdmin
      .from("user_learning_sessions")
      .delete({ count: "exact" })
      .eq("completed_lines", 0)
      .not("ended_at", "is", null);

    if (error) {
      console.error("Error purging empty sessions:", error);
      return NextResponse.json({ error: "Failed to purge empty sessions" }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedCount: count ?? 0 });
  } catch (error) {
    console.error("Error purging empty sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


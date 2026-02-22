import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(
      request,
      { key: (id) => `admin_purge_empty_sessions:${id}`, max: 30 },
      { requireAdmin: true }
    );
    if (!auth.ok) return auth.response;

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


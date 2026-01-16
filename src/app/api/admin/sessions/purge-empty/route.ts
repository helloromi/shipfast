import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/utils/admin";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST() {
  try {
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


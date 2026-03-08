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

    const { count, error: countError } = await admin
      .from("landing_page_views")
      .select("id", { count: "exact", head: true });

    if (countError) {
      console.error("Error fetching landing views count:", countError);
      return NextResponse.json(
        { error: "Failed to fetch landing views" },
        { status: 500 }
      );
    }

    return NextResponse.json({ total: count ?? 0 });
  } catch (err) {
    console.error("Error in admin landing-views:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

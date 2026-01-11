import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserSubscriptions, hasActiveSubscriptions } from "@/lib/queries/subscriptions";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await getUserSubscriptions(user.id);
    const hasActive = await hasActiveSubscriptions(user.id);

    return NextResponse.json({
      subscriptions,
      hasActiveSubscriptions: hasActive,
    });
  } catch (error: any) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkAccess } from "@/lib/utils/access-control";
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
      return NextResponse.json(
        {
          hasAccess: false,
          accessType: "none",
          canUseFreeSlot: false,
        },
        { status: 200 }
      );
    }

    const rl = checkRateLimit(`access_check:${user.id}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { sceneId, workId } = body;

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId is required" }, { status: 400 });
    }

    const result = await checkAccess(user, sceneId, workId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



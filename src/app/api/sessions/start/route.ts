import { NextRequest, NextResponse } from "next/server";
import { trackSessionStart } from "@/lib/queries/stats";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
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

    const rl = checkRateLimit(`session_start:${user.id}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { sceneId, characterId, totalLines } = body;

    if (!sceneId || !characterId || totalLines === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sessionId = await trackSessionStart(user.id, sceneId, characterId, totalLines);

    if (!sessionId) {
      return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error("Error starting session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}





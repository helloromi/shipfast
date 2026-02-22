import { NextRequest, NextResponse } from "next/server";
import { trackSessionStart } from "@/lib/queries/stats";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `session_start:${id}`, max: 120 });
    if (!auth.ok) return auth.response;
    const { user } = auth;

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





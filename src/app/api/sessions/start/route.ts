import { NextResponse } from "next/server";
import { trackSessionStart } from "@/lib/queries/stats";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";

export async function POST(request: Request) {
  try {
    const user = await getSupabaseSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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


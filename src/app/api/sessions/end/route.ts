import { NextResponse } from "next/server";
import { trackSessionEnd } from "@/lib/queries/stats";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";

export async function POST(request: Request) {
  try {
    const user = await getSupabaseSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, completedLines, averageScore } = body;

    if (!sessionId || completedLines === undefined || averageScore === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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


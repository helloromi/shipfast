import { NextRequest, NextResponse } from "next/server";
import { ensurePersonalSceneForCurrentUser } from "@/lib/utils/personal-scene";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sourceSceneId } = await params;
  if (!sourceSceneId) return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });

  const auth = await requireAuth(request, {
    key: (id) => `scene_fork:${id}:${sourceSceneId}`,
    max: 20,
  });
  if (!auth.ok) return auth.response;

  const result = await ensurePersonalSceneForCurrentUser(sourceSceneId);
  if (!result.ok) {
    if (result.reason === "not_found") return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    if (result.reason === "no_access") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (result.reason === "invalid_source") return NextResponse.json({ error: "Invalid source scene" }, { status: 400 });
    return NextResponse.json({ error: result.message || "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ sceneId: result.personalSceneId, success: true });
}


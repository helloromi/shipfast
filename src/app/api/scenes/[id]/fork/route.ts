import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ensurePersonalSceneForCurrentUser } from "@/lib/utils/personal-scene";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sourceSceneId } = await params;
  if (!sourceSceneId) return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });

  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Toucher le client server pour s'assurer que la session cookie est bien présente côté route.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = checkRateLimit(`scene_fork:${user.id}:${sourceSceneId}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const result = await ensurePersonalSceneForCurrentUser(sourceSceneId);
  if (!result.ok) {
    if (result.reason === "not_found") return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    if (result.reason === "no_access") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (result.reason === "invalid_source") return NextResponse.json({ error: "Invalid source scene" }, { status: 400 });
    return NextResponse.json({ error: result.message || "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ sceneId: result.personalSceneId, success: true });
}


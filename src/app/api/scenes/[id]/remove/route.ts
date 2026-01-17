import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sceneId } = await params;
  if (!sceneId) {
    return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
  }

  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await getSupabaseSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = checkRateLimit(`scene_remove:${user.id}:${sceneId}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Charger la scène pour décider si on supprime réellement ou si on réinitialise la progression.
    const { data: scene, error: sceneError } = await supabase
      .from("scenes")
      .select("id, is_private, owner_user_id")
      .eq("id", sceneId)
      .maybeSingle<{ id: string; is_private: boolean | null; owner_user_id: string | null }>();

    if (sceneError) {
      console.error("Error fetching scene:", sceneError);
      return NextResponse.json({ error: "Failed to fetch scene" }, { status: 500 });
    }

    if (!scene?.id) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const isPrivate = Boolean(scene.is_private);
    const isOwner = scene.owner_user_id === user.id;

    // Cas 1: scène privée appartenant à l'utilisateur -> suppression réelle (cascade DB).
    if (isPrivate && isOwner) {
      const { error: deleteSceneError } = await supabase.from("scenes").delete().eq("id", sceneId);
      if (deleteSceneError) {
        console.error("Error deleting scene:", deleteSceneError);
        return NextResponse.json({ error: "Failed to delete scene" }, { status: 500 });
      }

      revalidatePath("/home");
      revalidatePath("/bibliotheque");

      return NextResponse.json({ success: true, action: "deleted_scene" });
    }

    // Cas 2: scène publique (ou scène privée non possédée) -> réinitialiser la progression de l'utilisateur.
    // Récupérer tous les line_id de cette scène (peut être vide si scène corrompue/incomplète).
    const { data: lines, error: linesError } = await supabase
      .from("lines")
      .select("id")
      .eq("scene_id", sceneId)
      .returns<{ id: string }[]>();

    if (linesError) {
      console.error("Error fetching lines:", linesError);
      return NextResponse.json({ error: "Failed to fetch lines" }, { status: 500 });
    }

    const lineIds = (lines ?? []).map((line) => line.id);

    // Supprimer toutes les sessions d'apprentissage de l'utilisateur pour cette scène
    const { error: sessionsError } = await supabase
      .from("user_learning_sessions")
      .delete()
      .eq("user_id", user.id)
      .eq("scene_id", sceneId);

    if (sessionsError) {
      console.error("Error deleting sessions:", sessionsError);
      return NextResponse.json({ error: "Failed to delete sessions" }, { status: 500 });
    }

    if (lineIds.length > 0) {
      const [feedbackRes, notesRes, highlightsRes] = await Promise.all([
        supabase.from("user_line_feedback").delete().eq("user_id", user.id).in("line_id", lineIds),
        supabase.from("user_line_notes").delete().eq("user_id", user.id).in("line_id", lineIds),
        supabase.from("user_line_highlights").delete().eq("user_id", user.id).in("line_id", lineIds),
      ]);

      if (feedbackRes.error) {
        console.error("Error deleting feedback:", feedbackRes.error);
        return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
      }
      if (notesRes.error) {
        console.error("Error deleting notes:", notesRes.error);
        return NextResponse.json({ error: "Failed to delete notes" }, { status: 500 });
      }
      if (highlightsRes.error) {
        console.error("Error deleting highlights:", highlightsRes.error);
        return NextResponse.json({ error: "Failed to delete highlights" }, { status: 500 });
      }
    }

    revalidatePath("/home");
    revalidatePath("/bibliotheque");
    revalidatePath(`/scenes/${sceneId}`);

    return NextResponse.json({ success: true, action: "reset_progress" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


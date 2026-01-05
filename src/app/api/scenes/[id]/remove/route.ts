import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sceneId } = await params;
  if (!sceneId) {
    return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
  }

  const user = await getSupabaseSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  try {
    // Récupérer tous les line_id de cette scène
    const { data: lines, error: linesError } = await supabase
      .from("lines")
      .select("id")
      .eq("scene_id", sceneId);

    if (linesError) {
      console.error("Error fetching lines:", linesError);
      return NextResponse.json({ error: "Failed to fetch lines" }, { status: 500 });
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json({ error: "Scene not found" }, { status: 404 });
    }

    const lineIds = lines.map((line) => line.id);

    // Supprimer tous les feedbacks de l'utilisateur pour ces lignes
    const { error: feedbackError } = await supabase
      .from("user_line_feedback")
      .delete()
      .eq("user_id", user.id)
      .in("line_id", lineIds);

    if (feedbackError) {
      console.error("Error deleting feedback:", feedbackError);
      return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


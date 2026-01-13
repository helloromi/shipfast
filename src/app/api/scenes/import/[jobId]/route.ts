import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { jobId } = await params;

    // Récupérer le job spécifique
    const { data: job, error } = await supabase
      .from("import_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (error || !job) {
      console.error("Erreur lors de la récupération du job:", error);
      return NextResponse.json(
        { error: "Job non trouvé ou accès refusé", details: error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        file_paths: job.file_paths,
        draft_data: job.draft_data,
        scene_id: job.scene_id,
        error_message: job.error_message,
        created_at: job.created_at,
        updated_at: job.updated_at,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la récupération du job:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { jobId } = await params;
    const body = await request.json().catch(() => null);
    const status =
      typeof body === "object" && body !== null && "status" in body ? (body as { status?: unknown }).status : undefined;
    const scene_id =
      typeof body === "object" && body !== null && "scene_id" in body ? (body as { scene_id?: unknown }).scene_id : undefined;

    // Mettre à jour le job
    const updateData: { status?: string; scene_id?: string } = {};
    if (typeof status === "string" && status.trim()) updateData.status = status.trim();
    if (typeof scene_id === "string" && scene_id.trim()) updateData.scene_id = scene_id.trim();

    const { data: job, error } = await supabase
      .from("import_jobs")
      .update(updateData)
      .eq("id", jobId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !job) {
      console.error("Erreur lors de la mise à jour du job:", error);
      return NextResponse.json(
        { error: "Job non trouvé ou accès refusé", details: error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        scene_id: job.scene_id,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la mise à jour du job:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: message,
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les imports avec status 'preview_ready' pour cet utilisateur
    const { data: jobs, error } = await supabase
      .from("import_jobs")
      .select("id, status, created_at, draft_data")
      .eq("user_id", user.id)
      .eq("status", "preview_ready")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des imports:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des imports", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: jobs?.length || 0,
      jobs: jobs || [],
    });
  } catch (error: any) {
    console.error("Erreur lors de la récupération du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { markAsSeen } = body;

    // Si markAsSeen est true, on peut marquer les imports comme vus
    // Pour l'instant, on ne fait rien car le badge disparaît automatiquement
    // quand l'utilisateur visite la bibliothèque

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: error.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}


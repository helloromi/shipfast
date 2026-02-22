import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/utils/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(
      request,
      { key: (id) => `import_status_get:${id}`, max: 120 },
      { skipCsrf: true }
    );
    if (!auth.ok) return auth.response;
    const { user, supabase } = auth;

    // Récupérer les imports "non terminés" / actionnables pour cet utilisateur
    const { data: jobs, error } = await supabase
      .from("import_jobs")
      .select("id, status, created_at, draft_data, error_message")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing", "preview_ready", "error"])
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la récupération du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `import_status_post:${id}`, max: 60 });
    if (!auth.ok) return auth.response;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      {
        error: "Erreur interne du serveur",
        details: message,
      },
      { status: 500 }
    );
  }
}


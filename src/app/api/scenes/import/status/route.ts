import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  try {
    void request;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const rl = checkRateLimit(`import_status_get:${user.id}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
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
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const rl = checkRateLimit(`import_status_post:${user.id}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Trop de requêtes" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json().catch(() => null);
    const markAsSeen =
      typeof body === "object" && body !== null && "markAsSeen" in body ? (body as { markAsSeen?: unknown }).markAsSeen : undefined;

    // Si markAsSeen est true, on peut marquer les imports comme vus
    // Pour l'instant, on ne fait rien car le badge disparaît automatiquement
    // quand l'utilisateur visite la bibliothèque
    void markAsSeen;

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


import { NextRequest, NextResponse } from "next/server";

import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { processImportJobPreview, type ImportJobForProcessing } from "@/lib/imports/process-import-job";

export const runtime = "nodejs";
export const maxDuration = 300;

type ImportJobRow = {
  id: string;
  user_id: string;
  status: string;
  file_paths: unknown;
  consent_to_ai: boolean;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const csrf = assertSameOrigin(request);
  if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const rl = checkRateLimit(`import_retry:${user.id}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
    );
  }

  const { jobId } = await params;

  // Vérifier que le job appartient bien à l'utilisateur (RLS via client user)
  const { data: job, error } = await supabase
    .from("import_jobs")
    .select("id, user_id, status, file_paths, consent_to_ai")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single<ImportJobRow>();

  if (error || !job) {
    return NextResponse.json({ error: "Job non trouvé ou accès refusé" }, { status: 404 });
  }

  if (job.status === "completed") {
    return NextResponse.json({ error: "Ce job est déjà terminé" }, { status: 400 });
  }

  // Traitement via service role (fiable, accès storage)
  const admin = createSupabaseAdminClient();
  const payload: ImportJobForProcessing = {
    id: job.id,
    user_id: job.user_id,
    file_paths: job.file_paths,
    consent_to_ai: Boolean(job.consent_to_ai),
  };

  const result = await processImportJobPreview(payload, admin);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: "Relance échouée", details: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { assertCronAuth } from "@/lib/utils/cron";
import { processImportJobPreview, type ImportJobForProcessing } from "@/lib/imports/process-import-job";

export const runtime = "nodejs";
export const maxDuration = 300;

type ImportJobRow = {
  id: string;
  user_id: string;
  file_paths: unknown;
  consent_to_ai: boolean;
  status: string;
  updated_at: string;
};

export async function POST(request: NextRequest) {
  const auth = assertCronAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "5");
  const staleMinutes = Number(request.nextUrl.searchParams.get("staleMinutes") ?? "10");

  const staleCutoff = new Date(Date.now() - Math.max(1, staleMinutes) * 60 * 1000).toISOString();

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("import_jobs")
      .select("id, user_id, file_paths, consent_to_ai, status, updated_at")
      .in("status", ["pending", "processing"])
      .lt("updated_at", staleCutoff)
      .order("updated_at", { ascending: true })
      .limit(Number.isFinite(limit) ? limit : 5)
      .returns<ImportJobRow[]>();

    if (error) throw error;

    const jobs = data ?? [];
    let processed = 0;
    let ok = 0;
    let failed = 0;

    for (const row of jobs) {
      processed += 1;
      const job: ImportJobForProcessing = {
        id: row.id,
        user_id: row.user_id,
        file_paths: row.file_paths,
        consent_to_ai: Boolean(row.consent_to_ai),
      };
      const result = await processImportJobPreview(job, supabase);
      if (result.ok) ok += 1;
      else failed += 1;
    }

    return NextResponse.json({
      ok: true,
      staleCutoff,
      candidates: jobs.length,
      processed,
      success: ok,
      failed,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Vercel Cron Jobs déclenche en GET.
export async function GET(request: NextRequest) {
  return POST(request);
}


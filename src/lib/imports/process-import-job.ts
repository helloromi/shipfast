import { extractTextFromFile } from "@/lib/utils/text-extraction";
import { parseTextWithAI } from "@/lib/utils/text-parser";
import { sendImportReadyEmailIfNeeded } from "@/lib/resend/automation";

export type ImportJobForProcessing = {
  id: string;
  user_id: string;
  file_paths: unknown;
  consent_to_ai: boolean;
};

type Stage = "validating" | "downloading" | "extracting" | "parsing" | "finalizing";

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.some((v) => typeof v !== "string")) return null;
  return value as string[];
}

async function setJobStage(
  supabase: any,
  jobId: string,
  stage: Stage,
  statusMessage?: string
): Promise<void> {
  await supabase
    .from("import_jobs")
    .update({
      processing_stage: stage,
      status_message: statusMessage ?? null,
    })
    .eq("id", jobId);
}

/**
 * Traite un job d'import (preview) et met à jour `import_jobs`.
 * Doit être appelé avec un client Supabase ayant accès aux buckets + table (ex: service role).
 */
export async function processImportJobPreview(
  job: ImportJobForProcessing,
  supabase: any
): Promise<{ ok: true } | { ok: false; error: string }> {
  const jobId = job.id;

  await setJobStage(supabase, jobId, "validating", "Validation des fichiers…");

  const filePaths = asStringArray(job.file_paths);
  if (!filePaths || filePaths.length === 0) {
    await supabase
      .from("import_jobs")
      .update({ status: "error", error_message: "Aucun fichier associé à cet import." })
      .eq("id", jobId);
    return { ok: false, error: "Aucun fichier associé à cet import." };
  }

  // Defense-in-depth: refuser tout accès à des fichiers Storage qui ne sont pas dans le dossier user_id.
  const expectedPrefix = `${job.user_id}/`;
  const invalidPath = filePaths.find((p) => typeof p !== "string" || !p.startsWith(expectedPrefix));
  if (invalidPath) {
    await supabase
      .from("import_jobs")
      .update({ status: "error", error_message: "Chemin de fichier invalide (accès refusé)." })
      .eq("id", jobId);
    return { ok: false, error: "Chemin de fichier invalide (accès refusé)." };
  }

  const allowThirdPartyAI = Boolean(job.consent_to_ai);

  try {
    await supabase
      .from("import_jobs")
      .update({
        status: "processing",
        error_message: null,
        last_attempt_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    let aggregatedText = "";
    await setJobStage(supabase, jobId, "downloading", "Téléchargement des fichiers…");
    for (const filePath of filePaths) {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("scene-imports")
        .download(filePath);

      if (downloadError || !fileData) {
        await supabase
          .from("import_jobs")
          .update({
            status: "error",
            processing_stage: "downloading",
            error_message: `Erreur lors du téléchargement: ${downloadError?.message || "inconnue"}`,
          })
          .eq("id", jobId);
        return { ok: false, error: "Erreur lors du téléchargement." };
      }

      const fileName = filePath.split("/").pop() || "file";
      const file = new File([fileData], fileName, { type: fileData.type });

      await setJobStage(supabase, jobId, "extracting", `Extraction du texte: ${fileName}`);
      const extractionResult = await extractTextFromFile(file, undefined, { allowOpenAI: allowThirdPartyAI });
      if (!extractionResult.success) {
        await supabase
          .from("import_jobs")
          .update({
            status: "error",
            processing_stage: "extracting",
            error_message: `Erreur lors de l'extraction: ${extractionResult.error}`,
          })
          .eq("id", jobId);
        return { ok: false, error: "Erreur lors de l'extraction." };
      }

      if (extractionResult.text?.trim()) {
        aggregatedText += `${extractionResult.text.trim()}\n\n`;
      }
    }

    if (!aggregatedText.trim()) {
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          processing_stage: "extracting",
          error_message: "Aucun texte n'a pu être extrait des fichiers",
        })
        .eq("id", jobId);
      return { ok: false, error: "Aucun texte extrait." };
    }

    await setJobStage(supabase, jobId, "parsing", "Parsing / structuration du texte…");
    const parseResult = await parseTextWithAI(aggregatedText, { allowThirdPartyAI });
    if (!parseResult.success || !parseResult.data) {
      await supabase
        .from("import_jobs")
        .update({
          status: "error",
          processing_stage: "parsing",
          error_message: `Erreur lors du parsing: ${parseResult.error || "inconnue"}`,
        })
        .eq("id", jobId);
      return { ok: false, error: "Erreur lors du parsing." };
    }

    await setJobStage(supabase, jobId, "finalizing", "Finalisation du preview…");
    await supabase
      .from("import_jobs")
      .update({
        status: "preview_ready",
        processing_stage: null,
        status_message: null,
        draft_data: parseResult.data as any,
        error_message: null,
      })
      .eq("id", jobId);

    // Envoyer un email de notification avec journalisation
    try {
      await sendImportReadyEmailIfNeeded({
        userId: job.user_id,
        jobId: job.id,
        title: parseResult.data?.title,
      });
    } catch (emailError) {
      // Ne pas bloquer le processus si l'email échoue
      console.error("Erreur lors de l'envoi de l'email de notification:", emailError);
    }

    return { ok: true };
  } catch (e: any) {
    await supabase
      .from("import_jobs")
      .update({
        status: "error",
        processing_stage: "finalizing",
        error_message: `Erreur interne: ${e?.message || "inconnue"}`,
      })
      .eq("id", jobId);
    return { ok: false, error: "Erreur interne." };
  }
}


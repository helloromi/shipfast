import OpenAI from "openai";
import { createCanvas } from "canvas";
import PDFParser from "pdf2json";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { WorkerMessageHandler as PdfjsWorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const SUPPORTED_PDF_TYPE = "application/pdf";
const MAX_PDF_OCR_PAGES = 10;
const PDFJS_WORKER_READY = !!PdfjsWorkerMessageHandler;
const PDF_OCR_SCALE = Number(process.env.PDF_OCR_SCALE || "1.5");
const IMPORT_SOFT_TIMEOUT_MS = Number(process.env.IMPORT_SOFT_TIMEOUT_MS || "0"); // 0 = désactivé

function formatOpenAIError(error: any): string {
  // openai-node expose souvent: status, error (objet), code, type, param, request_id
  const name = error?.name;
  const message = error?.message || "Erreur inconnue";
  const status = error?.status ?? error?.response?.status;
  const requestId = error?.request_id || error?.response?.headers?.["x-request-id"];

  // Certains formats: error.error = { message, type, code, param }
  const inner = error?.error || error?.response?.data?.error;
  const innerMsg = inner?.message;
  const innerType = inner?.type;
  const innerCode = inner?.code;
  const innerParam = inner?.param;

  if (name === "AbortError") {
    return `OpenAI timeout (AbortError)`;
  }

  const parts = [
    status ? `status=${status}` : null,
    innerType ? `type=${innerType}` : null,
    innerCode ? `code=${innerCode}` : null,
    innerParam ? `param=${innerParam}` : null,
    requestId ? `requestId=${requestId}` : null,
    (innerMsg || message) ? `message=${innerMsg || message}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" | ") : message;
}

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

export type ExtractTextOptions = {
  /**
   * Autorise l'envoi des fichiers/contents à un prestataire tiers (OpenAI) pour OCR Vision.
   * Par défaut: true (rétro-compatibilité); les routes sensibles doivent passer false sans consentement.
   */
  allowOpenAI?: boolean;
};

export type ExtractionProgressEvent =
  | {
      type: "pdf_ocr_page";
      page: number;
      totalPages: number;
    };

// Événements de progression pour éviter une UI "bloquée" pendant les appels IA / OCR.
export type PdfOcrPhase = "render" | "ai";
export type ExtractionPdfProgressEvent =
  | { type: "pdf_progress"; phase: PdfOcrPhase; page?: number; totalPages?: number; message?: string };

export type ExtractionProgressEventV2 = ExtractionProgressEvent | ExtractionPdfProgressEvent;

/**
 * Valide le type et la taille d'un fichier
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier est trop volumineux. Taille maximale : ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isPDF = file.type === SUPPORTED_PDF_TYPE;

  if (!isImage && !isPDF) {
    return {
      valid: false,
      error: `Format non supporté. Formats acceptés : ${SUPPORTED_IMAGE_TYPES.join(", ")}, ${SUPPORTED_PDF_TYPE}`,
    };
  }

  return { valid: true };
}

/**
 * Convertit un File en Buffer (pour Node.js)
 */
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convertit un File en ArrayBuffer
 */
async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

/**
 * OCR via OpenAI Vision pour les images
 */
async function extractTextWithOpenAIVisionFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      text: "",
      success: false,
      error: "OPENAI_API_KEY non configurée pour le fallback OCR.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const base64 = buffer.toString("base64");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Vision supportée
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Transcris tout le texte lisible présent dans cette image. Ne réponds que par le texte brut extrait.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { text: "", success: false, error: "Aucun texte extrait via OpenAI Vision." };
    }

    return { text: content, success: true };
  } catch (error: any) {
    console.error("Erreur OpenAI Vision:", error);
    return {
      text: "",
      success: false,
      error: `Erreur OpenAI Vision : ${formatOpenAIError(error)}`,
    };
  }
}

/**
 * OCR via OpenAI Vision sur plusieurs images (1 seule requête) — bien plus rapide en serverless que N requêtes.
 */
async function extractTextWithOpenAIVisionFromPngBuffers(buffers: Buffer[]): Promise<ExtractionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      text: "",
      success: false,
      error: "OPENAI_API_KEY non configurée pour l'OCR PDF.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const timeoutMs = Number(process.env.OPENAI_PDF_OCR_TIMEOUT_MS || "45000");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const content: any[] = [
      {
        type: "text",
        text: "Transcris tout le texte lisible présent dans ces images (dans l'ordre). Ne réponds que par le texte brut, en conservant les retours à la ligne quand c'est pertinent.",
      },
    ];

    for (const b of buffers) {
      const base64 = b.toString("base64");
      content.push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${base64}` },
      });
    }

    const completion = await openai.chat.completions.create(
      {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content }],
      },
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) return { text: "", success: false, error: "Aucun texte extrait via OpenAI Vision (PDF)." };
    return { text, success: true };
  } catch (error: any) {
    console.error("Erreur OpenAI Vision (PDF):", error);
    return {
      text: "",
      success: false,
      error: `Erreur OpenAI Vision (PDF) : ${formatOpenAIError(error)}`,
    };
  }
}

async function extractTextWithOpenAIVision(file: File): Promise<ExtractionResult> {
  const buffer = await fileToBuffer(file);
  return extractTextWithOpenAIVisionFromBuffer(buffer, file.type);
}

/**
 * Extrait le texte d'une image via OpenAI Vision (OCR).
 */
export async function extractTextFromImage(file: File, options?: ExtractTextOptions): Promise<ExtractionResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      text: "",
      success: false,
      error: validation.error,
    };
  }

  const allowOpenAI = options?.allowOpenAI ?? true;
  if (!allowOpenAI) return { text: "", success: false, error: "OCR OpenAI désactivé (consentement manquant)." };
  return await extractTextWithOpenAIVision(file);
}

/**
 * Extrait le texte d'un PDF en utilisant directement pdfjs-dist legacy (compatible Node.js)
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (event: ExtractionProgressEventV2) => void,
  options?: ExtractTextOptions
): Promise<ExtractionResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      text: "",
      success: false,
      error: validation.error,
    };
  }

  try {
    const startedAt = Date.now();
    // 1) Extraction texte natif via pdf2json
    const pdfParser = new PDFParser();
    const buffer = await fileToBuffer(file);

    const text = await new Promise<string>((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (err: any) => reject(err));
      pdfParser.on("pdfParser_dataReady", (data: any) => {
        try {
          const parts: string[] = [];
          const pages = Array.isArray(data?.Pages)
            ? data.Pages
            : Array.isArray(data?.formImage?.Pages)
              ? data.formImage.Pages
              : [];

          pages.forEach((page: any) => {
            if (Array.isArray(page?.Texts)) {
              page.Texts.forEach((t: any) => {
                if (Array.isArray(t?.R)) {
                  t.R.forEach((r: any) => {
                    if (r?.T) {
                      try {
                        parts.push(decodeURIComponent(r.T));
                      } catch {
                        parts.push(r.T);
                      }
                    }
                  });
                }
              });
            }
            // Séparateur de page
            parts.push("\n");
          });

          resolve(parts.join(" ").trim());
        } catch (e) {
          reject(e);
        }
      });

      // Lancer le parsing
      pdfParser.parseBuffer(buffer);
    });

    if (text) {
      return { text, success: true };
    }

    // 2) Fallback OCR page-à-page via OpenAI Vision si texte natif vide (legacy build pour éviter le worker)
    // IMPORTANT: En prod (Vercel/Next), pdf.js peut échouer à monter le "fake worker" si le worker
    // n'est pas résolu correctement. On force workerSrc vers le module worker, ET on l'importe explicitement
    // pour s'assurer qu'il est bien inclus dans le bundle Turbopack.
    GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
    if (!PDFJS_WORKER_READY) {
      console.warn("[PDF] pdfjs worker non prêt (unexpected).");
    }

    const arrayBuffer = await fileToArrayBuffer(file);
    const loadingTask = getDocument({
      data: arrayBuffer,
      disableWorker: true, // pas de worker => pas besoin de workerSrc
    });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages ?? 0;
    if (!numPages) {
      return {
        text: "",
        success: false,
        error: "PDF illisible (0 page détectée par pdfjs).",
      };
    }

    // OCR: on privilégie OpenAI Vision en 1 seule requête (batch).
    const pagesToProcess = Math.min(numPages, MAX_PDF_OCR_PAGES);
    const renderedPngs: Buffer[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      if (IMPORT_SOFT_TIMEOUT_MS > 0 && Date.now() - startedAt > IMPORT_SOFT_TIMEOUT_MS) {
        return {
          text: "",
          success: false,
          error:
            "Traitement trop long pour le serveur (timeout). Essayez avec moins de pages, ou activez un plan/timeout plus élevé côté hébergement.",
        };
      }
      onProgress?.({
        type: "pdf_progress",
        phase: "render",
        page: pageNum,
        totalPages: pagesToProcess,
        message: "Rendu des pages...",
      });
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: Number.isFinite(PDF_OCR_SCALE) ? PDF_OCR_SCALE : 1.5 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      const pngBuffer = canvas.toBuffer("image/png");
      renderedPngs.push(pngBuffer);
    }

    // 2a) OpenAI Vision (batch) si possible — beaucoup plus adapté au serverless Hobby.
    const allowOpenAI = options?.allowOpenAI ?? true;
    if (!allowOpenAI) {
      return { text: "", success: false, error: "OCR OpenAI désactivé (consentement manquant)." };
    }

    if (!process.env.OPENAI_API_KEY) {
      return { text: "", success: false, error: "OPENAI_API_KEY non configurée pour l'OCR du PDF." };
    }

    if (renderedPngs.length > 0) {
      onProgress?.({ type: "pdf_progress", phase: "ai", message: "Analyse OCR (OpenAI)..." });
      // Heartbeat pour éviter l'impression de freeze pendant l'appel réseau.
      let hb = 0;
      const heartbeat = setInterval(() => {
        hb += 1;
        onProgress?.({
          type: "pdf_progress",
          phase: "ai",
          message: hb % 2 === 0 ? "Analyse OCR (OpenAI)..." : "Analyse OCR (OpenAI)…",
        });
      }, 1200);

      const visionBatch = await extractTextWithOpenAIVisionFromPngBuffers(renderedPngs);
      clearInterval(heartbeat);
      if (visionBatch.success && visionBatch.text.trim()) {
        return { text: visionBatch.text.trim(), success: true };
      }
      const openAiErr = visionBatch.error || "OpenAI Vision batch a échoué.";
      return { text: "", success: false, error: `OCR OpenAI a échoué. Détails: ${openAiErr}` };
    }

    return { text: "", success: false, error: "Aucune page n'a pu être rendue pour l'OCR." };
  } catch (error: any) {
    console.error("Erreur lors de l'extraction PDF:", error);
    return {
      text: "",
      success: false,
      error: `Erreur lors de l'extraction du PDF : ${error.message || "Erreur inconnue"}`,
    };
  }
}

/**
 * Extrait le texte d'un fichier (image ou PDF) automatiquement selon le type
 */
export async function extractTextFromFile(
  file: File,
  onProgress?: (event: ExtractionProgressEventV2) => void,
  options?: ExtractTextOptions
): Promise<ExtractionResult> {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isPDF = file.type === SUPPORTED_PDF_TYPE;

  if (isImage) {
    return extractTextFromImage(file, options);
  } else if (isPDF) {
    return extractTextFromPDF(file, onProgress, options);
  } else {
    return {
      text: "",
      success: false,
      error: "Format de fichier non supporté",
    };
  }
}


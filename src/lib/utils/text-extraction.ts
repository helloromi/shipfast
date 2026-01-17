import Tesseract from "tesseract.js";
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
const TESSERACT_CACHE_PATH = process.env.TESSERACT_CACHE_PATH || "/tmp/tesseract-cache";
// "fast" est beaucoup plus léger que "best" => startup plus rapide en serverless.
const TESSERACT_LANG_PATH =
  process.env.TESSERACT_LANG_PATH || "https://tessdata.projectnaptha.com/4.0.0_fast";

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

/**
 * OCR local (Node) via Tesseract sur un buffer image.
 */
async function extractTextWithTesseractFromBuffer(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "fra", {
      langPath: TESSERACT_LANG_PATH,
      cachePath: TESSERACT_CACHE_PATH,
    });
    const cleaned = (text || "").trim();
    if (!cleaned) return { text: "", success: false, error: "OCR Tesseract vide." };
    return { text: cleaned, success: true };
  } catch (error: any) {
    return {
      text: "",
      success: false,
      error: `Erreur OCR Tesseract : ${error.message || "inconnue"}`,
    };
  }
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
export type PdfOcrPhase = "render" | "ai" | "tesseract";
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
 * Fallback OCR via OpenAI Vision pour les images si Tesseract échoue
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
 * Extrait le texte d'une image en utilisant Tesseract.js (OCR)
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

  try {
    // Convertir le fichier en buffer pour Tesseract
    const buffer = await fileToBuffer(file);

    // Utiliser Tesseract pour extraire le texte
    // Langue française par défaut
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "fra", {
      langPath: TESSERACT_LANG_PATH,
      cachePath: TESSERACT_CACHE_PATH,
      logger: (m) => {
        // Optionnel : logger la progression
        if (m.status === "recognizing text") {
          console.log(`OCR progression: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const cleanedText = text.trim();

    if (!cleanedText) {
      const allowOpenAI = options?.allowOpenAI ?? true;
      if (!allowOpenAI) return { text: "", success: false, error: "OCR OpenAI désactivé (consentement manquant)." };
      const visionResult = await extractTextWithOpenAIVision(file);
      if (visionResult.success) return visionResult;
      return {
        text: "",
        success: false,
        error: visionResult.error || "Aucun texte n'a pu être extrait de l'image.",
      };
    }

    return {
      text: cleanedText,
      success: true,
    };
  } catch (error: any) {
    console.error("Erreur lors de l'extraction OCR:", error);
    return {
      text: "",
      success: false,
      error: `Erreur lors de l'extraction du texte : ${error.message || "Erreur inconnue"}`,
    };
  }
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

    // Sur Vercel Hobby, l'OCR CPU (Tesseract) est très susceptible de dépasser le timeout.
    // Si OPENAI_API_KEY est présente, on privilégie OpenAI Vision en 1 seule requête.
    const pagesToProcess = Math.min(numPages, MAX_PDF_OCR_PAGES);
    const renderedPngs: Buffer[] = [];
    const partsOCR: string[] = [];
    const ocrErrors: string[] = [];

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
    if (allowOpenAI && process.env.OPENAI_API_KEY && renderedPngs.length > 0) {
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
      ocrErrors.push(openAiErr);

      // Par défaut: si OpenAI a échoué ET qu'on est en environnement serverless contraint,
      // on ne tente pas Tesseract (trop risqué pour les timeouts).
      if (process.env.ALLOW_TESSERACT_FALLBACK !== "1") {
        return {
          text: "",
          success: false,
          error: `OCR OpenAI a échoué. Détails: ${openAiErr}`,
        };
      }
    }

    // 2b) Fallback Tesseract page-à-page si pas de clé OpenAI (ou si tu exécutes hors constraints serverless).
    for (let i = 0; i < renderedPngs.length; i++) {
      const pageNum = i + 1;
      onProgress?.({
        type: "pdf_progress",
        phase: "tesseract",
        page: pageNum,
        totalPages: renderedPngs.length,
        message: "OCR (Tesseract) en cours...",
      });
      const tesseractResult = await extractTextWithTesseractFromBuffer(renderedPngs[i]);
      if (tesseractResult.success && tesseractResult.text.trim()) {
        partsOCR.push(tesseractResult.text.trim());
      } else if (tesseractResult.error) {
        ocrErrors.push(`p${pageNum}: ${tesseractResult.error}`);
      } else {
        ocrErrors.push(`p${pageNum}: OCR vide`);
      }
    }

    const ocrText = partsOCR.join("\n\n").trim();
    if (!ocrText) {
      return {
        text: "",
        success: false,
        error:
          ocrErrors.length > 0
            ? `Aucun texte n'a pu être extrait du PDF après OCR. Détails: ${ocrErrors.slice(0, 5).join(" | ")}`
            : "Aucun texte n'a pu être extrait du PDF, même après OCR.",
      };
    }

    return {
      text: ocrText,
      success: true,
    };
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


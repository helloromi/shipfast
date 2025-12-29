import Tesseract from "tesseract.js";
import OpenAI from "openai";
import { createCanvas } from "canvas";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const SUPPORTED_PDF_TYPE = "application/pdf";
const MAX_PDF_OCR_PAGES = 10;

export interface ExtractionResult {
  text: string;
  success: boolean;
  error?: string;
}

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
      error: `Erreur OpenAI Vision : ${error.message || "inconnue"}`,
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
export async function extractTextFromImage(file: File): Promise<ExtractionResult> {
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
      logger: (m) => {
        // Optionnel : logger la progression
        if (m.status === "recognizing text") {
          console.log(`OCR progression: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    const cleanedText = text.trim();

    if (!cleanedText) {
      // Fallback OpenAI Vision
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
export async function extractTextFromPDF(file: File): Promise<ExtractionResult> {
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      text: "",
      success: false,
      error: validation.error,
    };
  }

  try {
    // 1) Extraction texte natif via pdf2json
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PDFParser = require("pdf2json");
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

    // 2) Fallback OCR page-à-page via OpenAI Vision si texte natif vide
    const pdfjsLib: any = await import("pdfjs-dist/build/pdf.mjs");
    const arrayBuffer = await fileToArrayBuffer(file);
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      disableWorker: true, // pas de worker => pas besoin de workerSrc
    });
    const pdf = await loadingTask.promise;

    const pagesToProcess = Math.min(pdf.numPages ?? 0, MAX_PDF_OCR_PAGES);
    const partsOCR: string[] = [];

    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");
      await page.render({ canvasContext: context, viewport }).promise;
      const pngBuffer = canvas.toBuffer("image/png");

      const visionResult = await extractTextWithOpenAIVisionFromBuffer(pngBuffer, "image/png");
      if (visionResult.success && visionResult.text.trim()) {
        partsOCR.push(visionResult.text.trim());
      }
    }

    const ocrText = partsOCR.join("\n\n").trim();
    if (!ocrText) {
      return {
        text: "",
        success: false,
        error: "Aucun texte n'a pu être extrait du PDF, même après OCR (probablement un scan illisible).",
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
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type);
  const isPDF = file.type === SUPPORTED_PDF_TYPE;

  if (isImage) {
    return extractTextFromImage(file);
  } else if (isPDF) {
    return extractTextFromPDF(file);
  } else {
    return {
      text: "",
      success: false,
      error: "Format de fichier non supporté",
    };
  }
}


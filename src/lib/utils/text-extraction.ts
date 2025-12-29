import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

// Configurer pdfjs-dist pour fonctionner dans Node.js/Next.js
// Le worker sera chargé depuis le CDN en production, ou depuis node_modules en développement
if (typeof window === "undefined") {
  // En Node.js, on utilise le CDN pour le worker
  // Note: En production, vous pouvez copier le worker dans public/ et l'utiliser localement
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const SUPPORTED_PDF_TYPE = "application/pdf";

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
      return {
        text: "",
        success: false,
        error: "Aucun texte n'a pu être extrait de l'image. Vérifiez que l'image contient du texte lisible.",
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
 * Extrait le texte d'un PDF en utilisant pdfjs-dist
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
    const arrayBuffer = await fileToArrayBuffer(file);

    // Charger le document PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const textParts: string[] = [];

    // Extraire le texte de chaque page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Concaténer tous les items de texte de la page
      const pageText = textContent.items
        .map((item: any) => {
          if ("str" in item) {
            return item.str;
          }
          return "";
        })
        .join(" ");

      textParts.push(pageText);
    }

    const fullText = textParts.join("\n\n").trim();

    if (!fullText) {
      return {
        text: "",
        success: false,
        error: "Aucun texte n'a pu être extrait du PDF. Vérifiez que le PDF contient du texte (et non seulement des images).",
      };
    }

    return {
      text: fullText,
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


// Déclaration minimale pour pdfjs-dist en ESM (pdf.mjs)
declare module "pdfjs-dist/build/pdf.mjs" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(
    options: any
  ): { promise: Promise<any> };
}

// Déclaration minimale pour le build legacy (utilisé côté Node.js)
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(
    options: any
  ): { promise: Promise<any> };
}


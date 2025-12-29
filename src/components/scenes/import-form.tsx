"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Toast } from "@/components/ui/toast";
import { useSupabase } from "@/components/supabase-provider";
import { t } from "@/locales/fr";

type ProcessingStage = "idle" | "uploading" | "extracting" | "parsing" | "creating" | "success" | "error";

type ProcessingState = {
  stage: ProcessingStage;
  error?: string;
  sceneId?: string;
};

export function ImportForm() {
  const router = useRouter();
  const { supabase, session } = useSupabase();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState<ProcessingState>({ stage: "idle" });
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const totalSizeMb = useMemo(
    () => files.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024,
    [files]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []).slice(0, 10);
    if (droppedFiles.length) {
      setFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files).slice(0, 10) : [];
    if (selectedFiles.length) {
      setFiles(selectedFiles);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!files.length) {
      setToast({ message: t.scenes.import.errors.noFile, variant: "error" });
      return;
    }

    // Validation basique
    const maxSize = 10 * 1024 * 1024; // 10MB par fichier
    const maxTotal = 20 * 1024 * 1024; // 20MB total
    if (files.some((f) => f.size > maxSize)) {
      setToast({ message: t.scenes.import.errors.fileTooLarge, variant: "error" });
      return;
    }

    const supportedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (files.some((f) => !supportedTypes.includes(f.type))) {
      setToast({ message: t.scenes.import.errors.unsupportedFormat, variant: "error" });
      return;
    }

    if (files.reduce((acc, f) => acc + f.size, 0) > maxTotal) {
      setToast({ message: "Taille totale des fichiers trop élevée (max 20MB).", variant: "error" });
      return;
    }

    if (!session?.user) {
      setToast({ message: "Vous devez être connecté", variant: "error" });
      return;
    }

    try {
      setProcessing({ stage: "uploading" });

      // Étape 1 : Uploader les fichiers vers Supabase Storage
      const uploads: string[] = [];
      for (const f of files) {
        const fileExt = f.name.split(".").pop();
        const fileName = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("scene-imports")
          .upload(fileName, f, {
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError || !uploadData?.path) {
          throw new Error(`Erreur lors de l'upload : ${uploadError?.message || "inconnue"}`);
        }
        uploads.push(uploadData.path);
      }

      setProcessing({ stage: "extracting" });

      // Étape 2 : Envoyer la liste des fichiers à l'API pour traitement
      const response = await fetch("/api/scenes/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePaths: uploads,
        }),
      });

      const data = await response.json();

      // Nettoyer les fichiers après traitement (même en cas d'erreur)
      if (uploads.length) {
        await supabase.storage.from("scene-imports").remove(uploads);
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || t.scenes.import.errors.generic);
      }

      setProcessing({
        stage: "success",
        sceneId: data.sceneId,
      });

      setToast({
        message: t.scenes.import.success.message,
        variant: "success",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'import:", error);
      setProcessing({
        stage: "error",
        error: error.message || t.scenes.import.errors.generic,
      });
      setToast({
        message: error.message || t.scenes.import.errors.generic,
        variant: "error",
      });
    }
  }, [files, session, supabase, router]);

  const handleViewScene = useCallback(() => {
    if (processing.sceneId) {
      router.push(`/scenes/${processing.sceneId}`);
    }
  }, [processing.sceneId, router]);

  const handleImportAnother = useCallback(() => {
    setFiles([]);
    setProcessing({ stage: "idle" });
  }, []);

  const getProcessingMessage = () => {
    switch (processing.stage) {
      case "uploading":
        return t.scenes.import.processing.uploading;
      case "extracting":
        return t.scenes.import.processing.extracting;
      case "parsing":
        return t.scenes.import.processing.parsing;
      case "creating":
        return t.scenes.import.processing.creating;
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Zone de drop */}
      {processing.stage === "idle" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-8 transition ${
            isDragging
              ? "border-[#3b1f4a] bg-[#3b1f4a08]"
              : "border-[#e7e1d9] bg-white/90 hover:border-[#3b1f4a33]"
          }`}
        >
          <input
            multiple
            type="file"
            id="file-input"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-[#f4c95d33] p-4">
              <svg
                className="h-8 w-8 text-[#3b1f4a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-[#1c1b1f]">
                {files.length ? `${files.length} fichier(s) sélectionné(s)` : t.scenes.import.dropzone.title}
              </p>
              {!files.length && (
                <>
                  <p className="text-xs text-[#524b5a]">
                    {t.scenes.import.dropzone.or}{" "}
                    <span className="font-semibold text-[#3b1f4a]">{t.scenes.import.dropzone.browse}</span>
                  </p>
                  <p className="text-xs text-[#7a7184]">{t.scenes.import.dropzone.supportedFormats}</p>
                  <p className="text-xs text-[#7a7184]">{t.scenes.import.dropzone.maxSize}</p>
                  <p className="text-xs text-[#7a7184]">Jusqu'à 10 fichiers, total 20MB</p>
                </>
              )}
            </div>
            {files.length > 0 && (
              <div className="mt-2 flex flex-col items-center gap-1 text-xs text-[#524b5a]">
                <span>Total : {totalSizeMb.toFixed(2)} MB</span>
                <span className="max-w-sm truncate text-center">
                  {files.map((f) => f.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* État de traitement */}
      {processing.stage !== "idle" && processing.stage !== "success" && processing.stage !== "error" && (
        <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e7e1d9] border-t-[#3b1f4a]"></div>
            <p className="text-sm font-medium text-[#1c1b1f]">{getProcessingMessage()}</p>
            <p className="text-xs text-[#7a7184]">Cela peut prendre quelques instants...</p>
          </div>
        </div>
      )}

      {/* État d'erreur */}
      {processing.stage === "error" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-red-800">{t.scenes.import.errors.generic}</p>
            </div>
            {processing.error && (
              <p className="text-xs text-red-700">{processing.error}</p>
            )}
            <button
              onClick={handleImportAnother}
              className="w-fit rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {/* État de succès */}
      {processing.stage === "success" && (
        <div className="rounded-2xl border border-[#2cb67d] bg-[#2cb67d08] p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#2cb67d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-semibold text-[#1c1b1f]">{t.scenes.import.success.title}</p>
            </div>
            <p className="text-xs text-[#524b5a]">{t.scenes.import.success.message}</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewScene}
                className="rounded-full bg-[#2cb67d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#239b6a]"
              >
                {t.scenes.import.success.viewScene}
              </button>
              <button
                onClick={handleImportAnother}
                className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
              >
                {t.scenes.import.success.importAnother}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'import */}
      {processing.stage === "idle" && files.length > 0 && (
        <button
          onClick={handleSubmit}
          className="w-full rounded-full bg-[#3b1f4a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#2d1638] disabled:opacity-50"
        >
          Importer la scène
        </button>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}


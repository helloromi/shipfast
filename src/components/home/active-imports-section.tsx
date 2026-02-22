"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ImportJob = {
  id: string;
  status: string;
  created_at: string;
  draft_data: any;
  progress_percentage: number | null;
  status_message: string | null;
  error_message: string | null;
};

function getTitle(draftData: any): string {
  if (!draftData || typeof draftData !== "object") return "Import";
  const title = typeof draftData.title === "string" && draftData.title.trim() ? draftData.title.trim() : "Import";
  return title;
}

function formatTimeRemaining(createdAt: string, progressPercentage: number | null): string | null {
  if (!progressPercentage || progressPercentage <= 0 || progressPercentage >= 100) {
    return null;
  }
  const elapsed = Date.now() - new Date(createdAt).getTime();
  const elapsedSeconds = elapsed / 1000;
  const progressRatio = progressPercentage / 100;
  if (progressRatio === 0) return null;
  const totalEstimatedSeconds = elapsedSeconds / progressRatio;
  const remainingSeconds = totalEstimatedSeconds - elapsedSeconds;
  
  if (remainingSeconds < 0) return null;
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = Math.floor(remainingSeconds % 60);
  
  if (minutes > 0) {
    return `${minutes} min${minutes > 1 ? "s" : ""}${seconds > 0 ? ` ${seconds}s` : ""}`;
  }
  return `${seconds}s`;
}

export function ActiveImportsSection() {
  const [imports, setImports] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fetchImports = async () => {
      try {
        const response = await fetch("/api/scenes/import/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && Array.isArray(data.jobs)) {
          const active = data.jobs.filter((job: ImportJob) =>
            job.status === "pending" || job.status === "processing" || job.status === "preview_ready"
          );
          setImports(active);

          // Arrêter le polling dès qu'il n'y a plus d'imports en cours ou en attente
          if (active.every((job: ImportJob) => job.status === "preview_ready") && intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des imports:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchImports();

    // Polling toutes les 3 secondes pour les imports en cours
    intervalId = setInterval(() => {
      void fetchImports();
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (imports.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-5 shadow-sm shadow-[#3b1f4a14]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">Imports en cours</h2>
          <p className="text-xs text-[#7a7184]">
            {imports.length} import{imports.length > 1 ? "s" : ""} en traitement
          </p>
        </div>
        <Link
          href="/imports"
          className="text-xs font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          Voir tous
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {imports.map((job) => {
          const title = getTitle(job.draft_data);
          const timeRemaining = formatTimeRemaining(job.created_at, job.progress_percentage);
          const isProcessing = job.status === "processing" || job.status === "pending";
          const isReady = job.status === "preview_ready";

          return (
            <Link
              key={job.id}
              href={`/imports/${job.id}/preview`}
              className="group flex flex-col gap-2 rounded-xl border border-[#e7e1d9] bg-white/92 p-3 transition hover:border-[#3b1f4a33] hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#3b1f4a] line-clamp-1">{title}</h3>
                {isReady && (
                  <span className="rounded-full bg-[#ff6b6b] px-2 py-0.5 text-xs font-semibold text-white">
                    À valider
                  </span>
                )}
                {isProcessing && (
                  <span className="rounded-full bg-[#f4c95d33] px-2 py-0.5 text-xs font-semibold text-[#3b1f4a]">
                    En cours
                  </span>
                )}
              </div>

              {isProcessing && job.progress_percentage !== null && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#7a7184]">
                      {job.status_message || "Traitement en cours…"}
                    </span>
                    <span className="text-xs font-semibold text-[#3b1f4a]">
                      {job.progress_percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d9]">
                    <div
                      className="h-full rounded-full bg-[#3b1f4a] transition-[width] duration-300"
                      style={{ width: `${job.progress_percentage}%` }}
                    />
                  </div>
                  {timeRemaining && (
                    <p className="text-xs text-[#7a7184]">
                      Temps estimé restant : environ {timeRemaining}
                    </p>
                  )}
                </div>
              )}

              {isReady && (
                <p className="text-xs text-[#7a7184]">
                  Cliquez pour éditer et valider l'import
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

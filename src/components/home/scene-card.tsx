"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/locales/fr";
import { SceneProgress } from "@/lib/queries/scenes";

type SceneCardProps = {
  scene: SceneProgress;
};

const progressForAverage = (average?: number) => {
  if (average === undefined || average === null) {
    return { label: t.common.progress.notStarted, dot: "bg-[#e11d48]" };
  }
  if (average >= 7) {
    return { label: t.common.progress.mastered, dot: "bg-[#2cb67d]" };
  }
  if (average > 0) {
    return { label: t.common.progress.inProgress, dot: "bg-[#f59e0b]" };
  }
  return { label: t.common.progress.notStarted, dot: "bg-[#e11d48]" };
};

export function SceneCard({ scene }: SceneCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scenes/${scene.sceneId}/remove`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete scene");
      }

      // Rafraîchir la page pour mettre à jour la liste
      router.refresh();
    } catch (error) {
      console.error("Error deleting scene:", error);
      setIsDeleting(false);
      setShowConfirm(false);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  const progress = progressForAverage(scene.average);

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-md shadow-[#3b1f4a14]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
          {scene.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${progress.dot}`} aria-label={progress.label} />
          <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
            {scene.average.toFixed(2)} {t.home.labels.sur}
          </span>
        </div>
      </div>
      <p className="text-sm text-[#524b5a]">
        {scene.author ? `${t.common.labels.par} ${scene.author}` : t.common.labels.auteurInconnu}
      </p>
      {scene.summary && (
        <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-3">
          {scene.summary}
        </p>
      )}
      <div className="flex items-center justify-between gap-2 text-sm text-[#524b5a]">
        <span>{t.home.labels.personnage} {scene.lastCharacterName ?? "—"}</span>
        {scene.chapter && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
            {t.common.labels.chapitre} : {scene.chapter}
          </span>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Link
          href={
            scene.lastCharacterId
              ? `/learn/${scene.sceneId}?character=${scene.lastCharacterId}&characterName=${encodeURIComponent(
                  scene.lastCharacterName ?? ""
                )}`
              : `/scenes/${scene.sceneId}`
          }
          className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] hover:-translate-y-[1px]"
        >
          {t.home.buttons.continuer}
        </Link>
        <Link
          href={`/scenes/${scene.sceneId}`}
          className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a66]"
        >
          {t.home.buttons.details}
        </Link>
        {showConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-full bg-[#e11d48] px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#c4153c] disabled:opacity-50"
            >
              {isDeleting ? "..." : "✓"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a66] disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-2 py-2 text-xs font-semibold text-[#7a7184] shadow-sm hover:border-[#e11d48] hover:text-[#e11d48] disabled:opacity-50"
            title={t.home.buttons.supprimer}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}


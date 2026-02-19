"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/locales/fr";
import { LineRangeSelector } from "@/components/scenes/line-range-selector";
import { Toast } from "@/components/ui/toast";
import { Scene } from "@/types/scenes";

type SceneWithStats = Scene & {
  average?: number;
  charactersCount: number;
  linesCount: number;
  lastCharacterId?: string | null;
  lastCharacterName?: string | null;
};

type WorkDetailClientProps = {
  work: {
    id: string;
    title: string;
    author: string | null;
    summary: string | null;
    scenes: SceneWithStats[];
  };
};

export function WorkDetailClient({ work }: WorkDetailClientProps) {
  const router = useRouter();
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [sceneRanges, setSceneRanges] = useState<Map<string, { start: number; end: number }>>(
    new Map()
  );
  const [rangeSelectorOpen, setRangeSelectorOpen] = useState<string | null>(null);
  const [multiSceneWarning, setMultiSceneWarning] = useState(false);

  const toggleSceneSelection = (sceneId: string) => {
    setSelectedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) {
        next.delete(sceneId);
        setSceneRanges((ranges) => {
          const nextRanges = new Map(ranges);
          nextRanges.delete(sceneId);
          return nextRanges;
        });
      } else {
        next.add(sceneId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedScenes.size === work.scenes.length) {
      setSelectedScenes(new Set());
      setSceneRanges(new Map());
    } else {
      setSelectedScenes(new Set(work.scenes.map((s) => s.id)));
    }
  };

  const handleStartLearning = () => {
    if (selectedScenes.size === 0) return;

    if (selectedScenes.size === 1) {
      // Une seule scène : rediriger vers la page de détail de la scène
      const sceneId = Array.from(selectedScenes)[0];
      const range = sceneRanges.get(sceneId);
      if (range) {
        router.push(`/scenes/${sceneId}?startLine=${range.start}&endLine=${range.end}`);
      } else {
        router.push(`/scenes/${sceneId}`);
      }
    } else {
      // Plusieurs scènes : avertir l'utilisateur et ouvrir la première
      setMultiSceneWarning(true);
      const firstSceneId = Array.from(selectedScenes)[0];
      router.push(`/scenes/${firstSceneId}`);
    }
  };

  const selectedCount = selectedScenes.size;
  const selectedLabel =
    selectedCount === 0
      ? t.scenes.works.selection.aucuneScene
      : selectedCount === 1
        ? t.scenes.works.selection.uneScene
        : `${selectedCount} ${t.scenes.works.selection.plusieursScenes}`;

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          {t.scenes.works.detail.sectionLabel}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">{work.title}</h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {work.author ? `${t.common.labels.par} ${work.author}` : t.common.labels.auteurInconnu}
        </p>
        {work.summary && (
          <p className="text-sm text-[#1c1b1f] leading-relaxed">{work.summary}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
            {t.scenes.works.detail.scenes.title}
          </h2>
          {work.scenes.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs font-semibold text-[#3b1f4a] underline underline-offset-4"
            >
              {selectedScenes.size === work.scenes.length
                ? t.scenes.works.detail.scenes.deselectAll
                : t.scenes.works.detail.scenes.selectAll}
            </button>
          )}
        </div>

        {work.scenes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
            {t.scenes.works.detail.scenes.empty}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {work.scenes.map((scene: SceneWithStats) => {
              const isSelected = selectedScenes.has(scene.id);
              const range = sceneRanges.get(scene.id);
              const progress = progressForAverage(scene.average);
              return (
                <div
                  key={scene.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm transition ${
                    isSelected
                      ? "border-[#3b1f4a] bg-[#f4c95d33]"
                      : "border-[#e7e1d9] bg-white/92"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSceneSelection(scene.id)}
                      className="mt-1 h-4 w-4 rounded border-[#e7e1d9] text-[#3b1f4a] focus:ring-[#3b1f4a]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                          {scene.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${progress.dot}`} aria-label={progress.label} />
                          {scene.average !== undefined && (
                            <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                              {t.common.labels.maitrise}: {scene.average.toFixed(2)} / 10
                            </span>
                          )}
                        </div>
                      </div>
                      {scene.chapter && (
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
                          {t.common.labels.chapitre} : {scene.chapter}
                        </p>
                      )}
                      {scene.summary && (
                        <p className="mt-1 text-sm text-[#1c1b1f] leading-relaxed">{scene.summary}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-[#7a7184]">
                        <span>
                          {scene.charactersCount} {t.scenes.works.detail.scenes.personnages}
                        </span>
                        <span>
                          {scene.linesCount} {t.scenes.works.detail.scenes.repliques}
                        </span>
                      </div>
                      {range && (
                        <div className="mt-2 text-xs font-semibold text-[#3b1f4a]">
                          Plage sélectionnée : répliques {range.start} à {range.end}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {scene.average !== undefined && scene.average > 0 && scene.lastCharacterId ? (
                      <Link
                        href={`/learn/${scene.id}?character=${scene.lastCharacterId}&characterName=${encodeURIComponent(
                          scene.lastCharacterName ?? ""
                        )}`}
                        className="rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
                      >
                        {t.scenes.works.detail.scenes.continuer}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setRangeSelectorOpen(scene.id)}
                          className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-xs font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
                        >
                          {t.scenes.works.detail.scenes.selectionnerPlage}
                        </button>
                        {!isSelected && (
                          <Link
                            href={`/scenes/${scene.id}`}
                            className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-xs font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
                          >
                            {t.scenes.works.detail.scenes.apercu}
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedCount > 0 && (
          <div className="sticky bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-[#3b1f4a] bg-white p-4 shadow-lg">
            <span className="text-sm font-semibold text-[#3b1f4a]">{selectedLabel}</span>
            <button
              onClick={handleStartLearning}
              className="rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
            >
              {t.scenes.works.detail.scenes.commencerApprentissage}
            </button>
          </div>
        )}
      </div>

      <div>
        <Link
          href="/bibliotheque"
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← {t.common.buttons.retourBibliotheque}
        </Link>
      </div>

      {rangeSelectorOpen && work && (
        <LineRangeSelector
          sceneId={rangeSelectorOpen}
          sceneTitle={work.scenes.find((s) => s.id === rangeSelectorOpen)?.title || ""}
          onClose={() => setRangeSelectorOpen(null)}
          onValidate={(start, end) => {
            setSceneRanges((prev) => {
              const next = new Map(prev);
              next.set(rangeSelectorOpen, { start, end });
              return next;
            });
            setRangeSelectorOpen(null);
          }}
        />
      )}

      {multiSceneWarning && (
        <Toast
          message="L'apprentissage simultané de plusieurs scènes n'est pas encore disponible. Tu es redirigé vers la première scène sélectionnée."
          variant="error"
          onClose={() => setMultiSceneWarning(false)}
          duration={6000}
        />
      )}
    </div>
  );
}





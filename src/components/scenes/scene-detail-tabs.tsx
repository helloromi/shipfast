"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs } from "@/components/ui/tabs";
import { SceneStatsDetail } from "@/components/stats/scene-stats-detail";
import { LineHighlightsEditor } from "@/components/scenes/line-highlights-editor";
import { Toast } from "@/components/ui/toast";
import { SceneWithRelations } from "@/types/scenes";
import { SceneStats, LineMasteryPoint } from "@/types/stats";
import { HighlightsByLineId } from "@/lib/queries/notes";
import { t } from "@/locales/fr";

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type SceneDetailTabsProps = {
  scene: SceneWithRelations;
  sceneId: string;
  user: { id: string } | null;
  sceneStats: SceneStats | null;
  lineMastery: LineMasteryPoint[];
  lastCharacterId: string | null;
  lastCharacterName: string | null;
  sortedLines: Array<{
    id: string;
    order: number;
    text: string;
    character_id: string;
    characters: { name: string; id: string } | null;
  }>;
  highlightsByLineId: HighlightsByLineId;
};

export function SceneDetailTabs({
  scene,
  sceneId,
  user,
  sceneStats,
  lineMastery,
  lastCharacterId,
  lastCharacterName,
  sortedLines,
  highlightsByLineId,
}: SceneDetailTabsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const canEdit = user && scene.is_private && scene.owner_user_id === user.id;
  const deleteLabel = canEdit ? t.scenes.detail.reglages.supprimerScene : t.scenes.detail.reglages.reinitialiserProgression;
  const confirmDeleteText = canEdit
    ? t.scenes.detail.reglages.confirmerSuppression
    : t.scenes.detail.reglages.confirmerReinitialisation;

  const handleDelete = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/scenes/${sceneId}/remove`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete scene");
      }

      const body = (await response.json().catch(() => null)) as null | { action?: string };
      const action = body?.action;
      router.push(action === "deleted_scene" ? "/bibliotheque" : "/home");
      router.refresh();
    } catch (error) {
      console.error("Error deleting scene:", error);
      setIsDeleting(false);
      setShowConfirmDelete(false);
      setToast({ message: "Erreur lors de la suppression. Veuillez réessayer.", variant: "error" });
    }
  };

  const tabs = [
    {
      id: "apercu",
      label: t.scenes.detail.tabs.apercu,
      content: (
        <div className="flex flex-col gap-2 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
          {user && (
            <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-3 py-2 text-sm text-[#524b5a]">
              {t.scenes.detail.highlights.help}
            </div>
          )}
          {sortedLines.length === 0 ? (
            <p className="text-sm text-[#524b5a]">Aucune réplique disponible.</p>
          ) : (
            sortedLines.map((line) => {
              const isUserCharacter = lastCharacterId && line.character_id === lastCharacterId;
              const highlights = highlightsByLineId?.[line.id] ?? [];
              return (
                <div
                  key={line.id}
                  className="flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2 transition hover:border-[#e7e1d9]"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {line.characters?.name ?? t.common.labels.personnage}
                  </div>
                  {user ? (
                    <LineHighlightsEditor
                      lineId={line.id}
                      userId={user.id}
                      text={line.text}
                      initialHighlights={highlights}
                      isUserCharacter={Boolean(isUserCharacter)}
                      className={`text-sm ${isUserCharacter ? "font-semibold" : ""} text-[#1c1b1f]`}
                    />
                  ) : (
                    <p className={`text-sm ${isUserCharacter ? "font-semibold" : ""} text-[#1c1b1f]`}>{line.text}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      ),
    },
    {
      id: "statistiques",
      label: t.scenes.detail.tabs.statistiques,
      content: user && sceneStats ? (
        <SceneStatsDetail
          stats={sceneStats}
          lineMastery={lineMastery}
          sceneId={sceneId}
          lastCharacterId={lastCharacterId}
          lastCharacterName={lastCharacterName}
          hasCharacters={scene.characters.length > 0}
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-6 text-center">
          <p className="text-sm text-[#524b5a]">
            {user
              ? "Aucune statistique disponible pour le moment. Commencez à apprendre pour voir vos progrès."
              : "Connectez-vous pour voir vos statistiques."}
          </p>
        </div>
      ),
    },
    {
      id: "reglages",
      label: t.scenes.detail.tabs.reglages,
      content: (
        <div className="flex flex-col gap-6">
          {/* Modifier le texte */}
          {canEdit && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                {t.scenes.detail.reglages.modifierTexte}
              </h3>
              <Link
                href={`/scenes/${sceneId}/edit`}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
              >
                {t.scenes.detail.reglages.modifierTexte}
              </Link>
            </div>
          )}

          {/* Changer de personnage */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
              {t.scenes.detail.reglages.changerPersonnage}
            </h3>
            <div className="flex flex-wrap gap-3">
              {lastCharacterId ? (
                <>
                  <Link
                    href={`/learn/${sceneId}?character=${lastCharacterId}&characterName=${encodeURIComponent(
                      lastCharacterName ?? ""
                    )}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                  >
                    {t.scenes.detail.personnages.continuerEn} {lastCharacterName ?? t.scenes.detail.personnages.monRole}
                  </Link>
                  <div className="w-full text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.scenes.detail.personnages.ouChoisirAutre}
                  </div>
                </>
              ) : null}
              {scene.characters.map((character) => (
                <Link
                  key={character.id}
                  href={`/learn/${sceneId}?character=${character.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
                >
                  {character.name}
                  <span className="text-xs font-medium text-[#7a7184]">
                    {lastCharacterId === character.id
                      ? t.scenes.detail.personnages.dejaChoisi
                      : t.scenes.detail.personnages.choisirCeRole}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Supprimer la scène */}
          {user && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                {deleteLabel}
              </h3>
              {showConfirmDelete ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-[#f2c6c6] bg-[#fff5f5] p-4">
                  <p className="text-sm text-[#7a1f1f]">
                    {confirmDeleteText}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-full bg-[#e11d48] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#c4153c] disabled:opacity-50"
                    >
                      {isDeleting ? "..." : t.scenes.detail.reglages.confirmer}
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmDelete(false);
                        setIsDeleting(false);
                      }}
                      disabled={isDeleting}
                      className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a66] disabled:opacity-50"
                    >
                      {t.scenes.detail.reglages.annuler}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#7a7184] shadow-sm transition hover:border-[#e11d48] hover:text-[#e11d48] disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {deleteLabel}
                </button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Tabs tabs={tabs} defaultTab="apercu" />
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </>
  );
}

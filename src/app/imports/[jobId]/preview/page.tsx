"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import { t } from "@/locales/fr";
import type { ParsedScene } from "@/lib/utils/text-parser";

type ImportJobStatus = "pending" | "processing" | "preview_ready" | "completed" | "error" | string;

type EditorCharacter = {
  id: string;
  name: string;
};

type EditorLine = {
  id: string;
  characterId: string;
  text: string;
  order: number;
};

function uid() {
  const c = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined;
  if (c?.randomUUID) return c.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function move<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function ImportPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState<ImportJobStatus | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");
  const [characters, setCharacters] = useState<EditorCharacter[]>([]);
  const [lines, setLines] = useState<EditorLine[]>([]);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const statusLabel = useMemo(() => {
    switch (jobStatus) {
      case "pending":
        return "En attente…";
      case "processing":
        return "Traitement en cours…";
      case "preview_ready":
        return "Preview prêt";
      case "completed":
        return "Terminé";
      case "error":
        return "Erreur";
      default:
        return jobStatus ? `Statut: ${jobStatus}` : "";
    }
  }, [jobStatus]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/scenes/import/${jobId}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Import introuvable (ou accès refusé).");
        }

        const data = await response.json();
        if (!data.success || !data.job) {
          throw new Error("Réponse invalide.");
        }

        const status = data.job.status as ImportJobStatus;
        setJobStatus(status);

        if (status === "error") {
          setJobError(String(data.job.error_message || "L'import a échoué."));
          setLoading(false);
          return;
        }

        if (status !== "preview_ready") {
          // pending/processing/... : on attend, sans afficher d'erreur
          setLoading(true);
          return;
        }

        const parsedDraft = data.job.draft_data as ParsedScene;
        setDraftTitle(parsedDraft.title || "");
        setDraftAuthor(parsedDraft.author || "");
        
        // Initialiser les personnages avec des IDs uniques
        const characterMap = new Map<string, string>();
        const uniqueCharacters = Array.from(new Set(parsedDraft.characters));
        const editorCharacters = uniqueCharacters.map(name => {
          const id = uid();
          characterMap.set(name, id);
          return { id, name };
        });
        setCharacters(editorCharacters);

        // Initialiser les lignes avec des IDs et référencer les personnages
        const editorLines = parsedDraft.lines.map(line => {
          const characterId = characterMap.get(line.characterName) || editorCharacters[0]?.id || "";
          return {
            id: uid(),
            characterId,
            text: line.text,
            order: line.order
          };
        });
        setLines(editorLines);
        
        setLoading(false);
      } catch (error: any) {
        console.error("Erreur lors de la récupération du job:", error);
        setJobError(error.message || "Erreur lors de la récupération du preview");
        setLoading(false);
      }
    };

    if (jobId) {
      let cancelled = false;
      let interval: number | undefined;

      const tick = async () => {
        if (cancelled) return;
        await fetchJob();
      };

      void tick();
      interval = window.setInterval(tick, 2000);

      return () => {
        cancelled = true;
        if (interval) window.clearInterval(interval);
      };
    }
  }, [jobId]);

  const characterOptions = useMemo(
    () => characters.map((c) => ({ id: c.id, name: c.name })),
    [characters]
  );

  const characterIdSet = useMemo(() => new Set(characters.map((c) => c.id)), [characters]);
  const referencedCharacterIds = useMemo(() => new Set(lines.map((l) => l.characterId)), [lines]);

  const hasErrors = useMemo(() => {
    if (characters.some((c) => (c.name ?? "").trim().length === 0)) return true;
    if (lines.some((l) => (l.text ?? "").trim().length === 0)) return true;
    if (lines.some((l) => !characterIdSet.has(l.characterId))) return true;
    if (lines.length > 0 && characters.length === 0) return true;
    return false;
  }, [characters, characterIdSet, lines]);

  const handleRetry = useCallback(async () => {
    if (!jobId) return;
    setRetrying(true);
    try {
      const response = await fetch(`/api/scenes/import/${jobId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.details || data?.error || "Impossible de relancer l'import.");
      }
      setToast({ message: "Import relancé. Le preview devrait arriver sous peu.", variant: "success" });
      setJobError(null);
      // Le polling existant récupérera ensuite le nouveau statut.
    } catch (e: any) {
      setToast({ message: e?.message || "Impossible de relancer l'import.", variant: "error" });
    } finally {
      setRetrying(false);
    }
  }, [jobId]);

  const addCharacter = useCallback(() => {
    setToast(null);
    const id = uid();
    setCharacters((prev) => [...prev, { id, name: "Nouveau personnage" }]);
    // Si on n'avait aucun personnage, assigner ce personnage aux lignes existantes
    setLines((prev) =>
      prev.map((l) => (l.characterId ? l : { ...l, characterId: id }))
    );
  }, []);

  const addStageDirection = useCallback(() => {
    setToast(null);
    // Chercher si un personnage "Didascalie" existe déjà
    let didascalieChar = characters.find(c => c.name.toLowerCase() === "didascalie");
    
    if (!didascalieChar) {
      // Créer le personnage "Didascalie"
      const id = uid();
      didascalieChar = { id, name: "Didascalie" };
      setCharacters((prev) => [...prev, didascalieChar!]);
    }

    // Ajouter une ligne avec ce personnage
    setLines((prev) => [...prev, { 
      id: uid(), 
      characterId: didascalieChar!.id, 
      text: "",
      order: prev.length + 1
    }]);
  }, [characters]);

  const deleteCharacter = useCallback((id: string) => {
    if (referencedCharacterIds.has(id)) {
      setToast({ message: "Ce personnage est encore utilisé par au moins une réplique.", variant: "error" });
      return;
    }
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  }, [referencedCharacterIds]);

  const addLine = useCallback(() => {
    setToast(null);
    const firstChar = characterOptions[0]?.id;
    if (!firstChar) {
      setToast({ message: "Commence par ajouter au moins un personnage.", variant: "error" });
      return;
    }
    setLines((prev) => [...prev, { 
      id: uid(), 
      characterId: firstChar, 
      text: "",
      order: prev.length + 1
    }]);
  }, [characterOptions]);

  const deleteLine = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const moveLine = useCallback((fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= lines.length) return;
    setLines((prev) => move(prev, fromIdx, toIdx));
  }, [lines.length]);

  const handleCommit = useCallback(async () => {
    if (!draft) return;
    const keepOrders = Array.from(selectedOrders).sort((a, b) => a - b);
    if (keepOrders.length === 0) {
      setToast({ message: "Sélectionnez au moins une réplique.", variant: "error" });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/scenes/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: {
            ...draft,
            title: draftTitle,
            author: draftAuthor || undefined,
          },
          keepOrders,
          jobId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || t.scenes.import.errors.generic);
      }

      setToast({ message: t.scenes.import.success.message, variant: "success" });
      
      // Rediriger vers la scène créée après un court délai
      setTimeout(() => {
        router.push(`/scenes/${data.sceneId}`);
      }, 1500);
    } catch (e: any) {
      setToast({ message: e?.message || t.scenes.import.errors.generic, variant: "error" });
    } finally {
      setSaving(false);
    }
  }, [draft, selectedOrders, draftTitle, draftAuthor, jobId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e7e1d9] border-t-[#3b1f4a]"></div>
        <p className="text-sm text-[#524b5a]">Import en cours…</p>
        {statusLabel ? <p className="text-xs text-[#7a7184]">{statusLabel}</p> : null}
        {(jobStatus === "pending" || jobStatus === "processing") && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] disabled:opacity-50"
          >
            {retrying ? "Relance en cours…" : "Relancer l'import"}
          </button>
        )}
        <Link
          href="/imports"
          className="text-xs font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          Voir tous mes imports
        </Link>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-800">Erreur</p>
          <p className="text-xs text-red-700">{jobError}</p>
          <Link
            href="/imports"
            className="mt-4 inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Retour à mes imports
          </Link>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6">
          <p className="text-sm font-semibold text-[#1c1b1f]">Preview indisponible</p>
          <p className="text-xs text-[#524b5a]">
            Le preview n'est pas encore prêt, ou cet import n'a pas généré de brouillon.
          </p>
          <Link
            href="/imports"
            className="mt-4 inline-block rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            Retour à mes imports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/imports"
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← Retour à mes imports
        </Link>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Preview de l'import
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Sélectionnez les répliques à conserver pour créer votre scène
        </p>
      </div>

      <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.scenes.import.review.fieldTitle}
              </label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.scenes.import.review.fieldAuthor}
              </label>
              <input
                value={draftAuthor}
                onChange={(e) => setDraftAuthor(e.target.value)}
                className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#7a7184]">
              <span className="font-semibold text-[#3b1f4a]">{selectedOrders.size}</span>{" "}
              {t.scenes.import.review.keptCount}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSelectAll}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
              >
                {t.scenes.import.review.selectAll}
              </button>
              <button
                onClick={handleSelectNone}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
              >
                {t.scenes.import.review.selectNone}
              </button>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-[#e7e1d9] bg-white/92">
            <div className="flex flex-col">
              {draft.lines.map((l) => {
                const checked = selectedOrders.has(l.order);
                return (
                  <label
                    key={l.order}
                    className="flex cursor-pointer gap-3 border-b border-[#f0ece6] px-4 py-3 hover:bg-[#f9f7f3]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOrder(l.order)}
                      className="mt-1 h-4 w-4 accent-[#3b1f4a]"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-semibold text-[#7a7184]">
                        {l.order}. <span className="text-[#3b1f4a]">{l.characterName}</span>
                      </div>
                      <p className="text-sm text-[#1c1b1f]">{l.text}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCommit}
            disabled={saving || selectedOrders.size === 0}
            className="w-full rounded-full bg-[#3b1f4a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#2d1638] disabled:opacity-50"
          >
            {saving ? "Création en cours..." : t.scenes.import.review.create}
          </button>
        </div>
      </div>

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


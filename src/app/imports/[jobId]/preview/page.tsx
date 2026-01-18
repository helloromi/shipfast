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
    // Validation
    if (characters.length === 0) {
      setToast({ message: "Ajoute au moins un personnage.", variant: "error" });
      return;
    }
    if (lines.length === 0) {
      setToast({ message: "Ajoute au moins une réplique.", variant: "error" });
      return;
    }
    if (hasErrors) {
      setToast({ message: "Corrige les champs vides avant de créer la scène.", variant: "error" });
      return;
    }

    try {
      setSaving(true);

      // Construire le draft à partir de l'état édité
      const characterMap = new Map(characters.map(c => [c.id, c.name]));
      
      const draft: ParsedScene = {
        title: draftTitle.trim() || "Scène importée",
        author: draftAuthor.trim() || undefined,
        characters: characters.map(c => c.name.trim()),
        lines: lines.map((l, idx) => ({
          characterName: characterMap.get(l.characterId) || "",
          text: l.text.trim(),
          order: idx + 1 // Réordonnancer automatiquement
        }))
      };

      const response = await fetch("/api/scenes/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
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
  }, [characters, lines, draftTitle, draftAuthor, jobId, router, hasErrors]);

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

  if (characters.length === 0 && lines.length === 0 && !loading) {
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
          Éditer avant import
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Modifie le contenu avant de créer ta scène
        </p>
      </div>

      {/* Métadonnées : Titre et Auteur */}
      <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-5 shadow-sm shadow-[#3b1f4a14]">
        <h2 className="mb-3 font-display text-xl font-semibold text-[#3b1f4a]">Informations générales</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
              {t.scenes.import.review.fieldTitle}
            </label>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
              {t.scenes.import.review.fieldAuthor}
            </label>
            <input
              value={draftAuthor}
              onChange={(e) => setDraftAuthor(e.target.value)}
              className="rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
            />
          </div>
        </div>
      </div>

      {/* Section Personnages */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">Personnages</h2>
          <button
            type="button"
            onClick={addCharacter}
            className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a66]"
          >
            + Ajouter
          </button>
        </div>

        {characters.length === 0 ? (
          <p className="text-sm text-[#524b5a]">Aucun personnage. Ajoute-en un pour pouvoir créer des répliques.</p>
        ) : (
          <div className="grid gap-3">
            {characters.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-[#e7e1d9] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Nom</div>
                  <button
                    type="button"
                    onClick={() => deleteCharacter(c.id)}
                    className="text-sm font-semibold text-[#b42318] underline underline-offset-4"
                  >
                    Supprimer
                  </button>
                </div>
                <input
                  value={c.name}
                  onChange={(e) =>
                    setCharacters((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                  }
                  className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                  placeholder="Nom du personnage"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section Répliques */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">Répliques</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addLine}
              className="rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
            >
              + Ajouter une réplique
            </button>
            <button
              type="button"
              onClick={addStageDirection}
              className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a66]"
            >
              + Ajouter une didascalie
            </button>
          </div>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-[#524b5a]">Aucune réplique.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lines.map((l, idx) => {
              const isStageDirection = characters.find(c => c.id === l.characterId)?.name.toLowerCase().includes("didascalie");
              return (
                <div
                  key={l.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(l.id);
                    try {
                      e.dataTransfer.setData("text/plain", l.id);
                    } catch {
                      // ignore
                    }
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragged = (() => {
                      try {
                        return e.dataTransfer.getData("text/plain") || draggingId;
                      } catch {
                        return draggingId;
                      }
                    })();
                    if (!dragged) return;
                    const from = lines.findIndex((x) => x.id === dragged);
                    const to = idx;
                    if (from < 0 || from === to) return;
                    setLines((prev) => move(prev, from, to));
                    setDraggingId(null);
                  }}
                  className={`rounded-2xl border p-4 shadow-sm shadow-[#3b1f4a0f] ${
                    isStageDirection ? "border-[#ffc107] bg-[#fff9e6]" : "border-[#e7e1d9] bg-white"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab select-none rounded-lg border border-[#e7e1d9] bg-[#f9f7f3] px-2 py-1 text-xs font-semibold text-[#7a7184]">
                        ↕
                      </div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                        #{idx + 1}
                      </div>
                      {isStageDirection && (
                        <span className="rounded-full bg-[#ffc107] px-2 py-1 text-xs font-semibold text-[#805b00]">
                          Didascalie
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveLine(idx, idx - 1)}
                        className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a66] disabled:opacity-50"
                        disabled={idx === 0}
                        aria-label="Monter"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLine(idx, idx + 1)}
                        className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a66] disabled:opacity-50"
                        disabled={idx === lines.length - 1}
                        aria-label="Descendre"
                        title="Descendre"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteLine(l.id)}
                        className="text-sm font-semibold text-[#b42318] underline underline-offset-4"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <div className="flex flex-col gap-2 md:col-span-1">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Personnage</div>
                      <select
                        value={l.characterId}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((x) => (x.id === l.id ? { ...x, characterId: e.target.value } : x))
                          )
                        }
                        className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                      >
                        {characterOptions.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name || "—"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Texte</div>
                      <textarea
                        value={l.text}
                        onChange={(e) =>
                          setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, text: e.target.value } : x)))
                        }
                        rows={3}
                        className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                        placeholder="Texte de la réplique"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
            L'ordre est l'ordre d'apparition dans la liste.
          </p>
          {hasErrors && (
            <p className="text-sm font-medium text-[#b42318]">
              Corrige les champs vides avant de créer la scène.
            </p>
          )}
        </div>
      </div>

      {/* Bouton de création final */}
      <div className="sticky bottom-4 rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-lg backdrop-blur-sm">
        <button
          onClick={handleCommit}
          disabled={saving || hasErrors || characters.length === 0 || lines.length === 0}
          className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] disabled:opacity-50"
        >
          {saving ? "Création en cours..." : t.scenes.import.review.create}
        </button>
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


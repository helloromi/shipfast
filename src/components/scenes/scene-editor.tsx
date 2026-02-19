"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Toast } from "@/components/ui/toast";
import { useSupabase } from "@/components/supabase-provider";

type MinimalCharacter = {
  id: string;
  name: string;
};

type MinimalLine = {
  id: string;
  character_id: string;
  text: string;
};

type EditorCharacter = {
  id: string;
  name: string;
};

type EditorLine = {
  id: string;
  characterId: string;
  text: string;
};

type ToastState = {
  message: string;
  variant: "success" | "error";
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

type Props = {
  sceneId: string;
  userId: string;
  initialCharacters: MinimalCharacter[];
  initialLines: MinimalLine[];
  initialTitle?: string;
  initialSummary?: string | null;
};

export function SceneEditor({ sceneId, userId, initialCharacters, initialLines, initialTitle, initialSummary }: Props) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [title, setTitle] = useState<string>(initialTitle ?? "");
  const [summary, setSummary] = useState<string>(initialSummary ?? "");
  const [characters, setCharacters] = useState<EditorCharacter[]>(
    (initialCharacters ?? []).map((c) => ({ id: c.id, name: c.name ?? "" }))
  );
  const [lines, setLines] = useState<EditorLine[]>(
    (initialLines ?? []).map((l) => ({ id: l.id, characterId: l.character_id, text: l.text ?? "" }))
  );

  const persistedLineIdsRef = useRef<Set<string>>(new Set((initialLines ?? []).map((l) => l.id)));

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const characterOptions = useMemo(
    () => characters.map((c) => ({ id: c.id, name: c.name })),
    [characters]
  );

  const characterIdSet = useMemo(() => new Set(characters.map((c) => c.id)), [characters]);
  const referencedCharacterIds = useMemo(() => new Set(lines.map((l) => l.characterId)), [lines]);

  const hasErrors = useMemo(() => {
    if ((title ?? "").trim().length === 0) return true;
    if (characters.some((c) => (c.name ?? "").trim().length === 0)) return true;
    if (lines.some((l) => (l.text ?? "").trim().length === 0)) return true;
    if (lines.some((l) => !characterIdSet.has(l.characterId))) return true;
    if (lines.length > 0 && characters.length === 0) return true;
    return false;
  }, [title, characters, characterIdSet, lines]);

  const save = async () => {
    setToast(null);

    const payload = {
      title: (title ?? "").trim(),
      summary: (summary ?? "").trim() || null,
      characters: characters.map((c) => ({ id: c.id, name: (c.name ?? "").trim() })),
      lines: lines.map((l) => ({ id: l.id, characterId: l.characterId, text: (l.text ?? "").trim() })),
    };

    // Validation côté UI (en plus de l’API)
    if (!payload.title) {
      setToast({ message: "Le titre de la scène est requis.", variant: "error" });
      return;
    }
    if (payload.characters.some((c) => !c.id || !c.name)) {
      setToast({ message: "Chaque personnage doit avoir un nom.", variant: "error" });
      return;
    }
    if (payload.lines.some((l) => !l.id || !l.characterId || !l.text)) {
      setToast({ message: "Chaque réplique doit avoir un personnage et un texte.", variant: "error" });
      return;
    }
    const characterIds = new Set(payload.characters.map((c) => c.id));
    if (payload.lines.some((l) => !characterIds.has(l.characterId))) {
      setToast({ message: "Une réplique référence un personnage inconnu.", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/scenes/${sceneId}/editor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.error || "Impossible d’enregistrer.", variant: "error" });
        return;
      }

      // Les nouvelles lignes viennent d'être upsertées côté serveur : elles sont maintenant persistées
      for (const l of lines) persistedLineIdsRef.current.add(l.id);

      setToast({ message: "Enregistré.", variant: "success" });
      router.refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Erreur réseau.";
      setToast({ message, variant: "error" });
    } finally {
      setSaving(false);
    }
  };


  const addCharacter = () => {
    setToast(null);
    const id = uid();
    setCharacters((prev) => [...prev, { id, name: "Nouveau personnage" }]);
    // Si on n'avait aucun personnage, assigner ce personnage aux lignes existantes (si elles existent).
    setLines((prev) =>
      prev.map((l) => (l.characterId ? l : { ...l, characterId: id }))
    );
  };

  const deleteCharacter = (id: string) => {
    if (referencedCharacterIds.has(id)) {
      setToast({ message: "Ce personnage est encore utilisé par au moins une réplique.", variant: "error" });
      return;
    }
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const addLine = () => {
    setToast(null);
    const firstChar = characterOptions[0]?.id;
    if (!firstChar) {
      setToast({ message: "Commence par ajouter au moins un personnage.", variant: "error" });
      return;
    }
    setLines((prev) => [...prev, { id: uid(), characterId: firstChar, text: "" }]);
  };

  const deleteLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const moveLine = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= lines.length) return;
    setLines((prev) => move(prev, fromIdx, toIdx));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
        <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">Informations de la scène</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="scene-title" className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Titre</label>
            <input
              id="scene-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
              placeholder="Titre de la scène"
              aria-required="true"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="scene-summary" className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Description</label>
            <textarea
              id="scene-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
              placeholder="Description de la scène (optionnel)"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">Personnages</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || hasErrors}
              aria-busy={saving}
              className="rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={addCharacter}
              aria-label="Ajouter un personnage"
              className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a66]"
            >
              + Ajouter
            </button>
          </div>
        </div>

        {characters.length === 0 ? (
          <p className="text-sm text-[#524b5a]">Aucun personnage. Ajoute-en un pour pouvoir créer des répliques.</p>
        ) : (
          <div className="grid gap-3">
            {characters.map((c) => (
              <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-[#e7e1d9] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={`character-name-${c.id}`} className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Nom</label>
                  <button
                    type="button"
                    onClick={() => deleteCharacter(c.id)}
                    aria-label={`Supprimer le personnage ${c.name || "sans nom"}`}
                    className="text-sm font-semibold text-[#b42318] underline underline-offset-4"
                  >
                    Supprimer
                  </button>
                </div>
                <input
                  id={`character-name-${c.id}`}
                  value={c.name}
                  onChange={(e) =>
                    setCharacters((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                  }
                  className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                  placeholder="Nom du personnage"
                  aria-required="true"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">Répliques</h2>
          <button
            type="button"
            onClick={addLine}
            className="rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
          >
            + Ajouter une réplique
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-[#524b5a]">Aucune réplique.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {lines.map((l, idx) => (
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
                  // Nécessaire pour autoriser le drop.
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
                className="rounded-2xl border border-[#e7e1d9] bg-white p-4 shadow-sm shadow-[#3b1f4a0f]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div aria-hidden="true" className="cursor-grab select-none rounded-lg border border-[#e7e1d9] bg-[#f9f7f3] px-2 py-1 text-xs font-semibold text-[#7a7184]">
                      ↕
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                      #{idx + 1}
                    </div>
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
                      aria-label={`Supprimer la réplique ${idx + 1}`}
                      className="text-sm font-semibold text-[#b42318] underline underline-offset-4"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div className="flex flex-col gap-2 md:col-span-1">
                    <label htmlFor={`line-character-${l.id}`} className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Personnage</label>
                    <select
                      id={`line-character-${l.id}`}
                      value={l.characterId}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((x) => (x.id === l.id ? { ...x, characterId: e.target.value } : x))
                        )
                      }
                      aria-label={`Personnage de la réplique ${idx + 1}`}
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
                    <label htmlFor={`line-text-${l.id}`} className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">Texte</label>
                    <textarea
                      id={`line-text-${l.id}`}
                      value={l.text}
                      onChange={(e) =>
                        setLines((prev) => prev.map((x) => (x.id === l.id ? { ...x, text: e.target.value } : x)))
                      }
                      rows={3}
                      className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                      placeholder="Texte de la réplique"
                      aria-label={`Texte de la réplique ${idx + 1}`}
                      aria-required="true"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
            L’ordre est l’ordre d’apparition dans la liste.
          </p>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || hasErrors}
            aria-busy={saving}
            className="rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>

        {hasErrors && (
          <p className="text-sm font-medium text-[#b42318]">
            Corrige les champs vides avant d’enregistrer.
          </p>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          duration={toast.variant === "success" ? 1600 : 4000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}


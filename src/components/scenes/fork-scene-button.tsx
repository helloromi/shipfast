"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sceneId: string;
};

export function ForkSceneButton({ sceneId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fork = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scenes/${sceneId}/fork`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Impossible de créer une copie modifiable.");
        return;
      }
      const newId = data?.sceneId as string | undefined;
      if (!newId) {
        setError("Réponse invalide du serveur.");
        return;
      }
      router.push(`/scenes/${newId}/edit`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void fork()}
        disabled={loading}
        className="inline-flex w-fit items-center justify-center rounded-full bg-[#ff6b6b] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a] disabled:opacity-60"
      >
        {loading ? "Création en cours…" : "Créer une copie modifiable"}
      </button>
      {error && <p className="text-sm font-medium text-[#b42318]">{error}</p>}
    </div>
  );
}


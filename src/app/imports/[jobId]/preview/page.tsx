"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Toast } from "@/components/ui/toast";
import { t } from "@/locales/fr";
import type { ParsedScene } from "@/lib/utils/text-parser";

export default function ImportPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ParsedScene | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/scenes/import/${jobId}`);
        if (!response.ok) {
          throw new Error("Job non trouvé");
        }

        const data = await response.json();
        if (!data.success || !data.job || data.job.status !== "preview_ready") {
          throw new Error("Le preview n'est pas encore prêt");
        }

        const parsedDraft = data.job.draft_data as ParsedScene;
        setDraft(parsedDraft);
        setDraftTitle(parsedDraft.title || "");
        setDraftAuthor(parsedDraft.author || "");
        setSelectedOrders(new Set(parsedDraft.lines.map((l) => l.order)));
      } catch (error: any) {
        console.error("Erreur lors de la récupération du job:", error);
        setToast({
          message: error.message || "Erreur lors de la récupération du preview",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleSelectAll = useCallback(() => {
    if (!draft) return;
    setSelectedOrders(new Set(draft.lines.map((l) => l.order)));
  }, [draft]);

  const handleSelectNone = useCallback(() => {
    setSelectedOrders(new Set());
  }, []);

  const toggleOrder = useCallback((order: number) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  }, []);

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
        <p className="text-sm text-[#524b5a]">Chargement du preview...</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-800">Erreur</p>
          <p className="text-xs text-red-700">Le preview n'est pas disponible.</p>
          <Link
            href="/bibliotheque"
            className="mt-4 inline-block rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/bibliotheque"
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← {t.common.buttons.retourBibliotheque}
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


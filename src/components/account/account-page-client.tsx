"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";

type AccountPageClientProps = {
  userEmail: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function AccountPageClient({ userEmail }: AccountPageClientProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

  const [portalLoading, setPortalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canDelete = useMemo(() => confirmText.trim().toUpperCase() === "SUPPRIMER", [confirmText]);

  const openPortal = async () => {
    setError(null);
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          isRecord(data) && typeof data.error === "string"
            ? data.error
            : "Impossible d’ouvrir le portail de facturation.";
        throw new Error(message);
      }
      const url = isRecord(data) && typeof data.url === "string" ? data.url : null;
      if (!url) throw new Error("URL du portail manquante.");
      window.location.href = url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setPortalLoading(false);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    if (!canDelete) {
      setError("Tapez SUPPRIMER pour confirmer.");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          isRecord(data) && typeof data.error === "string"
            ? data.error
            : "Suppression impossible.";
        throw new Error(message);
      }

      // La session peut ne plus être valide après suppression, mais on tente de nettoyer côté client.
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }

      router.replace("/landing");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e7e1d9] bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-[#3b1f4a]">Abonnement</div>
            <div className="mt-1 text-sm text-[#524b5a]">
              Accédez à votre portail Stripe pour gérer votre abonnement.
              {userEmail ? (
                <span className="block text-xs text-[#6b6471]">Connecté en tant que {userEmail}</span>
              ) : null}
            </div>
          </div>
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2f193b] disabled:opacity-50"
          >
            {portalLoading ? "Ouverture..." : "Gérer mon abonnement"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[#ffd1d1] bg-white/80 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[#b42318]">Zone danger</div>
            <p className="mt-1 text-sm text-[#524b5a]">
              Supprime définitivement votre compte. Cette action est impossible si un abonnement est actif.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='Tapez "SUPPRIMER"'
            className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1C1B1F] placeholder:text-[#8b8493] focus:outline-none focus:ring-2 focus:ring-[#ff6b6b55]"
          />
          <button
            onClick={deleteAccount}
            disabled={deleteLoading || !canDelete}
            className="rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e75a5a] disabled:opacity-50"
          >
            {deleteLoading ? "Suppression..." : "Supprimer mon compte"}
          </button>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-[#ffd1d1] bg-[#ff6b6b0f] px-3 py-2 text-sm text-[#8a1f1f]">
            {error}{" "}
            {error.toLowerCase().includes("abonnement") ? (
              <button
                onClick={openPortal}
                className="ml-2 underline underline-offset-2 hover:text-[#6e1414]"
              >
                Ouvrir Stripe
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}


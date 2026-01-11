"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/supabase-provider";
import { t } from "@/locales/fr";

interface DeleteAccountFormProps {
  hasActiveSubscriptions: boolean;
}

export function DeleteAccountForm({ hasActiveSubscriptions }: DeleteAccountFormProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { supabase } = useSupabase();

  const requiredText = t.account.deleteAccount.confirmText;
  const isConfirmValid = confirmText === requiredText;

  const handleDelete = async () => {
    if (!isConfirmValid) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t.account.deleteAccount.error.generic);
        setLoading(false);
        return;
      }

      // Déconnecter l'utilisateur et rediriger
      await supabase.auth.signOut();
      router.push("/landing");
      router.refresh();
    } catch (err: any) {
      console.error("Error deleting account:", err);
      setError(t.account.deleteAccount.error.generic);
      setLoading(false);
    }
  };

  if (hasActiveSubscriptions) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 font-semibold text-red-900">
          {t.account.deleteAccount.title}
        </h3>
        <p className="text-sm text-red-800">
          {t.account.deleteAccount.error.hasActiveSubscriptions}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h3 className="mb-2 font-semibold text-red-900">{t.account.deleteAccount.title}</h3>
      <p className="mb-4 text-sm text-red-800">{t.account.deleteAccount.description}</p>
      <p className="mb-4 text-sm font-semibold text-red-900">
        {t.account.deleteAccount.warning}
      </p>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-semibold text-red-900">
          {t.account.deleteAccount.confirmText}
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder={requiredText}
        />
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={!isConfirmValid || loading}
          className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "..." : t.account.deleteAccount.button}
        </button>
      </div>
    </div>
  );
}


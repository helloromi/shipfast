"use client";

import { useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { Toast } from "@/components/ui/toast";

type ToastState = {
  message: string;
  variant: "success" | "error";
};

export function MagicLinkForm() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/scenes`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setToast({ message: "Échec de l’envoi du lien", variant: "error" });
      setStatus("error");
      return;
    }

    setStatus("sent");
    setToast({ message: "Lien envoyé ! Vérifie ta boîte mail.", variant: "success" });
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]"
      >
        <label className="text-sm font-semibold text-[#3b1f4a]">
          Email pour recevoir le lien magique
        </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
          placeholder="ton@email.com"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-lg bg-[#ff6b6b] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a] disabled:opacity-60"
        >
          {status === "loading" ? "Envoi..." : "Envoyer le lien"}
        </button>
        {status === "sent" && (
          <p className="text-sm text-[#2cb67d]">
            Lien envoyé ! Vérifie ta boîte mail.
          </p>
        )}
        {error && (
          <p className="text-sm text-[#e11d48]">
            {error}
          </p>
        )}
      </form>
      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
    </>
  );
}

"use client";

import { useState } from "react";

import { useSupabase } from "@/components/supabase-provider";
import { Toast } from "@/components/ui/toast";
import { getSiteUrl } from "@/lib/url";
import { t } from "@/locales/fr";

type Props = {
  /** Chemin interne vers lequel rediriger après connexion (défaut: /onboarding). */
  next?: string;
};

export function GoogleSignInButton({ next = "/onboarding" }: Props) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);

    const redirectUrl = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
    // En cas de succès, le navigateur est redirigé vers Google : pas besoin de reset le loading.
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#1c1b1f] shadow-sm transition hover:-translate-y-[1px] hover:bg-[#faf8f5] disabled:opacity-60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.64v3.02h3.87c2.27-2.09 3.58-5.17 3.58-8.84Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.02c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.12-6.74-4.96H1.26v3.12A11.99 11.99 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.26 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.26a12 12 0 0 0 0 10.78l4-3.12Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4 3.12C6.21 6.87 8.87 4.75 12 4.75Z"
          />
        </svg>
        {loading ? t.login.google.loading : t.login.google.button}
      </button>
      {error && (
        <p className="text-sm text-[#e11d48]" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      {error && <Toast message={t.login.google.errorToast} variant="error" onClose={() => setError(null)} />}
    </>
  );
}

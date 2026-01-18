"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSupabase } from "@/components/supabase-provider";

function safeNextPath(nextParam: string | null | undefined): string {
  if (!nextParam) return "/onboarding";
  if (nextParam.startsWith("/") && !nextParam.startsWith("//")) return nextParam;
  return "/onboarding";
}

export default function AuthCallbackPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = safeNextPath(params.get("next"));

    if (!code) {
      router.replace(`/login?error=${encodeURIComponent("Lien de connexion invalide (code manquant).")}`);
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(async ({ error }) => {
        if (error) {
          router.replace(`/login?error=${encodeURIComponent("Impossible de valider la session. Réessaie.")}`);
          return;
        }

        // Post-login (emails + profil) en best-effort
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {};
        if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

        await fetch("/api/auth/post-login", {
          method: "POST",
          credentials: "include",
          headers,
        })
          .then(async (r) => {
            // Diagnostic non bloquant (utile en dev / support)
            const data = await r.json().catch(() => ({}));
            if (!r.ok) console.warn("post-login failed", { status: r.status, data });
            else if ((data as any)?.welcome && (data as any)?.welcome?.sent === false) {
              console.warn("welcome email skipped", (data as any).welcome);
            }
          })
          .catch(() => null);

        router.replace(next);
      })
      .catch(() => {
        router.replace(`/login?error=${encodeURIComponent("Erreur de connexion. Réessaie.")}`);
      });
  }, [router, supabase]);

  return null;
}


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
        await fetch("/api/auth/post-login", { method: "POST" }).catch(() => null);

        router.replace(next);
      })
      .catch(() => {
        router.replace(`/login?error=${encodeURIComponent("Erreur de connexion. Réessaie.")}`);
      });
  }, [router, supabase]);

  return null;
}


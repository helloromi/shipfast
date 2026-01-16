import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

function safeNextPath(nextParam: string | null | undefined): string {
  if (!nextParam) return "/onboarding";
  // On n'accepte que des chemins relatifs pour éviter les open-redirects.
  if (nextParam.startsWith("/") && !nextParam.startsWith("//")) return nextParam;
  return "/onboarding";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "Lien de connexion invalide (code manquant).");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("error", "Impossible de valider la session. Réessaie.");
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "Erreur de connexion. Réessaie.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}


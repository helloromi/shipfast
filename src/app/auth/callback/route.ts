import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { sendWelcomeEmailIfNeeded } from "@/lib/resend/automation";

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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("error", "Impossible de valider la session. Réessaie.");
      return NextResponse.redirect(loginUrl);
    }

    const userId = data?.user?.id ?? data?.session?.user?.id ?? null;
    const userEmail = data?.user?.email ?? data?.session?.user?.email ?? null;
    const authCreatedAt = (data?.user as any)?.created_at ?? (data?.session?.user as any)?.created_at ?? null;

    if (userId) {
      // Best-effort: aucune de ces étapes ne doit casser la connexion.
      try {
        // Upsert profil (RLS autorise l'utilisateur à écrire sa ligne)
        await supabase.from("user_profiles").upsert(
          {
            user_id: userId,
            email: userEmail,
            auth_created_at: authCreatedAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      } catch (e) {
        console.warn("[AUTH] user_profiles upsert error:", e);
      }

      try {
        // Envoi welcome idempotent + email_state/email_log via service role
        await sendWelcomeEmailIfNeeded(userId);
      } catch (e) {
        console.warn("[AUTH] Welcome email error:", e);
      }

      try {
        // S'assure qu'une ligne user_email_state existe (utile pour les cron), même si l'email a été skippé
        const admin = createSupabaseAdminClient();
        await admin
          .from("user_email_state")
          .upsert({ user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      } catch {
        // ignore
      }
    }
  } catch {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("error", "Erreur de connexion. Réessaie.");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}


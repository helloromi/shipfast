import type { User, SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { isAdmin } from "@/lib/utils/admin";

type RateLimitConfig = {
  key: string | ((userId: string) => string);
  max: number;
  windowMs?: number;
};

type ApiAuthOptions = {
  skipCsrf?: boolean;
  requireAdmin?: boolean;
};

export type ApiAuthSuccess = { ok: true; user: User; supabase: SupabaseClient };
export type ApiAuthError = { ok: false; response: NextResponse };
export type ApiAuthResult = ApiAuthSuccess | ApiAuthError;

/**
 * Guard d'authentification commun pour les routes API.
 *
 * Enchaîne dans l'ordre :
 *   1. Vérification CSRF (sauf si skipCsrf: true)
 *   2. Récupération de l'utilisateur Supabase
 *   3. Vérification admin (si requireAdmin: true)
 *   4. Rate limiting (si rateLimit est fourni)
 *
 * Usage :
 *   const auth = await requireAuth(request, { key: (id) => `my_action:${id}`, max: 30 });
 *   if (!auth.ok) return auth.response;
 *   const { user, supabase } = auth;
 */
export async function requireAuth(
  request: NextRequest,
  rateLimit: RateLimitConfig | null,
  options?: ApiAuthOptions
): Promise<ApiAuthResult> {
  if (!options?.skipCsrf) {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (options?.requireAdmin) {
    const admin = await isAdmin(user.id);
    if (!admin) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  if (rateLimit) {
    const key =
      typeof rateLimit.key === "function" ? rateLimit.key(user.id) : rateLimit.key;
    const rl = checkRateLimit(key, {
      windowMs: rateLimit.windowMs ?? 60_000,
      max: rateLimit.max,
    });
    if (!rl.ok) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
          }
        ),
      };
    }
  }

  return { ok: true, user, supabase };
}

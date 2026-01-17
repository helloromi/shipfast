import { getSiteUrl } from "@/lib/url";

/**
 * Anti-CSRF basique pour les routes mutantes qui reposent sur des cookies.
 * - Vérifie que Origin (ou à défaut Referer) correspond au site.
 * - À utiliser sur POST/PUT/PATCH/DELETE.
 *
 * Note: best-effort. Pour des clients non-navigateurs, prévoir un mécanisme d'auth dédié (token).
 */
export function assertSameOrigin(request: Request): { ok: true } | { ok: false; reason: string } {
  const site = getSiteUrl();
  const expectedOrigin = new URL(site).origin;

  const origin = request.headers.get("origin");
  if (origin) {
    if (origin === expectedOrigin) return { ok: true };
    return { ok: false, reason: `Bad origin: ${origin}` };
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (refOrigin === expectedOrigin) return { ok: true };
      return { ok: false, reason: `Bad referer origin: ${refOrigin}` };
    } catch {
      return { ok: false, reason: "Invalid referer" };
    }
  }

  // Si ni Origin ni Referer ne sont présents, on refuse par défaut pour les routes mutantes.
  return { ok: false, reason: "Missing origin/referer" };
}


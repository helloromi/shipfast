/**
 * Domaine canonique de l'app.
 *
 * Le domaine nu (cote-cour.studio) 307-redirige vers www : toute URL absolue
 * doit donc partir de NEXT_PUBLIC_APP_URL, jamais d'une chaîne en dur.
 *
 * `NEXT_PUBLIC_` est inliné au build par Next : ce module est utilisable
 * côté serveur comme côté client.
 */

export const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(
  /\/$/,
  ""
);

/** URL absolue d'un chemin interne : `absoluteUrl("/rejoindre")`. */
export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Même URL, sans le protocole — pour l'afficher à un humain qui va la recopier
 * ou la dicter (« ils rejoignent la classe sur … »).
 */
export function displayUrl(path: string): string {
  return absoluteUrl(path).replace(/^https?:\/\//, "");
}

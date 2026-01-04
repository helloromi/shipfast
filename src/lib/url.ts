/**
 * Retourne l'URL de base du site.
 * En production, utilise NEXT_PUBLIC_SITE_URL si défini.
 * Sinon, utilise window.location.origin (développement local).
 */
export function getSiteUrl(): string {
  if (typeof window === "undefined") {
    // Côté serveur : utiliser la variable d'environnement
    return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  }

  // Côté client : priorité à la variable d'environnement, sinon window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}




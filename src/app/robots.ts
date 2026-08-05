import type { MetadataRoute } from "next";

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio";
  return base.startsWith("http") ? base : `https://${base}`;
}

/**
 * Préfixes applicatifs fermés au crawl.
 *
 * Le fichier servait `allow: /` sans exception : tout l'espace connecté (compte,
 * imports, classes, tunnel d'achat) était exploré au moment précis où 362 pages
 * scènes attendent de l'être. Ces pages n'ont rien à indexer et, pour la plupart,
 * redirigent vers /login pour un crawler anonyme.
 *
 * Deux règles à ne pas casser en éditant cette liste :
 *
 * 1. Le matching robots.txt est un matching de PRÉFIXE. « /professeur » couvrirait
 *    aussi « /professeurs », qui est une landing publique et indexée. D'où le `$`
 *    (fin d'URL) sur la page seule, et le `/` final sur ses sous-routes.
 * 2. Un `Disallow` n'est PAS un `noindex` : il interdit la lecture de la page, donc
 *    du `noindex` qu'elle contient. Une URL déjà indexée qu'on veut faire sortir de
 *    l'index doit rester crawlable. C'est le cas de `/learn/*` — 3 de ces URLs
 *    ressortent encore en impressions dans Search Console et portent déjà un
 *    `robots: { index: false }` (cf. src/app/learn/[sceneId]/page.tsx) : Google doit
 *    pouvoir aller le lire. Elle n'est donc volontairement pas dans cette liste.
 */
const DISALLOWED_PREFIXES = [
  "/api/",
  "/admin",
  "/auth/",
  "/bibliotheque",
  "/compte",
  "/home",
  "/imports",
  "/login",
  "/mes-cours",
  "/onboarding",
  "/professeur$",
  "/professeur/",
  "/rejoindre",
  "/subscribe",
  "/works/",
  // Espace connecté greffé sous /scenes : l'import et les vues d'édition d'une scène.
  // Le reste de /scenes est le cœur indexable du site et n'est pas touché.
  "/scenes/import",
  "/scenes/*/edit",
  "/scenes/*/export",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: DISALLOWED_PREFIXES },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

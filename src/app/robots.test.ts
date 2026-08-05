import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

/**
 * Matcher robots.txt minimal : préfixe, `*` = n'importe quelle suite, `$` = fin d'URL.
 * Il existe pour que le test raisonne comme Googlebot, et pas comme une égalité de
 * chaînes — c'est justement le matching de préfixe qui rend `/professeur` dangereux.
 */
function isDisallowed(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const anchored = pattern.endsWith("$");
    const body = anchored ? pattern.slice(0, -1) : pattern;
    const source = body
      .split("*")
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join(".*");
    return new RegExp(`^${source}${anchored ? "$" : ""}`).test(path);
  });
}

const rules = robots().rules as { disallow?: string[] };
const disallow = rules.disallow ?? [];

describe("robots.txt", () => {
  it("laisse crawler les pages publiques du funnel", () => {
    for (const path of [
      "/",
      // Ancienne URL de l'accueil : elle redirige en 308 vers `/`, donc elle doit
      // rester crawlable pour que la redirection soit lue et le signal transféré.
      "/landing",
      "/scenes",
      "/scenes/moliere/les-fourberies-de-scapin",
      "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-vii",
      "/ressources",
      "/ressources/scenes-a-deux-personnages",
      "/confidentialite",
    ]) {
      expect(isDisallowed(path, disallow), path).toBe(false);
    }
  });

  it("laisse /professeurs crawlable alors que /professeur est fermé", () => {
    // Le piège du matching de préfixe : un `Disallow: /professeur` non ancré
    // emporterait la landing publique avec l'espace enseignant.
    expect(isDisallowed("/professeurs", disallow)).toBe(false);
    expect(isDisallowed("/professeur", disallow)).toBe(true);
    expect(isDisallowed("/professeur/classes/abc", disallow)).toBe(true);
  });

  it("laisse /learn crawlable pour que son noindex soit lisible", () => {
    // Fermer le crawl empêcherait Google de lire le noindex, donc de désindexer les
    // URLs /learn qui remontent encore en impressions.
    expect(isDisallowed("/learn/abc?character=def", disallow)).toBe(false);
  });

  it("ferme l'espace connecté et les vues d'édition d'une scène", () => {
    for (const path of [
      "/admin",
      "/admin/scenes/create",
      "/compte",
      "/home",
      "/imports",
      "/imports/job-1/preview",
      "/login",
      "/mes-cours",
      "/onboarding",
      "/rejoindre",
      "/subscribe",
      "/bibliotheque",
      "/works/uuid-1",
      "/scenes/import",
      "/scenes/uuid-1/edit",
      "/scenes/uuid-1/export",
      "/api/payments/create-checkout",
    ]) {
      expect(isDisallowed(path, disallow), path).toBe(true);
    }
  });

  it("déclare le sitemap", () => {
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

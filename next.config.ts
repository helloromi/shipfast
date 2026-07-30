import type { NextConfig } from "next";
import { assertEnvValid } from "./src/lib/env-validation";
import { legacySceneRedirects } from "./src/lib/seo/legacy-scene-redirects";

// Valider les variables d'environnement au build time
// En production, cela fera échouer le build si des variables critiques manquent
const isProduction = process.env.NODE_ENV === "production";
try {
  assertEnvValid(isProduction);
} catch (error) {
  // En production, on fait échouer le build
  if (isProduction) {
    throw error;
  }
  // En développement, on affiche juste un avertissement
  console.warn("⚠️  Variables d'environnement manquantes (mode développement)");
}

/**
 * Bots à qui Next doit rendre les métadonnées en BLOQUANT (dans le <head>) au lieu
 * de les streamer après le shell.
 *
 * Par défaut Next exclut Googlebot de cette liste : il le considère capable
 * d'exécuter le JS et compte sur React pour remonter <title>/<meta> dans le <head>
 * à l'hydratation. Sur /ressources/[slug] cette remontée n'a jamais lieu — ni au
 * SSR, ni après hydratation (vérifié au dump-dom) — donc Googlebot était le SEUL
 * agent à ne voir ni title, ni description, ni canonical sur les pages éditoriales,
 * là où Twitterbot et bingbot les voyaient.
 *
 * Ajouter Googlebot ici règle le problème pour toutes les routes d'un coup, sans
 * dépendre du comportement de hoisting côté client.
 *
 * ⚠️ Cette valeur REMPLACE la liste par défaut de Next (elle ne s'y ajoute pas) :
 * c'est une copie de HTML_LIMITED_BOT_UA_RE
 * (node_modules/next/dist/shared/lib/router/utils/html-bots.js) + Googlebot. À
 * re-synchroniser lors d'une montée de version majeure de Next.
 */
const HTML_LIMITED_BOTS =
  /[\w-]+-Google|Google-[\w-]+|Googlebot|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i;

const nextConfig: NextConfig = {
  turbopack: {
    // Force le root pour éviter que Next choisisse /Users/pauloromi à cause d'autres lockfiles
    root: __dirname,
  },
  htmlLimitedBots: HTML_LIMITED_BOTS,
  async redirects() {
    // 308 permanentes vers les URLs canoniques actuelles (cf. le module).
    return legacySceneRedirects.map(({ from, to }) => ({
      source: from,
      destination: to,
      permanent: true,
    }));
  },
};

export default nextConfig;

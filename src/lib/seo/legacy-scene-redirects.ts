/**
 * Redirections 308 permanentes depuis d'anciennes URLs de scènes vers l'URL
 * canonique actuelle. Consommé par next.config.ts (redirects()).
 *
 * Britannicus (16/07/2026) : l'édition originale de 1670 (orthographe en «ſ»,
 * tirades tronquées, actes absents) a été remplacée par l'édition Didot 1854.
 * Les slugs `britannicus-1670-scene-*` n'existent plus en base ; sans ces
 * redirections ils renverraient un 404. La cible a été établie par similarité
 * de contenu entre les deux éditions, pas par numéro de scène : le découpage
 * des actes diffère (l'acte V de 1670 comptait une scène — la mort rapportée
 * de Britannicus — que Didot a fondue ailleurs), d'où l'orpheline redirigée
 * vers la scène survivante la plus proche.
 *
 * 30/07/2026 — cibles aplaties. 24 des 29 entrées visaient un slug suffixé
 * (`acte-i-scene-premiere-4`) qui n'était plus le slug courant mais une valeur de
 * `previous_slugs` : le 308 de next.config atterrissait sur une URL qui redirigeait
 * à son tour, soit une chaîne de deux sauts. Les cibles pointent désormais
 * directement le slug canonique. Régénérable en relisant `scenes.previous_slugs`
 * de l'œuvre `britannicus`.
 *
 * Invariant : chaque `to` doit répondre 200, jamais 3xx. Le vérifier après tout
 * re-sluguage (npm run reslug:scene-slugs).
 */
export const legacySceneRedirects: { from: string; to: string }[] = [
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-premiere", to: "/scenes/jean-racine/britannicus/acte-i-scene-premiere" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-ii", to: "/scenes/jean-racine/britannicus/acte-i-scene-ii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iii", to: "/scenes/jean-racine/britannicus/acte-i-scene-iii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iv", to: "/scenes/jean-racine/britannicus/acte-i-scene-iv" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-ii-2", to: "/scenes/jean-racine/britannicus/acte-ii-scene-ii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iii-2", to: "/scenes/jean-racine/britannicus/acte-ii-scene-iii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iv-2", to: "/scenes/jean-racine/britannicus/acte-ii-scene-iv" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-vi", to: "/scenes/jean-racine/britannicus/acte-ii-scene-vi" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-viii", to: "/scenes/jean-racine/britannicus/acte-ii-scene-viii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-premiere-2", to: "/scenes/jean-racine/britannicus/acte-iii-scene-premiere" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iii-3", to: "/scenes/jean-racine/britannicus/acte-iii-scene-iii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iv-3", to: "/scenes/jean-racine/britannicus/acte-iii-scene-iv" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-v", to: "/scenes/jean-racine/britannicus/acte-iii-scene-v" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-vi-2", to: "/scenes/jean-racine/britannicus/acte-iii-scene-vi" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-vii", to: "/scenes/jean-racine/britannicus/acte-iii-scene-vii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-viii-2", to: "/scenes/jean-racine/britannicus/acte-iii-scene-viii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-ix", to: "/scenes/jean-racine/britannicus/acte-iii-scene-ix" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-ii-3", to: "/scenes/jean-racine/britannicus/acte-iv-scene-ii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iii-4", to: "/scenes/jean-racine/britannicus/acte-iv-scene-iii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iv-4", to: "/scenes/jean-racine/britannicus/acte-iv-scene-iv" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-premiere-3", to: "/scenes/jean-racine/britannicus/acte-v-scene-premiere" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-ii-4", to: "/scenes/jean-racine/britannicus/acte-v-scene-ii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iii-5", to: "/scenes/jean-racine/britannicus/acte-v-scene-iii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-iv-5", to: "/scenes/jean-racine/britannicus/acte-v-scene-iv" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-v-2", to: "/scenes/jean-racine/britannicus/acte-v-scene-v" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-vi-3", to: "/scenes/jean-racine/britannicus/acte-v-scene-vi" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-vii-2", to: "/scenes/jean-racine/britannicus/acte-v-scene-vi" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-viii-3", to: "/scenes/jean-racine/britannicus/acte-v-scene-vii" },
  { from: "/scenes/jean-racine/britannicus/britannicus-1670-scene-derniere", to: "/scenes/jean-racine/britannicus/acte-v-scene-viii" },

  // Déduplication du 30/07/2026 (supabase/seed/dedupe-scenes.ts). Deux générations de
  // seed se chevauchaient : ces slugs portaient le texte d'une scène déjà publiée sous
  // un autre slug, et ont été supprimés en base. Sans ces 308 ils renverraient un 404.
  { from: "/scenes/jean-racine/phedre/acte-i-scene-3", to: "/scenes/jean-racine/phedre/acte-i-scene-iii" },
  // acte-i-scene-3-2 était l'ancien slug de acte-i-scene-3, servi jusqu'ici par
  // previous_slugs. La scène supprimée, cette résolution disparaît avec elle : la
  // redirection doit donc être déclarée ici explicitement.
  { from: "/scenes/jean-racine/phedre/acte-i-scene-3-2", to: "/scenes/jean-racine/phedre/acte-i-scene-iii" },
  { from: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-1", to: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-i" },
];

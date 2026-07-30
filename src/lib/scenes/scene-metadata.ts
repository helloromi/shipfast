import type { Metadata } from "next";

import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";
import { firstThatFits, TITLE_MAX } from "@/lib/seo/text";
import { isThinScene } from "@/lib/seo/thin-scenes";
import { SceneWithRelations } from "@/types/scenes";

/**
 * Plafond dur. Entre les deux on préfère garder le nom de l'œuvre — c'est lui que les
 * gens tapent (« tirade de Perdican On ne badine pas ») — plutôt qu'un title court
 * réduit au seul numéro d'acte, qui serait ambigu entre deux pièces.
 */
const TITLE_HARD_MAX = 68;

/**
 * Metadata SEO d'une page scène, partagée entre la route UUID (/scenes/[identifiant],
 * qui redirige les scènes publiques du domaine public) et la route slug
 * (/scenes/[auteur]/[piece]/[scene], la seule indexée pour ces scènes-là).
 */
export function buildSceneMetadata(scene: SceneWithRelations, canonicalPath: string): Metadata {
  // Les scènes privées ou rattachées à une œuvre hors domaine public
  // ne doivent pas être indexées.
  if (scene.is_private || scene.work?.is_public_domain === false) {
    return { robots: { index: false, follow: false } };
  }

  // Une scène dont le titre reprend celui de l'œuvre (cas des scènes seules)
  // n'a pas à répéter l'œuvre dans le titre.
  const workTitle = scene.work?.title !== scene.title ? scene.work?.title ?? null : null;
  const author = scene.author ?? scene.work?.author ?? null;

  // Ordre de sacrifice : d'abord l'auteur (déductible de l'œuvre), puis le suffixe
  // « : texte intégral ». L'œuvre, elle, est conservée jusqu'au bout : c'est elle qui
  // désambiguïse « Acte IV, scène 3 » entre deux pièces.
  const sceneAndWork = [scene.title, workTitle].filter(Boolean).join(" — ");
  const sceneWorkAuthor = [scene.title, workTitle, author].filter(Boolean).join(" — ");
  const titleCandidates = [
    `${sceneWorkAuthor} : texte intégral`,
    `${sceneAndWork} : texte intégral`,
    sceneWorkAuthor,
    sceneAndWork,
  ];
  // On cherche d'abord une variante sous TITLE_MAX. Si aucune ne tient — œuvre au nom
  // très long — on garde « scène — œuvre » jusqu'à TITLE_HARD_MAX plutôt que de tronquer
  // sur le nom de l'œuvre.
  const title =
    titleCandidates.find((c) => c.length <= TITLE_MAX) ??
    firstThatFits([sceneAndWork, scene.title], TITLE_HARD_MAX);

  const charactersCount = scene.characters.length;
  const kind = charactersCount <= 1 ? "ce monologue" : `cette scène à ${charactersCount} personnages`;
  // Le titre de la scène en tête, jamais précédé de « de » : les titres commencent
  // par « Acte » et produisaient un « Texte intégral de Acte I… » agrammatical.
  // L'auteur est accolé à l'œuvre sans virgule : « Cyrano de Bergerac (Edmond Rostand) ».
  const workAndAuthor = [workTitle, author ? `(${author})` : null].filter(Boolean).join(" ");
  const lead = [scene.title, workAndAuthor || null].filter(Boolean).join(", ");
  const purpose = `texte intégral de ${kind} et flashcards pour l'apprendre`;
  const description = firstThatFits(
    [
      `${lead} : ${purpose}. Gratuit, sans compte.`,
      `${lead} : ${purpose}.`,
      `${[scene.title, workTitle].filter(Boolean).join(", ")} : ${purpose}.`,
      `${scene.title} : ${purpose}.`,
    ],
    155
  );

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: buildOpenGraph({ title, description, url: canonicalPath, type: "article" }),
    twitter: buildTwitter({ title, description }),
    // Scène trop courte pour porter autre chose qu'un texte disponible partout
    // ailleurs : on ne demande pas son indexation, mais `follow` laisse le crawl
    // suivre ses liens (scènes sœurs, page œuvre). Même critère que le sitemap,
    // cf. @/lib/seo/thin-scenes.
    ...(isThinScene(scene) ? { robots: { index: false, follow: true } } : {}),
  };
}

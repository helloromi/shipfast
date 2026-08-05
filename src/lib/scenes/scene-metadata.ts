import type { Metadata } from "next";

import { sceneDisplayName } from "@/lib/scenes/scene-display";
import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";
import { DESCRIPTION_MAX, firstThatFits, leadSentences, truncate, TITLE_MAX } from "@/lib/seo/text";
import { isThinScene } from "@/lib/seo/thin-scenes";
import { SceneWithRelations } from "@/types/scenes";

/**
 * Plafond dur. Entre les deux on préfère garder le nom de l'œuvre — c'est lui que les
 * gens tapent (« tirade de Perdican On ne badine pas ») — plutôt qu'un title court
 * réduit au seul numéro d'acte, qui serait ambigu entre deux pièces.
 */
const TITLE_HARD_MAX = 68;

/**
 * Promesse accolée aux premières phrases de la fiche. C'est elle qui porte l'intention
 * de recherche (« texte intégral ») et la levée d'objection (« sans compte ») que la
 * fiche, purement descriptive, ne contient pas.
 */
const SUMMARY_TAIL = " Texte intégral et flashcards, sans compte.";

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

  // Scène célèbre : c'est son nom d'usage qu'on cherche, pas ses coordonnées.
  // « Le récit de Rodrigue » se tape, « Acte IV, Scène III » non.
  //
  // La coordonnée reste dans le titre quand elle tient, parce que les deux intentions
  // coexistent dans Search Console (« monologue hermione acte 5 scène 1 » porte les
  // deux). Elle est reconstruite depuis scene.title en retirant sa parenthèse finale :
  // 5 des 20 titres nommés la contiennent déjà (« Acte I, scène 4 (la tirade du nez) »)
  // et produiraient sinon un titre qui répète deux fois le même nom.
  const { heading: nicknameOrTitle, coordinate } = sceneDisplayName(scene);
  const nickname = coordinate ? nicknameOrTitle : null;
  const nicknameCandidates = nickname
    ? [
        [nickname, [workTitle, coordinate].filter(Boolean).join(", ")].filter(Boolean).join(" — "),
        workTitle ? `${nickname} — ${workTitle} : texte intégral` : "",
        [nickname, workTitle].filter(Boolean).join(" — "),
        [nickname, coordinate].filter(Boolean).join(" — "),
        nickname,
      ].filter(Boolean)
    : [];

  // On cherche d'abord une variante sous TITLE_MAX. Si aucune ne tient — œuvre au nom
  // très long — on garde « scène — œuvre » jusqu'à TITLE_HARD_MAX plutôt que de tronquer
  // sur le nom de l'œuvre.
  const title =
    [...nicknameCandidates, ...titleCandidates].find((c) => c.length <= TITLE_MAX) ??
    firstThatFits(nickname ? [nickname] : [sceneAndWork, scene.title], TITLE_HARD_MAX);

  const charactersCount = scene.characters.length;
  const kind = charactersCount <= 1 ? "ce monologue" : `cette scène à ${charactersCount} personnages`;
  // Le titre de la scène en tête, jamais précédé de « de » : les titres commencent
  // par « Acte » et produisaient un « Texte intégral de Acte I… » agrammatical.
  // L'auteur est accolé à l'œuvre sans virgule : « Cyrano de Bergerac (Edmond Rostand) ».
  const workAndAuthor = [workTitle, author ? `(${author})` : null].filter(Boolean).join(" ");
  const lead = [scene.title, workAndAuthor || null].filter(Boolean).join(", ");
  const purpose = `texte intégral de ${kind} et flashcards pour l'apprendre`;
  const fallbackDescription = firstThatFits(
    [
      `${lead} : ${purpose}. Gratuit, sans compte.`,
      `${lead} : ${purpose}.`,
      `${[scene.title, workTitle].filter(Boolean).join(", ")} : ${purpose}.`,
      `${scene.title} : ${purpose}.`,
    ],
    DESCRIPTION_MAX
  );

  // Ce gabarit produisait la MÊME description sur les 362 pages scènes, à l'acte et au
  // nombre de personnages près. Google la réécrivait à partir du corps de page, et
  // quand il ne la réécrivait pas elle n'incitait à rien : 0,8 % de CTR à la position
  // 10 sur les pages scènes, contre 11 % sur les guides /ressources (Search Console,
  // 3 mois au 03/08/2026).
  //
  // Les 362 scènes portent désormais une fiche : ses premières phrases DÉCRIVENT la
  // scène et ne ressemblent à aucune autre page. On ne garde que des phrases entières
  // — une description coupée en plein milieu est justement ce que Google réécrit.
  //
  // Quatre paliers, du meilleur au dernier recours (relevé sur les 362 scènes au
  // 05/08/2026) :
  //   1. fiche + promesse, en phrases entières ...... 274 scènes
  //   2. fiche seule, en phrases entières ............ 56 scènes (1re phrase > 112)
  //   3. fiche tronquée sur une limite de mot ........ 32 scènes (1re phrase > 155)
  //   4. gabarit générique ............................ 0 scène (scènes sans fiche)
  // Le palier 3 existe parce qu'une fiche tronquée reste UNIQUE : mieux vaut ça que
  // renvoyer 32 pages au gabarit, qui les rendrait identiques entre elles — c'est le
  // problème qu'on corrige ici, on ne va pas le réintroduire par la porte de derrière.
  const summaryText = (scene.summary ?? "").replace(/\s*\n\s*/g, " ").trim();
  const summaryLead = summaryText
    ? leadSentences(summaryText, DESCRIPTION_MAX - SUMMARY_TAIL.length)
    : "";
  const description = summaryLead
    ? `${summaryLead}${SUMMARY_TAIL}`
    : summaryText
      ? leadSentences(summaryText, DESCRIPTION_MAX) || truncate(summaryText, DESCRIPTION_MAX)
      : fallbackDescription;

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

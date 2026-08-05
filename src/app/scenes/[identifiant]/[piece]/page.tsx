import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import {
  fetchPublicWorkBySlug,
  fetchPublicWorkSlugs,
  type PublicWorkWithScenes,
} from "@/lib/queries/works";
import { sceneDisplayName } from "@/lib/scenes/scene-display";
import { buildBreadcrumbJsonLd, buildWorkJsonLd } from "@/lib/seo/json-ld";
import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";
import { DESCRIPTION_MAX, firstThatFits, leadSentences, truncate, TITLE_MAX } from "@/lib/seo/text";
import { slugify } from "@/lib/utils/slugify";

/**
 * Page œuvre : /scenes/[auteur]/[piece].
 *
 * Elle comble le trou de maillage entre la page liste et les pages scènes. Avant,
 * /scenes ne liait aucune page scène : elle passait par /works/[uuid], une route
 * indexable sur URL UUID, absente du sitemap, dont le contenu était rendu côté
 * client, et qui liait à son tour des /scenes/[uuid] redirigeant en 308. Toute page
 * scène était donc à deux sauts et une redirection de la page liste.
 *
 * Le segment `identifiant` est le slug de l'auteur (nommé ainsi parce qu'il est
 * partagé avec /scenes/[identifiant] qui reçoit un UUID — cf. le commentaire de
 * [scene]/page.tsx). Pas de conflit de routing avec `edit`/`export` : un segment
 * statique est toujours prioritaire sur un segment dynamique.
 */
type Props = {
  params: Promise<{ identifiant: string; piece: string }>;
};

// Mémoïsé par requête : generateMetadata et la page partagent le même fetch.
const getWork = cache(fetchPublicWorkBySlug);

/**
 * Le catalogue du domaine public ne bouge qu'aux seeds : la page est mise en cache
 * et revalidée à l'heure, au lieu d'être re-rendue à chaque passage de crawler.
 * Depuis que fetchPublicWorkBySlug lit sans cookies, plus rien ici n'oblige au
 * rendu dynamique. Une œuvre seedée après le build est rendue à la demande puis
 * mise en cache à son tour (dynamicParams par défaut).
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const works = await fetchPublicWorkSlugs();
  return works.map((work) => ({ identifiant: slugify(work.author ?? ""), piece: work.slug }));
}

/** Promesse accolée à la fiche dans la description, cf. SUMMARY_TAIL des pages scènes. */
const WORK_SUMMARY_TAIL = " Toutes les scènes, texte intégral et gratuit.";

/**
 * Minuscule initiale, uniquement sur un mot ordinaire (« Comédie » → « comédie »).
 * Un nom propre ou un sigle en tête de phrase est laissé intact : la fiche de Roméo &
 * Juliette pourrait très bien commencer par « Tragédie », mais une autre par « Molière ».
 */
function lowerFirst(text: string): string {
  return /^[A-ZÀ-Ý][a-zà-ÿ]/.test(text) ? text[0]!.toLowerCase() + text.slice(1) : text;
}

function canonicalPathFor(work: PublicWorkWithScenes): string {
  return `/scenes/${slugify(work.author ?? "")}/${work.slug}`;
}

function buildWorkCopy(work: PublicWorkWithScenes) {
  const count = work.scenes.length;
  const scenesLabel = count === 1 ? "1 scène" : `${count} scènes`;
  const title = firstThatFits(
    [
      `${work.title}, ${work.author} : toutes les scènes`,
      `${work.title} : toutes les scènes`,
      work.title,
    ],
    TITLE_MAX
  );
  // Même raisonnement que sur les pages scènes : la fiche d'abord, le gabarit ensuite.
  // Le gabarit ne varie que par le titre et le nombre de scènes — c'est mieux que rien,
  // mais ça ne dit pas au lecteur ce qu'il trouvera sur la page.
  //
  // Le titre de l'œuvre préfixe la fiche : toutes les fiches ouvrent sur la forme et la
  // date (« Comédie en trois actes et en prose, créée en 1671. »), ce qui décrirait
  // aussi bien vingt autres pièces. Une description qui ne nomme pas son sujet ne sert
  // à rien dans une page de résultats.
  const prefix = `${work.title} : `;
  const summaryText = (work.summary ?? "").replace(/\s*\n\s*/g, " ").trim();
  const summaryLead = summaryText
    ? leadSentences(summaryText, DESCRIPTION_MAX - WORK_SUMMARY_TAIL.length - prefix.length)
    : "";
  const fallback = truncate(
    `${work.title}${work.author ? ` (${work.author})` : ""} : ${scenesLabel} au texte intégral, ` +
      `à lire et à apprendre en mode flashcard. Gratuit, sans compte.`,
    DESCRIPTION_MAX
  );
  const description = summaryLead
    ? `${prefix}${lowerFirst(summaryLead)}${WORK_SUMMARY_TAIL}`
    : summaryText
      ? leadSentences(summaryText, DESCRIPTION_MAX) || truncate(summaryText, DESCRIPTION_MAX)
      : fallback;

  return { title, description, scenesLabel };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifiant: auteurSlug, piece: pieceSlug } = await params;
  const work = await getWork(pieceSlug);
  if (!work) return {};

  const canonicalPath = canonicalPathFor(work);
  // Segment auteur non canonique : la page redirige, inutile d'émettre des métadonnées.
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}`) return {};

  const { title, description } = buildWorkCopy(work);
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: buildOpenGraph({ title, description, url: canonicalPath, type: "article" }),
    twitter: buildTwitter({ title, description }),
  };
}

export default async function WorkScenesPage({ params }: Props) {
  const { identifiant: auteurSlug, piece: pieceSlug } = await params;

  const work = await getWork(pieceSlug);
  if (!work) {
    notFound();
  }

  // Sur Next 16.0.10, permanentRedirect() appelé depuis generateMetadata ne produit
  // pas un vrai statut HTTP : le redirect reste dans le composant de page (même
  // raison que dans /scenes/[identifiant]/page.tsx).
  const canonicalPath = canonicalPathFor(work);
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}`) {
    permanentRedirect(canonicalPath);
  }

  const { scenesLabel } = buildWorkCopy(work);
  const hrefFor = (sceneSlug: string) => `${canonicalPath}/${sceneSlug}`;

  // Les fiches sont stockées en paragraphes séparés par une ligne vide (même
  // convention que scenes.summary).
  const summaryParagraphs = (work.summary ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const namedScenes = work.scenes.filter(
    (scene): scene is typeof scene & { nickname: string } => !!scene.nickname?.trim()
  );

  // Regroupement par acte. sortScenesDramaturgical (appliqué dans la requête) trie
  // d'abord par acte, donc les scènes d'un même acte sont déjà contiguës.
  const groups: { chapter: string; scenes: PublicWorkWithScenes["scenes"] }[] = [];
  for (const scene of work.scenes) {
    const chapter = scene.chapter ?? "Autres scènes";
    const last = groups[groups.length - 1];
    if (last && last.chapter === chapter) last.scenes.push(scene);
    else groups.push({ chapter, scenes: [scene] });
  }

  const jsonLd = buildWorkJsonLd({
    title: work.title,
    canonicalPath,
    author: work.author,
    summary: work.summary,
    // Même nom dans l'ItemList que dans le lien rendu juste en dessous.
    scenes: work.scenes.map((scene) => ({
      title: sceneDisplayName(scene).heading,
      path: hrefFor(scene.slug),
    })),
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Scènes", path: "/scenes" },
    { name: work.title, path: canonicalPath },
  ]);

  return (
    <div className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav aria-label="Fil d'Ariane" className="text-sm text-[#7a7184]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/scenes" className="underline underline-offset-4 hover:text-[#3b1f4a]">
              Scènes
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li aria-current="page" className="font-semibold text-[#3b1f4a]">
            {work.title}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          {work.author ?? "Auteur inconnu"}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">{work.title}</h1>
        <p className="text-sm text-[#524b5a]">
          {scenesLabel} au texte intégral, gratuites et sans compte.
        </p>
        {/* La fiche œuvre, rendue côté serveur et en paragraphes. C'est le seul contenu
            de cette page qui n'existe pas déjà sur un site de textes : sans elle, la
            page se réduit à un sommaire de liens — c'est ce qui la tenait entre les
            positions 33 et 48 alors que ses pages scènes sortent entre 5 et 10. */}
        {summaryParagraphs.length > 0 && (
          <div className="mt-2 flex max-w-2xl flex-col gap-3">
            {summaryParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-[#1c1b1f]">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </header>

      {/* Scènes célèbres : les scènes de l'œuvre qui portent un nom d'usage. Aucune
          rédaction supplémentaire — la donnée existe déjà (scenes.nickname) — et ça
          donne à la page œuvre un bloc de liens dont l'ancre est ce que les gens
          tapent réellement (« le récit de Rodrigue » plutôt que « Acte IV, Scène III »). */}
      {namedScenes.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/70 p-5">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
            {namedScenes.length === 1 ? "Scène célèbre" : "Scènes célèbres"}
          </h2>
          <ul className="flex flex-col gap-2">
            {namedScenes.map((scene) => (
              <li key={scene.id}>
                <Link
                  href={hrefFor(scene.slug)}
                  className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
                >
                  {scene.nickname}
                </Link>
                <span className="ml-2 text-xs text-[#7a7184]">{scene.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.chapter} className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{group.chapter}</h2>
            <ol className="flex flex-col gap-1">
              {group.scenes.map((scene) => {
                // Ancre de lien : le nom d'usage quand il existe, la coordonnée en
                // complément. « Acte IV, Scène III » seul ne dit à personne — ni au
                // lecteur, ni à Google — que c'est le récit de Rodrigue.
                const { heading, coordinate } = sceneDisplayName(scene);
                return (
                  <li key={scene.id}>
                    <Link
                      href={hrefFor(scene.slug)}
                      className="block rounded-xl border border-transparent px-3 py-2 text-sm text-[#524b5a] underline underline-offset-4 transition hover:border-[#e7e1d9] hover:bg-white hover:text-[#3b1f4a]"
                    >
                      {heading}
                      {coordinate && (
                        <span className="ml-2 text-xs text-[#7a7184] no-underline">
                          {coordinate}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

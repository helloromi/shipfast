import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchPublicWorkBySlug, type PublicWorkWithScenes } from "@/lib/queries/works";
import { buildBreadcrumbJsonLd, buildWorkJsonLd } from "@/lib/seo/json-ld";
import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";
import { firstThatFits, truncate, TITLE_MAX } from "@/lib/seo/text";
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
  const description = truncate(
    `${work.title}${work.author ? ` (${work.author})` : ""} : ${scenesLabel} au texte intégral, ` +
      `à lire et à apprendre en mode flashcard. Gratuit, sans compte.`,
    155
  );
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
    scenes: work.scenes.map((scene) => ({ title: scene.title, path: hrefFor(scene.slug) })),
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
        {work.summary && (
          <p className="max-w-2xl text-sm leading-relaxed text-[#1c1b1f]">{work.summary}</p>
        )}
      </header>

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.chapter} className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{group.chapter}</h2>
            <ol className="flex flex-col gap-1">
              {group.scenes.map((scene) => (
                <li key={scene.id}>
                  <Link
                    href={hrefFor(scene.slug)}
                    className="block rounded-xl border border-transparent px-3 py-2 text-sm text-[#524b5a] underline underline-offset-4 transition hover:border-[#e7e1d9] hover:bg-white hover:text-[#3b1f4a]"
                  >
                    {scene.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

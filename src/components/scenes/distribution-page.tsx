import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchScenesForDistribution, type SceneForDistribution } from "@/lib/queries/works";
import { sceneDisplayName } from "@/lib/scenes/scene-display";
import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/urls";
import { getDistribution, distributionPath } from "@/lib/seo/distributions";
import { countLabel } from "@/lib/utils/plural";
import { sortScenesDramaturgical } from "@/lib/utils/scene-order";
import { slugify } from "@/lib/utils/slugify";

/**
 * Corps d'une page de distribution, partagé par les trois routes (/scenes/monologues,
 * /scenes/scenes-a-4-personnages, /scenes/scenes-a-5-personnages-et-plus).
 *
 * URLs plates sous /scenes plutôt qu'un préfixe /scenes/distribution/… : ce préfixe
 * créerait un segment parent qui n'existe pas et renverrait 404, exactement le défaut
 * déjà constaté sur /scenes/[auteur]. Le hub de ces pages est /scenes, qui les lie.
 *
 * Le segment statique l'emporte sur le segment dynamique voisin `[identifiant]`, donc
 * ces routes ne peuvent pas être confondues avec un slug d'auteur.
 */
export async function DistributionPage({ slug }: { slug: string }) {
  const distribution = getDistribution(slug);
  if (!distribution) notFound();

  const scenes = (await fetchScenesForDistribution()).filter((scene) =>
    distribution.matches(scene.characterCount)
  );

  // Une page de distribution vide ne doit pas être servie en 200 : elle n'aurait rien
  // à lister et serait un doublon de coquille vide. Le cas ne se présente pas
  // aujourd'hui (22, 32 et 42 scènes) mais un changement de seuil pourrait le créer.
  if (scenes.length === 0) notFound();

  const byWork = groupByWork(scenes);
  // Le JSON-LD reprend l'ordre affiché, pas l'ordre de la requête : déclarer un
  // ItemList dans un ordre différent de celui de la page serait une contradiction.
  const orderedScenes = byWork.flatMap((group) => group.scenes);
  const path = distributionPath(slug);

  const breadcrumb = [
    { name: "Scènes", path: "/scenes" },
    { name: distribution.h1, path },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: distribution.h1,
    numberOfItems: scenes.length,
    itemListElement: orderedScenes.map((scene, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: sceneDisplayName(scene).heading,
      url: absoluteUrl(scenePath(scene)),
    })),
  };

  return (
    <div className="flex flex-col gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumb)) }}
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
            {distribution.h1}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Par distribution
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">{distribution.h1}</h1>
        <p className="text-sm text-[#524b5a]">
          {scenes.length} scènes au texte intégral, gratuites et sans compte.
        </p>
        <div className="flex max-w-2xl flex-col gap-3">
          {distribution.intro.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-[#1c1b1f]">
              {paragraph}
            </p>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {byWork.map((group) => (
          <section key={group.workSlug} className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
              <Link href={group.workPath} className="underline underline-offset-4">
                {group.workTitle}
              </Link>
              {group.author && (
                <span className="ml-2 text-sm font-normal text-[#7a7184]">{group.author}</span>
              )}
            </h2>
            <ul className="flex flex-col gap-1">
              {group.scenes.map((scene) => {
                const { heading, coordinate } = sceneDisplayName(scene);
                return (
                  <li key={scene.id}>
                    <Link
                      href={scenePath(scene)}
                      className="block rounded-xl border border-transparent px-3 py-2 text-sm text-[#524b5a] underline underline-offset-4 transition hover:border-[#e7e1d9] hover:bg-white hover:text-[#3b1f4a]"
                    >
                      {heading}
                      {coordinate && (
                        <span className="ml-2 text-xs text-[#7a7184] no-underline">
                          {coordinate}
                        </span>
                      )}
                      {distribution.showRoleCount && (
                        <span className="ml-2 text-xs text-[#7a7184] no-underline">
                          · {countLabel(scene.characterCount, { one: "rôle", other: "rôles" })}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div>
        <Link href="/scenes" className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4">
          ← Tout le catalogue
        </Link>
      </div>
    </div>
  );
}

function scenePath(scene: SceneForDistribution): string {
  return `/scenes/${slugify(scene.work.author ?? "")}/${scene.work.slug}/${scene.slug}`;
}

type WorkGroup = {
  workSlug: string;
  workTitle: string;
  workPath: string;
  author: string | null;
  scenes: SceneForDistribution[];
};

/**
 * Regroupement par œuvre, œuvres par ordre alphabétique. Une liste de 42 scènes à plat
 * est illisible sur un écran de 375px ; groupée par pièce, elle se parcourt.
 */
function groupByWork(scenes: SceneForDistribution[]): WorkGroup[] {
  const groups = new Map<string, WorkGroup>();
  for (const scene of scenes) {
    const existing = groups.get(scene.work.slug);
    if (existing) {
      existing.scenes.push(scene);
      continue;
    }
    groups.set(scene.work.slug, {
      workSlug: scene.work.slug,
      workTitle: scene.work.title,
      workPath: `/scenes/${slugify(scene.work.author ?? "")}/${scene.work.slug}`,
      author: scene.work.author,
      scenes: [scene],
    });
  }
  return [...groups.values()]
    // Ordre alphabétique des œuvres, ordre dramaturgique des scènes à l'intérieur :
    // une liste rendue dans l'ordre de retour de PostgREST n'a aucun sens pour le
    // lecteur, qui parcourt une pièce acte par acte.
    .map((group) => ({ ...group, scenes: sortScenesDramaturgical(group.scenes) }))
    .sort((a, b) => a.workTitle.localeCompare(b.workTitle, "fr"));
}

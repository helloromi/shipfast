import { absoluteUrl } from "@/lib/seo/urls";

/**
 * Constructeurs de JSON-LD partagés. Le balisage des pages scènes était réduit à
 * name/author/isPartOf/inLanguage : ni `@id`, ni `url`, donc rien qui rattache
 * l'entité à son URL canonique — et le même bloc était servi à l'identique sur les
 * URLs UUID. Le CLAUDE.md demande par ailleurs `CreativeWork/Play` : aucun `Play`
 * n'était émis.
 */

const PUBLISHER = {
  "@type": "Organization",
  name: "Côté-Cour",
  url: absoluteUrl("/"),
  logo: { "@type": "ImageObject", url: absoluteUrl("/apple-touch-icon.png") },
} as const;

type SceneJsonLdInput = {
  title: string;
  /** Chemin canonique de la page scène. */
  canonicalPath: string;
  author: string | null;
  summary: string | null;
  characters: { name: string }[];
  work: { title: string; path: string | null } | null;
  /** ISO. `scenes` n'a pas d'updated_at : created_at fait office de date de publication. */
  datePublished: string | null;
};

export function buildSceneJsonLd({
  title,
  canonicalPath,
  author,
  summary,
  characters,
  work,
  datePublished,
}: SceneJsonLdInput) {
  const url = absoluteUrl(canonicalPath);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": url,
    url,
    name: title,
    // La fiche est stockée en paragraphes ; `description` est un champ texte plat.
    ...(summary ? { description: summary.replace(/\s*\n\s*/g, " ").trim() } : {}),
    ...(author ? { author: { "@type": "Person", name: author } } : {}),
    ...(work
      ? {
          isPartOf: {
            // Une pièce de théâtre, pas un CreativeWork générique.
            "@type": "Play",
            name: work.title,
            ...(work.path ? { "@id": absoluteUrl(work.path), url: absoluteUrl(work.path) } : {}),
          },
        }
      : {}),
    inLanguage: "fr",
    isAccessibleForFree: true,
    ...(datePublished ? { datePublished } : {}),
    publisher: PUBLISHER,
    ...(characters.length > 0
      ? { character: characters.map((c) => ({ "@type": "Person", name: c.name })) }
      : {}),
  };
}

type WorkJsonLdInput = {
  title: string;
  canonicalPath: string;
  author: string | null;
  summary: string | null;
  scenes: { title: string; path: string }[];
};

export function buildWorkJsonLd({
  title,
  canonicalPath,
  author,
  summary,
  scenes,
}: WorkJsonLdInput) {
  const url = absoluteUrl(canonicalPath);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Play",
        "@id": url,
        url,
        name: title,
        ...(summary ? { description: summary } : {}),
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        inLanguage: "fr",
        isAccessibleForFree: true,
        publisher: PUBLISHER,
      },
      {
        "@type": "ItemList",
        name: `Scènes de ${title}`,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        numberOfItems: scenes.length,
        itemListElement: scenes.map((scene, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: scene.title,
          url: absoluteUrl(scene.path),
        })),
      },
    ],
  };
}

/**
 * Fil d'Ariane. Aucun BreadcrumbList n'existait sur le site : Google reconstruisait
 * la hiérarchie à partir des seules URLs.
 */
export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

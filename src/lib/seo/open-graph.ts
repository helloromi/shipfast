import type { Metadata } from "next";

/**
 * Construit le bloc `openGraph` d'une page.
 *
 * Raison d'être : Next ne fusionne PAS en profondeur l'objet `openGraph` d'une page
 * avec celui du layout racine. Dès qu'une page en déclare un, elle repart de zéro et
 * perd silencieusement tout ce qu'elle ne re-déclare pas — y compris l'image issue
 * du fichier src/app/opengraph-image.tsx, que Next n'injecte plus dès lors qu'un
 * `openGraph` explicite existe.
 *
 * C'est ce qui avait vidé og:image sur 184 des 189 pages du site : les seules à
 * garder une image étaient celles qui ne déclaraient aucun openGraph. Passer par ce
 * helper garantit que `type`, `locale` et `images` sont toujours re-déclarés, et
 * qu'un futur champ ajouté ici bénéficie à toutes les pages d'un coup.
 */

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Côté-Cour – Application pour apprendre son texte de théâtre et mémoriser ses répliques",
};

type BuildOpenGraphInput = {
  title: string;
  description: string;
  /** Chemin ou URL absolue. Résolu contre metadataBase par Next. */
  url?: string;
  type?: "website" | "article";
};

export function buildOpenGraph({
  title,
  description,
  url,
  type = "website",
}: BuildOpenGraphInput): Metadata["openGraph"] {
  return {
    title,
    description,
    ...(url ? { url } : {}),
    type,
    locale: "fr_FR",
    siteName: "Côté-Cour",
    images: [OG_IMAGE],
  };
}

/**
 * Carte Twitter correspondante. Même piège : `twitter` ne fusionne pas non plus, et
 * sans `images` la carte retombe de summary_large_image à summary.
 */
export function buildTwitter({ title, description }: { title: string; description: string }): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE.url],
  };
}

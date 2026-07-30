import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-moliere" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Les scènes de Molière à jouer en cours de théâtre",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de Molière : 23 extraits à jouer, texte intégral",
  description:
    "23 scènes de Molière à jouer en cours ou en audition : Scapin, Le Malade imaginaire, Le Misanthrope, L'Avare. Texte intégral gratuit et mode flashcard.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-05-27"),
};

type Groupe = "Les Fourberies de Scapin" | "Le Malade imaginaire" | "Le Misanthrope" | "Autres pièces";

type Scene = {
  /** Titre de l'œuvre (schema CreativeWork.isPartOf + affichage). */
  work: string;
  /** Auteur (schema CreativeWork.author + affichage). */
  author: string;
  /** Libellé acte/scène tel qu'affiché. */
  sceneLabel: string;
  /** Personnages de la scène, dans l'ordre d'apparition en base. */
  characters: string;
  /** Nombre de répliques — sert à jauger la longueur avant de cliquer. */
  lines: number;
  /** URL relative canonique vers la page scène. */
  href: string;
  /** Section de regroupement. */
  group: Groupe;
};

/**
 * Sélection transversale sur Molière, l'auteur le plus demandé du répertoire
 * français. Regroupée par pièce : c'est ainsi qu'un atelier choisit, en partant
 * d'une œuvre puis en cherchant la scène qui va à sa distribution.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const scenesMoliere: Scene[] = [
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène VII",
    characters: "Scapin / Argante",
    lines: 84,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-vii",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte III, scène II",
    characters: "Scapin / Géronte",
    lines: 59,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-iii-scene-ii",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène VI",
    characters: "Scapin / Argante / Sylvestre",
    lines: 106,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-vi",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène XI",
    characters: "Scapin / Géronte",
    lines: 92,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-xi",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène V",
    characters: "Octave / Scapin / Léandre",
    lines: 60,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-v",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Sylvestre / Octave",
    lines: 27,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-i",
    group: "Les Fourberies de Scapin",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène III",
    characters: "Argan / Béralde",
    lines: 80,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-iii",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène IX",
    characters: "Argan / Monsieur de Bonnefoi / Béline",
    lines: 40,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-ix",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène II",
    characters: "Argan / Toinette",
    lines: 27,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-ii",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène VI",
    characters: "Argan / Monsieur Purgon / Toinette",
    lines: 56,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-vi",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène IV",
    characters: "Toinette / Angélique",
    lines: 39,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-iv",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène XVI",
    characters: "Toinette / Argan / Béralde",
    lines: 26,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-xvi",
    group: "Le Malade imaginaire",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène première",
    characters: "Philinte / Alceste",
    lines: 70,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-premiere",
    group: "Le Misanthrope",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène 2",
    characters: "Oronte / Alceste",
    lines: 49,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-2",
    group: "Le Misanthrope",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte III, scène 5",
    characters: "Arsinoé / Célimène",
    lines: 42,
    href: "/scenes/moliere/le-misanthrope/acte-iii-scene-5",
    group: "Le Misanthrope",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte IV, scène 3",
    characters: "Célimène / Alceste",
    lines: 45,
    href: "/scenes/moliere/le-misanthrope/acte-iv-scene-3",
    group: "Le Misanthrope",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Chrysalde / Arnolphe",
    lines: 71,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-i-scene-i",
    group: "Autres pièces",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte I, scène V",
    characters: "Arnolphe / Horace",
    lines: 51,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-i-scene-v",
    group: "Autres pièces",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte V, scène II",
    characters: "Horace / Arnolphe",
    lines: 29,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-v-scene-ii",
    group: "Autres pièces",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte I, scène 5",
    characters: "Lucas / Valère / Martine",
    lines: 47,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-5",
    group: "Autres pièces",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte I, scène 6",
    characters: "Sganarelle / Valère / Lucas / Sganrelle",
    lines: 109,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-6",
    group: "Autres pièces",
  },
  {
    work: "L'Avare",
    author: "Molière",
    sceneLabel: "Acte I, scène 3",
    characters: "Harpagon / La Flèche",
    lines: 66,
    href: "/scenes/moliere/l-avare/acte-i-scene-3",
    group: "Autres pièces",
  },
  {
    work: "L'Avare",
    author: "Molière",
    sceneLabel: "Acte IV, scène 7",
    characters: "Harpagon",
    lines: 6,
    href: "/scenes/moliere/l-avare/acte-iv-scene-7",
    group: "Autres pièces",
  },
];

export function scenesMoliereSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Les Fourberies de Scapin", "Le Malade imaginaire", "Le Misanthrope", "Autres pièces"];

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-[#524b5a]">{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display mt-8 text-xl font-semibold text-[#3b1f4a] first:mt-0">
      {children}
    </h2>
  );
}

function InternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <NextLink
      href={href}
      className="font-semibold text-[#3b1f4a] underline underline-offset-2 hover:no-underline"
    >
      {children}
    </NextLink>
  );
}

export function Body() {
  return (
    <>
      <P>
        Molière est l’auteur le plus joué en atelier, et pour de bonnes raisons : la prose se
        retient plus vite que l’alexandrin, les rôles sont nettement caractérisés, et une scène
        se comprend sans avoir lu toute la pièce. Les 23 extraits ci-dessous couvrent sept
        comédies, du valet meneur au bourgeois berné.
      </P>
      <P>
        Ils sont regroupés par pièce, parce que c’est ainsi qu’on choisit en atelier : on part
        d’une œuvre, puis on cherche la scène qui va à la distribution qu’on a. Le nombre de
        répliques est indiqué pour jauger la longueur.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {scenesMoliere
              .filter((scene) => scene.group === groupe)
              .map((scene) => (
                <li key={scene.href} className="text-sm leading-relaxed text-[#524b5a]">
                  <InternalLink href={scene.href}>
                    {scene.work} — {scene.sceneLabel}
                  </InternalLink>{" "}
                  ({scene.characters}) · {scene.author} · {scene.lines} répliques
                </li>
              ))}
          </ul>
        </section>
      ))}

      <H2>Par quelle pièce commencer</H2>
      <P>
        Pour un groupe débutant, <em>Les Fourberies de Scapin</em> reste le meilleur point
        d’entrée : les scènes sont courtes, le moteur comique est explicite, et il y a de quoi
        distribuer à deux comme à trois. <em>Le Malade imaginaire</em> demande un peu plus de
        métier — Argan doit rester attachant dans son entêtement, sinon la pièce devient
        désagréable. <em>Le Misanthrope</em>, en alexandrins, est le plus exigeant des trois et
        s’adresse à un groupe qui a déjà travaillé le vers.
      </P>
      <P>
        Selon la taille du groupe, la sélection par distribution peut être plus pratique :{" "}
        <InternalLink href="/ressources/scenes-a-deux-personnages">duos</InternalLink>,{" "}
        <InternalLink href="/ressources/scenes-de-theatre-a-3-personnages">trios</InternalLink>, ou{" "}
        <InternalLink href="/ressources/scenes-de-theatre-courtes">scènes courtes</InternalLink>.
      </P>

    </>
  );
}

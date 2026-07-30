import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-deux-hommes" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre pour deux hommes",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de théâtre pour deux hommes : 14 duos à jouer",
  description:
    "14 scènes de théâtre à jouer entre deux hommes, en cours ou en audition : Racine, Molière, Corneille. Texte intégral et mode flashcard, sans compte.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-06-24"),
};

type Groupe = "Tragédie" | "Comédie";

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
 * Duos dont les deux rôles sont masculins. Pendant de la sélection féminine :
 * même méthode, sélection faite sur les personnages réellement en base pour
 * chaque scène et non sur le titre de l'œuvre.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const duosMasculins: Scene[] = [
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène II",
    characters: "Titus / Paulin",
    lines: 62,
    href: "/scenes/jean-racine/berenice/acte-ii-scene-ii",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène II",
    characters: "Narcisse / Néron",
    lines: 52,
    href: "/scenes/jean-racine/britannicus/acte-ii-scene-ii",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène première",
    characters: "Oreste / Pylade",
    lines: 40,
    href: "/scenes/jean-racine/andromaque/acte-i-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène première",
    characters: "Hippolyte / Théramène",
    lines: 43,
    href: "/scenes/jean-racine/phedre/acte-i-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte IV, scène III",
    characters: "Don Rodrigue / Don Fernand",
    lines: 33,
    href: "/scenes/pierre-corneille/le-cid/acte-iv-scene-iii",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène II",
    characters: "Oreste / Pyrrhus",
    lines: 30,
    href: "/scenes/jean-racine/andromaque/acte-i-scene-ii",
    group: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène première",
    characters: "Titus / Antiochus",
    lines: 33,
    href: "/scenes/jean-racine/berenice/acte-iii-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène IV",
    characters: "Narcisse / Néron",
    lines: 35,
    href: "/scenes/jean-racine/britannicus/acte-iv-scene-iv",
    group: "Tragédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène III",
    characters: "Argan / Béralde",
    lines: 80,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-iii",
    group: "Comédie",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Chrysalde / Arnolphe",
    lines: 71,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-i-scene-i",
    group: "Comédie",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène première",
    characters: "Philinte / Alceste",
    lines: 70,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-premiere",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène VII",
    characters: "Scapin / Argante",
    lines: 84,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-vii",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte III, scène II",
    characters: "Scapin / Géronte",
    lines: 59,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-iii-scene-ii",
    group: "Comédie",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène 2",
    characters: "Oronte / Alceste",
    lines: 49,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-2",
    group: "Comédie",
  },
];

export function duosMasculinsSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Tragédie", "Comédie"];

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
        Le duo masculin est la configuration la plus fournie du répertoire classique : le
        confident, le rival, le père et le fils, le maître et le valet. Les 14 scènes ci-dessous
        ont leurs deux rôles écrits pour des hommes, sans transposition ni coupe.
      </P>
      <P>
        Elles vont de la joute d’idées — Alceste et Philinte, Argan et Béralde — à l’affrontement
        direct. Toutes relèvent du domaine public : texte intégral accessible sans compte, mode
        flashcard inclus.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {duosMasculins
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

      <H2>Deux façons de jouer un duo masculin</H2>
      <P>
        Les scènes de confidence — Oreste et Pylade, Hippolyte et Théramène, Titus et Paulin —
        reposent sur l’écoute : l’un déballe, l’autre tempère, et le rythme vient de la relance.
        Les scènes d’affrontement — Scapin et Géronte, Alceste et Oronte, Néron et Narcisse —
        reposent sur le rapport de force, qui doit basculer au moins une fois pour que la scène
        tienne.
      </P>
      <P>
        Pour la sélection symétrique, voir les{" "}
        <InternalLink href="/ressources/scenes-de-theatre-deux-femmes">
          scènes pour deux femmes
        </InternalLink>. Pour un groupe de trois, les{" "}
        <InternalLink href="/ressources/scenes-de-theatre-a-3-personnages">
          scènes à trois personnages
        </InternalLink>.
      </P>

    </>
  );
}

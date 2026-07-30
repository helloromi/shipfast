import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-courtes" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre courtes à jouer en cours",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de théâtre courtes : 18 extraits de moins de 5 minutes",
  description:
    "18 scènes de théâtre courtes à jouer en cours ou en atelier, de 2 à 3 personnages : Molière, Racine, Musset. Texte intégral et mode flashcard, sans compte.",
  publishedAt: new Date("2026-07-30"),
};

type Groupe = "Moins de 2 minutes" | "2 à 3 minutes";

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
 * Scènes assez courtes pour être montées et présentées dans une même séance.
 * Filtre : 2 à 3 personnages, entre 900 et 2 600 caractères de texte. Les durées
 * annoncées sont des ordres de grandeur (~1 000 caractères par minute dite), pas
 * des mesures — elles servent à trier, pas à chronométrer.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const courtes: Scene[] = [
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène X",
    characters: "Angélique / Toinette",
    lines: 8,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-x",
    group: "Moins de 2 minutes",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène III",
    characters: "Hermione / Cléone",
    lines: 10,
    href: "/scenes/jean-racine/andromaque/acte-iii-scene-iii",
    group: "Moins de 2 minutes",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène II",
    characters: "Oreste / Hermione",
    lines: 10,
    href: "/scenes/jean-racine/andromaque/acte-iii-scene-ii",
    group: "Moins de 2 minutes",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène IV",
    characters: "Albine / Agrippine",
    lines: 7,
    href: "/scenes/jean-racine/britannicus/acte-iii-scene-iv",
    group: "Moins de 2 minutes",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène II",
    characters: "Bérénice / Phénice",
    lines: 8,
    href: "/scenes/jean-racine/berenice/acte-iv-scene-ii",
    group: "Moins de 2 minutes",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte II, scène XII",
    characters: "Béralde / Argan",
    lines: 11,
    href: "/scenes/moliere/le-malade-imaginaire/acte-ii-scene-xii",
    group: "Moins de 2 minutes",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène VII",
    characters: "Sylvestre / Scapin",
    lines: 6,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-vii",
    group: "Moins de 2 minutes",
  },
  {
    work: "Lorenzaccio",
    author: "Alfred de Musset",
    sceneLabel: "Acte III, scène 3",
    characters: "Lorenzo / Philippe",
    lines: 7,
    href: "/scenes/alfred-de-musset/lorenzaccio/acte-iii-scene-3",
    group: "Moins de 2 minutes",
  },
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène V",
    characters: "Œnone / Phèdre",
    lines: 8,
    href: "/scenes/jean-racine/phedre/acte-i-scene-v",
    group: "Moins de 2 minutes",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène X",
    characters: "Scapin / Argante",
    lines: 22,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-x",
    group: "2 à 3 minutes",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Sylvestre / Octave",
    lines: 27,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-i",
    group: "2 à 3 minutes",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène II",
    characters: "Argan / Toinette",
    lines: 27,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-ii",
    group: "2 à 3 minutes",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte III, scène III",
    characters: "Sganarelle / Jacqueline",
    lines: 17,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-iii-scene-iii",
    group: "2 à 3 minutes",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène première",
    characters: "Burrhus / Néron",
    lines: 15,
    href: "/scenes/jean-racine/britannicus/acte-iii-scene-premiere",
    group: "2 à 3 minutes",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène VI",
    characters: "Britannicus / Junie",
    lines: 17,
    href: "/scenes/jean-racine/britannicus/acte-ii-scene-vi",
    group: "2 à 3 minutes",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène V",
    characters: "Phénice / Bérénice",
    lines: 15,
    href: "/scenes/jean-racine/berenice/acte-i-scene-v",
    group: "2 à 3 minutes",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène III",
    characters: "Agrippine / Junie",
    lines: 11,
    href: "/scenes/jean-racine/britannicus/acte-v-scene-iii",
    group: "2 à 3 minutes",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène XVIII",
    characters: "Toinette / Argan / Béline",
    lines: 22,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-xviii",
    group: "2 à 3 minutes",
  },
];

export function courtesSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Moins de 2 minutes", "2 à 3 minutes"];

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
        Une séance d’atelier ne laisse pas toujours le temps de monter une grande scène. Les 18
        extraits ci-dessous se travaillent et se présentent dans la même séance : deux ou trois
        personnages, un enjeu clair, et une durée qui tient en quelques minutes.
      </P>
      <P>
        Les durées indiquées sont des ordres de grandeur, calculés sur la longueur du texte — elles
        servent à trier, pas à chronométrer. Le nombre de répliques donne une idée plus juste du
        rythme : beaucoup de répliques courtes se jouent vite, une tirade unique demande plus de
        souffle.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {courtes
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

      <H2>Court ne veut pas dire facile</H2>
      <P>
        Une scène brève laisse moins de place pour s’installer : l’enjeu doit être posé dès la
        première réplique, et une hésitation s’y entend davantage que dans une scène longue. C’est
        justement ce qui en fait un bon exercice — et une bonne raison de connaître le texte
        parfaitement plutôt qu’à peu près.
      </P>
      <P>
        La{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          méthode flashcard
        </InternalLink>{" "}
        s’applique directement : chaque scène se teste en masquant les répliques, gratuitement et
        sans compte. Pour un groupe plus grand, voir les{" "}
        <InternalLink href="/ressources/scenes-de-theatre-a-3-personnages">
          scènes à trois personnages
        </InternalLink>.
      </P>

    </>
  );
}

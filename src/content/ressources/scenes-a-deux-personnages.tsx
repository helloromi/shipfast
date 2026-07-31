import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-a-deux-personnages" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre à 2 personnages à jouer en duo",
  // <title> HTML : distinct du H1, construit sur la requête cible. Utilisé
  // verbatim (sans suffixe de marque) car c'est de la copy validée.
  metaTitle: "Scènes de théâtre à 2 personnages : 20 extraits à jouer en duo",
  description:
    "20 scènes de théâtre à deux personnages pour une audition ou un cours en duo : Molière, Racine, Corneille, Marivaux, Musset, Hugo. Texte intégral et mode flashcard, sans compte.",
  publishedAt: new Date("2026-07-24"),
};

type Registre = "Tragédie" | "Comédie" | "Drame";

type Duo = {
  /** Titre de l'œuvre (schema CreativeWork.isPartOf + affichage). */
  work: string;
  /** Auteur (schema CreativeWork.author + affichage). */
  author: string;
  /** Libellé acte/scène tel qu'affiché (ex. « Acte I, scène IV »). */
  sceneLabel: string;
  /** Les deux personnages de la scène, ordre éditorial fixé. */
  characters: string;
  /** URL relative canonique vers la page scène (auteur / œuvre / scène). */
  href: string;
  /** Registre de regroupement. */
  registre: Registre;
};

/**
 * Source unique : sert à la fois au rendu des sections (groupées par registre)
 * et au schema ItemList (chaque scène en CreativeWork) construit dans
 * src/app/ressources/[slug]/page.tsx. Les 20 scènes sont déjà en base et en
 * ligne individuellement — cette page ne fait que mailler vers l'existant.
 * Chaque href a été vérifié en base : auteur + les deux personnages correspondent.
 */
export const duos: Duo[] = [
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène IV",
    characters: "Pyrrhus / Andromaque",
    href: "/scenes/jean-racine/andromaque/acte-i-scene-iv",
    registre: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène V",
    characters: "Hermione / Pyrrhus",
    href: "/scenes/jean-racine/andromaque/acte-iv-scene-v",
    registre: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène IV",
    characters: "Bérénice / Titus",
    href: "/scenes/jean-racine/berenice/acte-ii-scene-iv",
    registre: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène V",
    characters: "Bérénice / Titus",
    href: "/scenes/jean-racine/berenice/acte-v-scene-v",
    registre: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène II",
    characters: "Burrhus / Agrippine",
    href: "/scenes/jean-racine/britannicus/acte-i-scene-ii",
    registre: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène III",
    characters: "Néron / Junie",
    href: "/scenes/jean-racine/britannicus/acte-ii-scene-iii",
    registre: "Tragédie",
  },
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène 3",
    characters: "Phèdre / Œnone",
    href: "/scenes/jean-racine/phedre/acte-i-scene-iii",
    registre: "Tragédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte V, scène première",
    characters: "Rodrigue / Chimène",
    href: "/scenes/pierre-corneille/le-cid/acte-v-scene-premiere",
    registre: "Tragédie",
  },
  {
    work: "L’Avare",
    author: "Molière",
    sceneLabel: "Acte I, scène 3",
    characters: "Harpagon / La Flèche",
    href: "/scenes/moliere/l-avare/acte-i-scene-3",
    registre: "Comédie",
  },
  {
    work: "Le Bourgeois gentilhomme",
    author: "Molière",
    sceneLabel: "Acte II, scène 4 (la prose)",
    characters: "Maître de philosophie / Jourdain",
    href: "/scenes/moliere/le-bourgeois-gentilhomme/acte-ii-scene-4-la-prose",
    registre: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène II",
    characters: "Argan / Toinette",
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-ii",
    registre: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène III",
    characters: "Béralde / Argan",
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-iii",
    registre: "Comédie",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Sganarelle / Martine",
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-i",
    registre: "Comédie",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte III, scène VII",
    characters: "Géronte / Sganarelle",
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-iii-scene-vii",
    registre: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène VII",
    characters: "Scapin / Argante",
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-vii",
    registre: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène XI",
    characters: "Géronte / Scapin",
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-xi",
    registre: "Comédie",
  },
  {
    work: "Le Jeu de l’amour et du hasard",
    author: "Marivaux",
    sceneLabel: "Acte III, scène 8",
    characters: "Silvia / Dorante",
    href: "/scenes/marivaux/le-jeu-de-l-amour-et-du-hasard/acte-iii-scene-8",
    registre: "Comédie",
  },
  {
    work: "Les Caprices de Marianne",
    author: "Alfred de Musset",
    sceneLabel: "Acte II, scène 1",
    characters: "Cœlio / Octave",
    href: "/scenes/alfred-de-musset/les-caprices-de-marianne/acte-ii-scene-1",
    registre: "Comédie",
  },
  {
    work: "On ne badine pas avec l'amour",
    author: "Alfred de Musset",
    sceneLabel: "Acte III, scène 8",
    characters: "Camille / Perdican",
    href: "/scenes/alfred-de-musset/on-ne-badine-pas-avec-l-amour/acte-iii-scene-8-tirade-de-perdican",
    registre: "Drame",
  },
  {
    work: "Hernani",
    author: "Victor Hugo",
    sceneLabel: "Acte III, scène 4",
    characters: "Hernani / Doña Sol",
    href: "/scenes/victor-hugo/hernani/acte-iii-scene-4",
    registre: "Drame",
  },
];

/** Ordre d'affichage des registres (et des groupes dans le schema ItemList). */
const registres: Registre[] = ["Tragédie", "Comédie", "Drame"];

/** `name` du CreativeWork dans le schema ItemList (cf. articles.ts). */
export function duoSchemaName(duo: Duo): string {
  return `${duo.work} — ${duo.sceneLabel} (${duo.characters})`;
}

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
        Pour une audition en binôme, un cours ou un atelier, il faut une scène à deux qui tient
        sans coupe : deux rôles à peu près équilibrés, un vrai échange à jouer. Les 20 extraits
        ci-dessous sont regroupés par registre — tragédie, comédie, drame — pour t’aider à choisir
        vite selon ce que tu cherches.
      </P>
      <P>
        Toutes ces scènes sont du domaine public : texte intégral accessible sans compte, avec le
        mode flashcard pour les apprendre à deux.
      </P>

      {registres.map((registre) => (
        <section key={registre} className="flex flex-col gap-2">
          <H2>{registre}</H2>
          <ul className="flex flex-col gap-3">
            {duos
              .filter((duo) => duo.registre === registre)
              .map((duo) => (
                <li key={duo.href} className="text-sm leading-relaxed text-[#524b5a]">
                  <InternalLink href={duo.href}>
                    {duo.work} — {duo.sceneLabel}
                  </InternalLink>{" "}
                  ({duo.characters}) · {duo.author}
                </li>
              ))}
          </ul>
        </section>
      ))}

      <H2>Comment travailler une scène à deux</H2>
      <P>
        Une scène de duo se prépare réplique par réplique : chacun connaît son texte, mais aussi les
        répliques de l’autre, pour rebondir sans temps mort. La{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          méthode flashcard
        </InternalLink>{" "}
        — masquer chaque réplique et la retrouver de mémoire — s’applique directement : tu peux
        tester n’importe laquelle de ces scènes en mode flashcard, gratuitement et sans compte.
      </P>
      <P>
        <InternalLink href="/login">Crée un compte gratuit</InternalLink> pour sauvegarder ta
        progression sur la scène que tu choisis de travailler.
      </P>
    </>
  );
}

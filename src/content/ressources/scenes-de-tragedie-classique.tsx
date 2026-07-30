import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-tragedie-classique" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de tragédie classique à travailler",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de tragédie classique : 15 extraits de Racine et Corneille",
  description:
    "15 scènes de tragédie classique à travailler en cours : Phèdre, Britannicus, Bérénice, Le Cid, Horace. Texte intégral en alexandrins, gratuit et sans compte.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-07-21"),
};

type Groupe = "Racine" | "Corneille";

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
 * Grandes scènes de Racine et Corneille. Sélection resserrée sur les passages qui
 * tiennent seuls, hors contexte de la pièce — c'est la condition pour les
 * travailler en atelier ou les présenter en audition.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const tragedies: Scene[] = [
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène III",
    characters: "Phèdre / Œnone",
    lines: 65,
    href: "/scenes/jean-racine/phedre/acte-i-scene-iii",
    group: "Racine",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène II",
    characters: "Agrippine / Néron",
    lines: 52,
    href: "/scenes/jean-racine/britannicus/acte-iv-scene-ii",
    group: "Racine",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène III",
    characters: "Néron / Junie",
    lines: 53,
    href: "/scenes/jean-racine/britannicus/acte-ii-scene-iii",
    group: "Racine",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène V",
    characters: "Bérénice / Titus",
    lines: 52,
    href: "/scenes/jean-racine/berenice/acte-iv-scene-v",
    group: "Racine",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène II",
    characters: "Titus / Paulin",
    lines: 62,
    href: "/scenes/jean-racine/berenice/acte-ii-scene-ii",
    group: "Racine",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène IV",
    characters: "Pyrrhus / Andromaque",
    lines: 41,
    href: "/scenes/jean-racine/andromaque/acte-i-scene-iv",
    group: "Racine",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène VI",
    characters: "Pyrrhus / Phœnix / Andromaque / Céphise",
    lines: 31,
    href: "/scenes/jean-racine/andromaque/acte-iii-scene-vi",
    group: "Racine",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène première",
    characters: "Hermione",
    lines: 10,
    href: "/scenes/jean-racine/andromaque/acte-v-scene-premiere",
    group: "Racine",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène première",
    characters: "Albine / Agrippine",
    lines: 39,
    href: "/scenes/jean-racine/britannicus/acte-i-scene-premiere",
    group: "Racine",
  },
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène première",
    characters: "Hippolyte / Théramène",
    lines: 43,
    href: "/scenes/jean-racine/phedre/acte-i-scene-premiere",
    group: "Racine",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte III, scène IV",
    characters: "Chimène / Don Rodrigue / Elvire",
    lines: 69,
    href: "/scenes/pierre-corneille/le-cid/acte-iii-scene-iv",
    group: "Corneille",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte IV, scène III",
    characters: "Don Rodrigue / Don Fernand",
    lines: 33,
    href: "/scenes/pierre-corneille/le-cid/acte-iv-scene-iii",
    group: "Corneille",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte I, scène 4 (les imprécations de Don Diègue)",
    characters: "Don Diègue",
    lines: 6,
    href: "/scenes/pierre-corneille/le-cid/acte-i-scene-4-les-imprecations-de-don-diegue",
    group: "Corneille",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte II, scène VIII",
    characters: "Don Diègue / Chimène / Don Fernand",
    lines: 36,
    href: "/scenes/pierre-corneille/le-cid/acte-ii-scene-viii",
    group: "Corneille",
  },
  {
    work: "Horace",
    author: "Pierre Corneille",
    sceneLabel: "Acte III, scène 6",
    characters: "Le Vieil Horace / Julie / Camille / Sabine",
    lines: 23,
    href: "/scenes/pierre-corneille/horace/acte-iii-scene-6",
    group: "Corneille",
  },
];

export function tragediesSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Racine", "Corneille"];

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
        La tragédie classique fait peur en atelier, souvent à tort : l’alexandrin est une contrainte
        de diction, mais c’est aussi un appui de mémoire. Douze syllabes, une rime, une césure —
        le vers se retient mieux que la prose une fois le mouvement d’ensemble compris.
      </P>
      <P>
        Les 15 scènes ci-dessous ont été choisies parce qu’elles tiennent seules, hors du contexte
        de la pièce : c’est la condition pour les travailler en atelier ou les présenter devant un
        jury. Texte intégral, sans compte.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {tragedies
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

      <H2>Aborder l’alexandrin sans le réciter</H2>
      <P>
        L’erreur la plus courante est de marquer chaque fin de vers, ce qui produit une
        psalmodie. Le vers se travaille en repérant d’abord les phrases — qui débordent souvent
        d’un vers sur l’autre — puis en laissant la rime affleurer sans la souligner. Apprendre
        par groupes de deux à quatre vers, plutôt que vers à vers, aide à garder la phrase.
      </P>
      <P>
        Pour une tirade seule plutôt qu’une scène, voir les sélections pour{" "}
        <InternalLink href="/ressources/tirades-monologues-femme-audition">femme</InternalLink> et
        pour{" "}
        <InternalLink href="/ressources/quel-monologue-choisir-pour-une-audition-homme">
          homme
        </InternalLink>.
      </P>

    </>
  );
}

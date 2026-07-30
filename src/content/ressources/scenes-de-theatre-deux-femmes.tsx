import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-deux-femmes" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre pour deux femmes",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de théâtre pour deux femmes : 14 duos à jouer",
  description:
    "14 scènes de théâtre à jouer entre deux femmes, en cours ou en audition : Racine, Molière. Texte intégral et mode flashcard, gratuit et sans compte.",
  publishedAt: new Date("2026-07-30"),
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
 * Duos dont les deux rôles sont féminins — la distribution la plus demandée en
 * atelier, où les groupes sont souvent majoritairement féminins, et la plus mal
 * servie par les recueils. Sélection faite sur les personnages réellement en
 * base pour chaque scène, pas sur le titre de l'œuvre.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const duosFeminins: Scene[] = [
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène III",
    characters: "Phèdre / Œnone",
    lines: 65,
    href: "/scenes/jean-racine/phedre/acte-i-scene-iii",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène première",
    characters: "Albine / Agrippine",
    lines: 39,
    href: "/scenes/jean-racine/britannicus/acte-i-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène première",
    characters: "Hermione / Cléone",
    lines: 29,
    href: "/scenes/jean-racine/andromaque/acte-ii-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte IV, scène première",
    characters: "Céphise / Andromaque",
    lines: 28,
    href: "/scenes/jean-racine/andromaque/acte-iv-scene-premiere",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène VIII",
    characters: "Céphise / Andromaque",
    lines: 27,
    href: "/scenes/jean-racine/andromaque/acte-iii-scene-viii",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène II",
    characters: "Hermione / Cléone",
    lines: 22,
    href: "/scenes/jean-racine/andromaque/acte-v-scene-ii",
    group: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène V",
    characters: "Phénice / Bérénice",
    lines: 15,
    href: "/scenes/jean-racine/berenice/acte-i-scene-v",
    group: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte II, scène V",
    characters: "Bérénice / Phénice",
    lines: 11,
    href: "/scenes/jean-racine/berenice/acte-ii-scene-v",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène III",
    characters: "Agrippine / Junie",
    lines: 11,
    href: "/scenes/jean-racine/britannicus/acte-v-scene-iii",
    group: "Tragédie",
  },
  {
    work: "Phèdre",
    author: "Jean Racine",
    sceneLabel: "Acte I, scène V",
    characters: "Œnone / Phèdre",
    lines: 8,
    href: "/scenes/jean-racine/phedre/acte-i-scene-v",
    group: "Tragédie",
  },
  {
    work: "Andromaque",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène IV",
    characters: "Andromaque / Hermione",
    lines: 9,
    href: "/scenes/jean-racine/andromaque/acte-iii-scene-iv",
    group: "Tragédie",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte III, scène 5",
    characters: "Arsinoé / Célimène",
    lines: 42,
    href: "/scenes/moliere/le-misanthrope/acte-iii-scene-5",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène IV",
    characters: "Toinette / Angélique",
    lines: 39,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-iv",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène X",
    characters: "Angélique / Toinette",
    lines: 8,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-x",
    group: "Comédie",
  },
];

export function duosFemininsSchemaName(scene: Scene): string {
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
        Les groupes d’atelier sont souvent majoritairement féminins, et les recueils de scènes le
        sont rarement : on finit par redistribuer un rôle d’homme, ou par jouer toujours les mêmes
        trois extraits. Les 14 scènes ci-dessous ont leurs deux rôles écrits pour des femmes, sans
        transposition.
      </P>
      <P>
        Racine domine la liste, et ce n’est pas un hasard : ses confidentes ne sont pas des
        faire-valoir mais de vraies partenaires de scène, avec de la matière à jouer. Toutes ces
        scènes relèvent du domaine public — texte intégral sans compte, mode flashcard inclus.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {duosFeminins
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

      <H2>Choisir entre la confidente et la rivale</H2>
      <P>
        Ces duos se répartissent en deux familles. Celui de la confidence — Phèdre et Œnone,
        Hermione et Cléone, Bérénice et Phénice — où l’une avoue et l’autre pousse : le moteur est
        la pression, pas le conflit. Et celui de l’affrontement — Arsinoé et Célimène, Agrippine et
        Junie, Andromaque et Hermione — où deux volontés se heurtent à visage découvert. La
        première famille demande de la retenue, la seconde de l’attaque. Choisir en connaissance
        de cause évite de travailler trois semaines une scène qui ne correspond pas au binôme.
      </P>
      <P>
        Pour une tirade seule plutôt qu’un duo, voir les{" "}
        <InternalLink href="/ressources/tirades-monologues-femme-audition">
          tirades et monologues de femme pour une audition
        </InternalLink>.
      </P>

    </>
  );
}

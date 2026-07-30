import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-a-3-personnages" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre à 3 personnages à jouer en trio",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de théâtre à 3 personnages : 20 extraits à jouer en trio",
  description:
    "20 scènes de théâtre à trois personnages pour un cours ou un atelier : Molière, Racine, Corneille. Texte intégral et mode flashcard, gratuit et sans compte.",
  publishedAt: new Date("2026-07-30"),
};

type Groupe = "Comédie" | "Tragédie";

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
 * Scènes à exactement trois personnages, pour les ateliers dont les groupes ne
 * tombent pas juste en duos. Sélection filtrée sur les scènes d'au moins
 * 1 200 caractères : en dessous, un trio n'a pas la matière pour tenir un passage.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const trios: Scene[] = [
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène VI",
    characters: "Scapin / Argante / Sylvestre",
    lines: 106,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-vi",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène V",
    characters: "Octave / Scapin / Léandre",
    lines: 60,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-v",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte I, scène IV",
    characters: "Octave / Scapin / Sylvestre",
    lines: 21,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-i-scene-iv",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte II, scène XII",
    characters: "Octave / Scapin / Léandre",
    lines: 21,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-ii-scene-xii",
    group: "Comédie",
  },
  {
    work: "Les Fourberies de Scapin",
    author: "Molière",
    sceneLabel: "Acte III, scène XIV",
    characters: "Argante / Scapin / Géronte",
    lines: 21,
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-iii-scene-xiv",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte I, scène IX",
    characters: "Argan / Monsieur de Bonnefoi / Béline",
    lines: 40,
    href: "/scenes/moliere/le-malade-imaginaire/acte-i-scene-ix",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène VI",
    characters: "Argan / Monsieur Purgon / Toinette",
    lines: 56,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-vi",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène XVI",
    characters: "Toinette / Argan / Béralde",
    lines: 26,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-xvi",
    group: "Comédie",
  },
  {
    work: "Le Malade imaginaire",
    author: "Molière",
    sceneLabel: "Acte III, scène XVIII",
    characters: "Toinette / Argan / Béline",
    lines: 22,
    href: "/scenes/moliere/le-malade-imaginaire/acte-iii-scene-xviii",
    group: "Comédie",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte I, scène 5",
    characters: "Lucas / Valère / Martine",
    lines: 47,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-5",
    group: "Comédie",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte II, scène II",
    characters: "Jacqueline / Géronte / Lucas",
    lines: 22,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-ii-scene-ii",
    group: "Comédie",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte III, scène I",
    characters: "Arnolphe / Georgette / Alain",
    lines: 9,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-iii-scene-i",
    group: "Comédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte III, scène IV",
    characters: "Chimène / Don Rodrigue / Elvire",
    lines: 69,
    href: "/scenes/pierre-corneille/le-cid/acte-iii-scene-iv",
    group: "Tragédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte II, scène VIII",
    characters: "Don Diègue / Chimène / Don Fernand",
    lines: 36,
    href: "/scenes/pierre-corneille/le-cid/acte-ii-scene-viii",
    group: "Tragédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte I, scène II",
    characters: "L’infante / Le Page / Léonor",
    lines: 33,
    href: "/scenes/pierre-corneille/le-cid/acte-i-scene-ii",
    group: "Tragédie",
  },
  {
    work: "Le Cid",
    author: "Pierre Corneille",
    sceneLabel: "Acte II, scène VI",
    characters: "Don Fernand / Don Sanche / Don Arias",
    lines: 25,
    href: "/scenes/pierre-corneille/le-cid/acte-ii-scene-vi",
    group: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène VII",
    characters: "Titus / Antiochus / Bérénice",
    lines: 25,
    href: "/scenes/jean-racine/berenice/acte-v-scene-vii",
    group: "Tragédie",
  },
  {
    work: "Bérénice",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène III",
    characters: "Bérénice / Antiochus / Phénice",
    lines: 35,
    href: "/scenes/jean-racine/berenice/acte-iii-scene-iii",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte III, scène VIII",
    characters: "Néron / Britannicus / Junie",
    lines: 31,
    href: "/scenes/jean-racine/britannicus/acte-iii-scene-viii",
    group: "Tragédie",
  },
  {
    work: "Britannicus",
    author: "Jean Racine",
    sceneLabel: "Acte V, scène VI",
    characters: "Néron / Agrippine / Narcisse",
    lines: 18,
    href: "/scenes/jean-racine/britannicus/acte-v-scene-vi",
    group: "Tragédie",
  },
];

export function triosSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Comédie", "Tragédie"];

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
        Un groupe de trois, c’est la distribution la plus fréquente d’un atelier — et la plus
        difficile à servir : la plupart des recueils proposent des duos, et il faut alors couper
        une scène ou inventer un rôle. Les 20 scènes ci-dessous ont exactement trois personnages
        parlants, sans coupe ni adaptation.
      </P>
      <P>
        Elles sont classées par registre, et le nombre de répliques est indiqué pour jauger la
        longueur avant d’ouvrir. Toutes relèvent du domaine public : texte intégral accessible
        sans compte, avec le mode flashcard pour les apprendre.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {trios
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

      <H2>Répartir les rôles dans un trio</H2>
      <P>
        Dans la plupart de ces scènes, les trois rôles ne sont pas d’égale longueur : chez Molière,
        le valet mène et les deux autres réagissent ; chez Racine, le confident parle peu mais
        déclenche tout. Regarde la distribution des répliques avant de distribuer, plutôt qu’après —
        chaque page de scène affiche le texte intégral, personnage par personnage.
      </P>
      <P>
        Pour un groupe qui se réduit à deux, la sélection de{" "}
        <InternalLink href="/ressources/scenes-a-deux-personnages">
          scènes à deux personnages
        </InternalLink>{" "}
        prend le relais. Et si le temps de passage est court, les{" "}
        <InternalLink href="/ressources/scenes-de-theatre-courtes">scènes courtes</InternalLink>{" "}
        sont regroupées à part.
      </P>

    </>
  );
}

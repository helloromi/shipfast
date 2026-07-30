import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "scenes-de-theatre-comiques" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Scènes de théâtre comiques à jouer",
  // <title> HTML : distinct du H1, construit sur la requête cible.
  metaTitle: "Scènes de théâtre comiques : 18 extraits à jouer en cours",
  description:
    "18 scènes de théâtre comiques à jouer en cours ou en atelier : Les Fourberies de Scapin, Le Malade imaginaire, Le Misanthrope. Texte intégral, sans compte.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-06-11"),
};

type Groupe = "Les Fourberies de Scapin" | "Le Malade imaginaire" | "Autres comédies";

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
 * Scènes comiques du répertoire classique, regroupées par œuvre plutôt que par
 * registre : dans une même pièce le ton est homogène, ce qui aide à choisir
 * quand on monte plusieurs extraits pour un même spectacle d'atelier.
 *
 * Source unique : sert au rendu des sections ET au schema ItemList construit dans
 * src/app/ressources/[slug]/page.tsx. Chaque href a été généré depuis la base et
 * validé par `npx tsx supabase/seed/check-ressource-links.ts` — à relancer après
 * tout re-sluguage, sinon ces liens partent en 308 sans prévenir.
 */
export const comiques: Scene[] = [
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
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène première",
    characters: "Philinte / Alceste",
    lines: 70,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-premiere",
    group: "Autres comédies",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte I, scène 2",
    characters: "Oronte / Alceste",
    lines: 49,
    href: "/scenes/moliere/le-misanthrope/acte-i-scene-2",
    group: "Autres comédies",
  },
  {
    work: "Le Misanthrope",
    author: "Molière",
    sceneLabel: "Acte III, scène 5",
    characters: "Arsinoé / Célimène",
    lines: 42,
    href: "/scenes/moliere/le-misanthrope/acte-iii-scene-5",
    group: "Autres comédies",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte I, scène I",
    characters: "Chrysalde / Arnolphe",
    lines: 71,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-i-scene-i",
    group: "Autres comédies",
  },
  {
    work: "L’École des femmes",
    author: "Molière",
    sceneLabel: "Acte I, scène V",
    characters: "Arnolphe / Horace",
    lines: 51,
    href: "/scenes/moliere/l-ecole-des-femmes/acte-i-scene-v",
    group: "Autres comédies",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte I, scène 5",
    characters: "Lucas / Valère / Martine",
    lines: 47,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-i-scene-5",
    group: "Autres comédies",
  },
  {
    work: "Le Médecin malgré lui",
    author: "Molière",
    sceneLabel: "Acte III, scène III",
    characters: "Sganarelle / Jacqueline",
    lines: 17,
    href: "/scenes/moliere/le-medecin-malgre-lui/acte-iii-scene-iii",
    group: "Autres comédies",
  },
  {
    work: "L'Avare",
    author: "Molière",
    sceneLabel: "Acte I, scène 3",
    characters: "Harpagon / La Flèche",
    lines: 66,
    href: "/scenes/moliere/l-avare/acte-i-scene-3",
    group: "Autres comédies",
  },
];

export function comiquesSchemaName(scene: Scene): string {
  return `${scene.work} — ${scene.sceneLabel} (${scene.characters})`;
}

const groupes: Groupe[] = ["Les Fourberies de Scapin", "Le Malade imaginaire", "Autres comédies"];

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
        Le comique classique se joue au rythme : une réplique en retard et la scène tombe à plat.
        C’est ce qui en fait un excellent terrain d’atelier — et ce qui impose de connaître le
        texte parfaitement, pas à peu près.
      </P>
      <P>
        Les 18 scènes ci-dessous sont regroupées par œuvre : dans une même pièce le ton reste
        homogène, ce qui aide quand on monte plusieurs extraits pour un même spectacle de fin
        d’année. Toutes sont du domaine public, texte intégral et sans compte.
      </P>

      {groupes.map((groupe) => (
        <section key={groupe} className="flex flex-col gap-2">
          <H2>{groupe}</H2>
          <ul className="flex flex-col gap-3">
            {comiques
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

      <H2>Le comique de répétition, piège de mémoire</H2>
      <P>
        Beaucoup de ces scènes reposent sur la reprise : « Que diable allait-il faire dans cette
        galère ? » revient neuf fois chez Scapin, et les répliques d’Argan à son apothicaire se
        ressemblent à s’y méprendre. C’est justement ce qui les rend glissantes à la récitation —
        on saute d’une reprise à l’autre sans s’en apercevoir.
      </P>
      <P>
        Travailler carte par carte plutôt qu’en relisant la scène en entier règle ce problème :
        chaque reprise est mémorisée à sa place. La{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          méthode flashcard
        </InternalLink>{" "}
        est détaillée ici, et s’essaie sur n’importe laquelle de ces scènes sans compte.
      </P>

    </>
  );
}

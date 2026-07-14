import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "quel-monologue-choisir-pour-une-audition-homme" as const;

export const meta = {
  title: "Quel monologue choisir pour une audition (homme)",
  description:
    "8 monologues classiques pour audition — Cyrano, Figaro, Harpagon, Ruy Blas... Texte intégral et méthode flashcard gratuits, sans compte.",
  publishedAt: new Date("2026-07-14"),
};

type Monologue = {
  /** Titre de section (H2) et nom dans le schema ItemList. */
  name: string;
  /** URL relative vers la page scène. */
  href: string;
  /** Libellé du lien « Lire et apprendre … ». */
  linkLabel: string;
  blurb: ReactNode;
};

/**
 * Source unique : sert à la fois au rendu des sections et au schema ItemList
 * construit dans src/app/ressources/[slug]/page.tsx.
 */
export const monologues: Monologue[] = [
  {
    name: "La tirade du nez — Cyrano de Bergerac (Rostand)",
    href: "/scenes/edmond-rostand/cyrano-de-bergerac/acte-i-scene-4-la-tirade-du-nez",
    linkLabel: "Lire et apprendre la tirade du nez",
    blurb: (
      <>
        Le point de passage obligé. Cyrano répond à une insulte sur son nez par vingt-trois façons
        de la dire mieux que celui qui l’a lancée — un festival de vocabulaire et de rythme, qui
        exige de la vitesse sans perdre la clarté. Court (environ une minute), mais chaque mot
        compte : peu de marge pour bâcler.
      </>
    ),
  },
  {
    name: "Le monologue de Figaro — Le Mariage de Figaro (Beaumarchais)",
    href: "/scenes/beaumarchais/le-mariage-de-figaro/acte-v-scene-3",
    linkLabel: "Lire et apprendre le monologue de Figaro",
    blurb: (
      <>
        Figaro, seul, dresse le bilan de sa vie et de son siècle. C’est le monologue le plus
        politique du répertoire classique français — un texte qui a fait scandale à sa création et
        qui garde une vraie force de frappe aujourd’hui. Demande de la présence sur la durée :
        environ une minute et demie de texte dense.
      </>
    ),
  },
  {
    name: "La scène de la cassette — L’Avare (Molière)",
    href: "/scenes/moliere/l-avare/acte-iv-scene-7",
    linkLabel: "Lire et apprendre la scène de la cassette",
    blurb: (
      <>
        Harpagon découvre le vol de son argent et perd totalement pied. C’est un monologue
        physique, presque une crise — utile pour montrer un registre comique poussé jusqu’à l’excès,
        avec des ruptures de rythme franches. Contraste bien avec un texte plus posé si on te
        demande deux monologues.
      </>
    ),
  },
  {
    name: "La tirade de Perdican — On ne badine pas avec l’amour (Musset)",
    href: "/scenes/alfred-de-musset/on-ne-badine-pas-avec-l-amour/acte-iii-scene-8-tirade-de-perdican",
    linkLabel: "Lire et apprendre la tirade de Perdican",
    blurb: (
      <>
        Perdican parle d’amour et de désillusion avec une lucidité amère, loin du lyrisme facile.
        Moins joué que Cyrano ou Figaro, donc moins entendu en audition — un vrai avantage si tu
        veux te démarquer sans sortir du répertoire classique.
      </>
    ),
  },
  {
    name: "Le monologue de Ruy Blas (Hugo)",
    href: "/scenes/victor-hugo/ruy-blas/acte-iii-scene-2",
    linkLabel: "Lire et apprendre le monologue de Ruy Blas",
    blurb: (
      <>
        Registre romantique, souffle plus ample. Ruy Blas parle avec la gravité de quelqu’un qui
        joue son destin en une scène. Bon choix si tu veux montrer une capacité à tenir un vers long
        et une émotion contenue plutôt qu’explosive.
      </>
    ),
  },
  {
    name: "Les imprécations de Don Diègue — Le Cid (Corneille)",
    href: "/scenes/pierre-corneille/le-cid/acte-i-scene-4-les-imprecations-de-don-diegue",
    linkLabel: "Lire et apprendre les imprécations de Don Diègue",
    blurb: (
      <>
        Don Diègue, humilié, appelle son fils à venger son honneur. Tragédie classique pure,
        alexandrins, colère froide plutôt que cri — un texte qui teste la diction autant que le jeu.
      </>
    ),
  },
  {
    name: "La scène du sac — Les Fourberies de Scapin (Molière)",
    href: "/scenes/moliere/les-fourberies-de-scapin/acte-iii-scene-ii",
    linkLabel: "Lire et apprendre la scène du sac",
    blurb: (
      <>
        Scapin fait croire à Géronte qu’il le cache dans un sac pour le rouer de coups à sa place.
        Long format (le texte complet dépasse huit minutes) : pour une audition, choisis un extrait
        de trente secondes à une minute plutôt que la scène entière — signale-le si on te demande le
        contexte.
      </>
    ),
  },
  {
    name: "« Qu’il mourût » — Horace (Corneille)",
    href: "/scenes/pierre-corneille/horace/acte-iii-scene-6",
    linkLabel: "Lire et apprendre « Qu’il mourût »",
    blurb: (
      <>
        Le vieil Horace répond à l’annonce de la mort apparente de son fils par trois mots qui sont
        restés dans toutes les mémoires du théâtre français. Le texte autour de ce sommet mérite
        d’être travaillé avec la même rigueur — l’effet ne tient pas si tout le reste est plat.
      </>
    ),
  },
];

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
        Un bon monologue d’audition tient en une à deux minutes, se comprend sans connaître la
        pièce, et laisse voir un vrai renversement — de ton, d’intention, d’état. Voici huit
        monologues du répertoire classique, tous dans le domaine public, texte intégral et mode
        flashcard gratuits sur Côté-Cour.
      </P>

      {monologues.map((m) => (
        <section key={m.href} className="flex flex-col gap-2">
          <H2>{m.name}</H2>
          <P>{m.blurb}</P>
          <P>
            <InternalLink href={m.href}>{m.linkLabel} →</InternalLink>
          </P>
        </section>
      ))}

      <H2>Comment travailler ces monologues</H2>
      <P>
        Un monologue d’audition se prépare différemment d’une scène à deux : personne ne te donne la
        réplique, il faut porter le texte seul du début à la fin. La{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          méthode flashcard
        </InternalLink>{" "}
        — masquer chaque réplique et la retrouver de mémoire — s’applique directement : tu peux
        tester n’importe lequel de ces monologues en mode flashcard, gratuitement et sans compte.
      </P>
      <P>
        Si tu prépares ces textes avec une classe ou une troupe, l’
        <InternalLink href="/professeurs">espace professeur</InternalLink> permet de distribuer un
        monologue différent à chaque élève et de suivre où chacun en est.
      </P>
    </>
  );
}

import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "tirades-monologues-femme-audition" as const;

export const meta = {
  // H1 de la page (rendu par [slug]/page.tsx à partir de `title`).
  title: "Tirades et monologues de femme pour préparer une audition",
  // <title> HTML : distinct du H1, construit sur la requête cible. Utilisé
  // verbatim (sans suffixe de marque) car c'est de la copy validée.
  metaTitle: "Tirades et monologues de femme pour audition : 4 textes classiques",
  description:
    "4 tirades féminines du domaine public pour préparer une audition : Phèdre, Agrippine, Junie. Texte intégral et mode flashcard sans compte.",
  publishedAt: new Date("2026-07-16"),
};

type Tirade = {
  /** Titre de section (H2) et `name` du CreativeWork dans le schema ItemList. */
  name: string;
  /** URL relative canonique vers la page scène. */
  href: string;
  /** Auteur (schema CreativeWork.author). */
  author: string;
  /** Œuvre dont la tirade est extraite (schema CreativeWork.isPartOf). */
  work: string;
  /** Libellé du lien « Lire et apprendre … ». */
  linkLabel: string;
  blurb: ReactNode;
};

/**
 * Source unique : sert à la fois au rendu des sections et au schema ItemList
 * (chaque tirade en CreativeWork) construit dans src/app/ressources/[slug]/page.tsx.
 * Scènes vérifiées contre l'édition Didot 1854 en base (personnage féminin
 * dominant, tirade extractible d'une scène à deux).
 */
export const tirades: Tirade[] = [
  {
    name: "Phèdre à Œnone — Phèdre, Racine (Acte I, scène 3)",
    href: "/scenes/jean-racine/phedre/acte-i-scene-iii",
    author: "Jean Racine",
    work: "Phèdre",
    linkLabel: "Lire et apprendre la tirade de Phèdre",
    blurb: (
      <>
        La déclaration de Phèdre à sa nourrice, «&nbsp;Ariane, ma sœur, de quel amour blessée…&nbsp;».
        Le texte le plus demandé en audition féminine classique. Écrit en scène à deux, mais la tirade
        de Phèdre tient largement seule une fois les relances d’Œnone retirées.
      </>
    ),
  },
  {
    name: "Agrippine à Albine — Britannicus, Racine (Acte I, scène 1)",
    href: "/scenes/jean-racine/britannicus/acte-i-scene-premiere",
    author: "Jean Racine",
    work: "Britannicus",
    linkLabel: "Lire et apprendre la tirade d’Agrippine",
    blurb: (
      <>
        La scène d’exposition de la pièce. Agrippine expose sa défiance envers Néron. Bon texte
        d’entrée dans le rôle.
      </>
    ),
  },
  {
    name: "Junie à Néron — Britannicus, Racine (Acte II, scène 3)",
    href: "/scenes/jean-racine/britannicus/acte-ii-scene-iii",
    author: "Jean Racine",
    work: "Britannicus",
    linkLabel: "Lire et apprendre la tirade de Junie",
    blurb: (
      <>
        Junie affronte Néron qui la retient de force. Registre plus jeune, plus vulnérable que les
        tirades d’Agrippine — utile pour une comédienne qui veut éviter le cliché de la matrone
        tragique.
      </>
    ),
  },
  {
    name: "Albine — Britannicus, Racine (Acte V, scène dernière)",
    href: "/scenes/jean-racine/britannicus/acte-v-scene-viii",
    author: "Jean Racine",
    work: "Britannicus",
    linkLabel: "Lire et apprendre le récit d’Albine",
    blurb: (
      <>
        Le récit final d’Albine. Moins connu, bon choix pour sortir des textes les plus rebattus en
        audition.
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
        Une bonne partie des grandes répliques féminines du répertoire classique ne sont pas des
        monologues au sens strict : elles sont écrites en scène à deux, avec un partenaire qui
        relance. Pour une audition, ça reste exploitable : on garde la tirade, on coupe les répliques
        de l’autre personnage, ou on les fait lire à quelqu’un hors scène.
      </P>
      <P>
        Les 4 textes ci-dessous sont extraits de pièces du domaine public, texte intégral accessible
        sans compte, avec le mode flashcard pour les apprendre.
      </P>

      {tirades.map((tirade) => (
        <section key={tirade.href} className="flex flex-col gap-2">
          <H2>{tirade.name}</H2>
          <P>{tirade.blurb}</P>
          <P>
            <InternalLink href={tirade.href}>{tirade.linkLabel} →</InternalLink>
          </P>
        </section>
      ))}

      <H2>Comment travailler ces tirades</H2>
      <P>
        Une tirade tirée d’une scène à deux se prépare comme un texte solo : on isole la partie du
        personnage, on repère les endroits où l’on peut couper les relances, et on la porte du début
        à la fin. La{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          méthode flashcard
        </InternalLink>{" "}
        — masquer chaque réplique et la retrouver de mémoire — s’applique directement : tu peux
        tester n’importe laquelle de ces tirades en mode flashcard, gratuitement et sans compte.
      </P>
      <P>
        <InternalLink href="/login">Crée un compte gratuit</InternalLink> pour sauvegarder ta
        progression sur le texte que tu choisis de travailler.
      </P>
    </>
  );
}

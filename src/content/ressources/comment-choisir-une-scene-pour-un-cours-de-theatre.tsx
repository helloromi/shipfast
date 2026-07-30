import type { ReactNode } from "react";
import NextLink from "next/link";

import type { ArticleFaqEntry } from "./articles";

export const slug = "comment-choisir-une-scene-pour-un-cours-de-theatre" as const;

export const meta = {
  title: "Comment choisir une scène pour un cours de théâtre",
  metaTitle: "Choisir une scène pour un cours de théâtre : la méthode",
  description:
    "Distribution, longueur, niveau du groupe : comment choisir une scène à monter en cours ou en atelier de théâtre, et les erreurs qui coûtent trois semaines de répétition.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-05-06"),
};

/**
 * Guide destiné aux animateurs d'atelier et professeurs de théâtre — la cible de
 * prospection. Il part de leur contrainte réelle (la distribution qu'ils ont, pas
 * celle qu'ils voudraient) et sert de porte d'entrée vers les pages de collection.
 */
export const faq: ArticleFaqEntry[] = [
  {
    question: "Quelle longueur de scène pour un atelier d'une heure et demie ?",
    answer:
      "Pour une séance, une scène de deux à trois minutes de jeu suffit : le temps de la lire, de la répartir, de la mettre debout et de la reprendre. Compter environ mille caractères de texte par minute dite. Une scène plus longue se travaille sur plusieurs séances, ce qui suppose que le groupe soit stable d'une fois sur l'autre.",
  },
  {
    question: "Faut-il choisir la scène avant ou après avoir vu le groupe ?",
    answer:
      "Après. Le nombre de participants présents, l'équilibre entre les rôles et le niveau réel décident plus sûrement qu'une préférence de répertoire. Choisir la pièce d'abord conduit presque toujours à couper un rôle ou à en inventer un, ce qui déséquilibre la scène.",
  },
  {
    question: "Peut-on faire jouer un rôle d'homme par une femme, et l'inverse ?",
    answer:
      "Oui, cela se pratique couramment et ne pose aucun problème de droits sur un texte du domaine public. La seule limite est dramaturgique : certains ressorts reposent explicitement sur le genre du personnage, et la scène perd son moteur si on les efface. Quand c'est possible, une scène écrite pour la distribution qu'on a demande moins d'aménagements.",
  },
  {
    question: "Vaut-il mieux commencer par de la comédie ou de la tragédie ?",
    answer:
      "La comédie en prose est plus accessible pour un groupe débutant : le texte se retient plus vite et le retour du public est immédiat. La tragédie en alexandrins demande un travail de diction préalable, mais le vers est un appui de mémoire une fois le mouvement compris — elle n'est pas plus difficile à apprendre, elle est plus difficile à dire.",
  },
  {
    question: "Combien de scènes différentes monter dans une même séance ?",
    answer:
      "Deux ou trois petits groupes travaillant chacun une scène courte fonctionnent mieux qu'un grand groupe sur une scène longue, où la moitié des participants attend son tour. Prendre les extraits dans une même pièce garde une unité de ton si l'objectif est un spectacle de fin d'année.",
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
        Choisir une scène pour un atelier n’est pas choisir une scène qu’on aime. C’est trouver
        celle qui va au groupe qu’on a devant soi, un mardi soir, avec sept personnes dont deux
        qui n’étaient pas là la semaine dernière. L’ordre dans lequel on décide compte plus que le
        goût.
      </P>

      <H2>Partir de la distribution, pas du répertoire</H2>
      <P>
        L’erreur la plus coûteuse consiste à choisir la pièce d’abord. On arrive avec une scène à
        deux, le groupe est à cinq ; on découpe un rôle en deux, on en invente un muet, et la scène
        perd son moteur. Trois semaines plus tard, personne ne comprend pourquoi ça ne fonctionne
        pas.
      </P>
      <P>
        Compter les participants réellement présents, puis chercher une scène écrite pour ce
        nombre-là, évite tout cela. Le répertoire classique est plus fourni qu’on ne croit sur ce
        plan : au-delà des duos, il existe de vraies scènes à trois rôles parlants, et des duos
        pour deux femmes ou deux hommes selon la composition du groupe.
      </P>

      <H2>Calibrer la longueur sur la séance</H2>
      <P>
        Une scène de deux à trois minutes se lit, se répartit, se met debout et se reprend dans une
        séance d’une heure et demie. Au-delà, il faut étaler sur plusieurs semaines — ce qui
        suppose un groupe stable, condition rarement remplie en atelier amateur.
      </P>
      <P>
        Un repère simple : environ mille caractères de texte pour une minute dite. Le nombre de
        répliques est un indicateur complémentaire — beaucoup de répliques courtes se jouent vite,
        une tirade unique de la même longueur demande bien plus de souffle.
      </P>

      <H2>Vérifier que la scène tient seule</H2>
      <P>
        Une scène d’atelier doit se comprendre sans avoir lu la pièce. Certaines reposent sur un
        renversement posé deux actes plus tôt : elles sont excellentes en spectacle, illisibles en
        extrait. Le test tient en une question : si on la donne à quelqu’un qui ne connaît pas
        l’œuvre, sait-il qui veut quoi dès la troisième réplique ?
      </P>

      <H2>Décider du niveau en connaissance de cause</H2>
      <P>
        La prose comique est le meilleur point d’entrée pour un groupe débutant : le texte se
        retient vite et le retour du public est immédiat. L’alexandrin n’est pas plus difficile à
        mémoriser — la rime et la césure sont même des appuis — mais il est plus difficile à dire
        sans tomber dans la psalmodie. Il vaut mieux l’aborder avec un groupe qui a déjà quelques
        séances derrière lui.
      </P>

      <H2>Les sélections déjà faites</H2>
      <P>
        Pour gagner l’étape du tri, les scènes du catalogue sont regroupées par contrainte
        d’atelier : par{" "}
        <InternalLink href="/ressources/scenes-a-deux-personnages">duo</InternalLink>, par{" "}
        <InternalLink href="/ressources/scenes-de-theatre-a-3-personnages">trio</InternalLink>, par{" "}
        <InternalLink href="/ressources/scenes-de-theatre-courtes">durée</InternalLink>, pour{" "}
        <InternalLink href="/ressources/scenes-de-theatre-deux-femmes">deux femmes</InternalLink>{" "}
        ou{" "}
        <InternalLink href="/ressources/scenes-de-theatre-deux-hommes">deux hommes</InternalLink>,
        en{" "}
        <InternalLink href="/ressources/scenes-de-theatre-comiques">comédie</InternalLink> ou en{" "}
        <InternalLink href="/ressources/scenes-de-tragedie-classique">
          tragédie classique
        </InternalLink>.
      </P>
      <P>
        Chaque scène affiche ses personnages et son nombre de répliques avant ouverture, et le texte
        intégral est accessible sans compte — de quoi décider et distribuer dans la foulée. Tous ces
        textes relèvent du{" "}
        <InternalLink href="/ressources/texte-de-theatre-libre-de-droits">
          domaine public
        </InternalLink>
        , donc photocopiables sans démarche.
      </P>
    </>
  );
}

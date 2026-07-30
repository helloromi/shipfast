import type { ReactNode } from "react";
import NextLink from "next/link";

import type { ArticleFaqEntry } from "./articles";

export const slug = "texte-de-theatre-libre-de-droits" as const;

export const meta = {
  title: "Trouver un texte de théâtre libre de droits",
  metaTitle: "Texte de théâtre libre de droits : ce qu'on peut jouer légalement",
  description:
    "Quels textes de théâtre peut-on jouer et photocopier librement ? Domaine public, durée des droits, cas des traductions : le point pour une troupe ou un cours.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-04-08"),
};

/**
 * Guide de cadrage. Il répond à une question que se posent toutes les troupes
 * amateur et tous les cours — « qu'est-ce qu'on a le droit de jouer ? » — et qui
 * amène naturellement au catalogue, entièrement composé de domaine public.
 *
 * Prudence assumée sur le fond juridique : on explique le principe et on renvoie
 * à la SACD pour tout ce qui engage une troupe. Aucune affirmation qui ressemble
 * à un conseil juridique personnalisé.
 */
export const faq: ArticleFaqEntry[] = [
  {
    question: "Qu'est-ce qu'un texte de théâtre libre de droits ?",
    answer:
      "C'est un texte dont les droits patrimoniaux ont expiré : il appartient alors au domaine public et peut être joué, copié, adapté et diffusé sans autorisation ni redevance. En France, les droits patrimoniaux durent toute la vie de l'auteur puis 70 ans après sa mort. Molière, Racine, Corneille, Marivaux, Beaumarchais, Musset, Hugo et Rostand sont tous dans le domaine public.",
  },
  {
    question: "Peut-on photocopier une pièce du domaine public pour ses élèves ?",
    answer:
      "Oui. Une œuvre du domaine public peut être reproduite librement, y compris en nombre pour une classe ou un atelier. La réserve porte sur l'édition utilisée : une préface, des notes ou un appareil critique récents restent protégés, même quand la pièce ne l'est plus. Copier le texte de la pièce ne pose pas de problème, copier l'introduction d'un éditeur contemporain, si.",
  },
  {
    question: "Une traduction d'une pièce étrangère est-elle libre de droits ?",
    answer:
      "Pas forcément. La traduction est une œuvre à part entière, protégée pour la durée de vie du traducteur plus 70 ans. Shakespeare est dans le domaine public, mais une traduction française récente ne l'est pas. Pour jouer une pièce étrangère librement, il faut une traduction elle-même tombée dans le domaine public.",
  },
  {
    question: "Faut-il déclarer un spectacle monté à partir d'un texte du domaine public ?",
    answer:
      "Le texte n'engage aucune redevance d'auteur, mais une représentation publique peut relever d'autres obligations selon le contexte : billetterie, musique additionnelle, statut de la structure. Pour une troupe qui joue devant du public, le réflexe utile est de vérifier auprès de la SACD, qui renseigne gratuitement sur ces cas.",
  },
  {
    question: "Où trouver des textes de théâtre du domaine public en ligne ?",
    answer:
      "Wikisource héberge la plupart des éditions anciennes en texte intégral. Côté-Cour reprend ces textes, les découpe scène par scène et les présente avec les personnages, la longueur et un mode d'apprentissage par flashcards — l'ensemble est accessible gratuitement et sans compte.",
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
        C’est la première question d’une troupe amateur ou d’un cours de théâtre au moment de
        choisir un texte : a-t-on le droit de le jouer, de le photocopier, de le mettre en ligne ?
        La réponse tient à une distinction simple, et à deux ou trois pièges qui reviennent
        souvent.
      </P>

      <H2>La règle : soixante-dix ans après la mort de l’auteur</H2>
      <P>
        En France, les droits patrimoniaux d’une œuvre durent toute la vie de son auteur, puis
        soixante-dix ans après sa mort. Passé ce délai, l’œuvre entre dans le domaine public :
        n’importe qui peut la jouer, la copier, l’adapter, la publier, sans demander
        d’autorisation ni verser de redevance.
      </P>
      <P>
        Pour le répertoire classique, la question est donc réglée depuis longtemps. Molière,
        Racine, Corneille, Marivaux, Beaumarchais, Musset, Hugo, Rostand : tous sont dans le
        domaine public. C’est ce qui permet à un atelier de monter <em>Les Fourberies de Scapin</em>{" "}
        sans rien demander à personne.
      </P>

      <H2>Trois pièges qui subsistent</H2>
      <P>
        <strong>L’édition n’est pas l’œuvre.</strong> Le texte de Racine est libre, mais la préface,
        les notes de bas de page et l’appareil critique d’une édition récente sont, eux, protégés.
        Photocopier la pièce ne pose pas de problème ; photocopier l’introduction d’un universitaire
        vivant, si.
      </P>
      <P>
        <strong>La traduction est une œuvre à part entière.</strong> Shakespeare est mort en 1616,
        mais une traduction française publiée en 1990 est protégée jusqu’à soixante-dix ans après
        la mort de son traducteur. Pour jouer une pièce étrangère librement, il faut une traduction
        elle-même tombée dans le domaine public.
      </P>
      <P>
        <strong>Le texte libre ne règle pas tout le spectacle.</strong> La musique ajoutée, les
        images projetées, une adaptation signée par quelqu’un d’autre relèvent de leurs propres
        droits. Et une représentation publique peut engager d’autres obligations selon le cadre. Pour
        une troupe qui joue devant du public, la SACD renseigne gratuitement sur ces situations —
        c’est le réflexe utile plutôt que de deviner.
      </P>

      <H2>Ce que ça change concrètement pour un cours</H2>
      <P>
        Un texte du domaine public peut être distribué à tous les élèves, annoté, découpé, mis en
        ligne sur l’espace de la classe, joué en spectacle de fin d’année. C’est précisément ce qui
        en fait la matière première des ateliers : aucune démarche, aucun budget, aucun délai.
      </P>
      <P>
        L’intégralité du catalogue Côté-Cour relève du domaine public, pour cette raison. Les textes
        sont accessibles gratuitement et sans compte, scène par scène, avec les personnages et la
        longueur indiqués — de quoi choisir avant de distribuer. Selon la taille du groupe, les{" "}
        <InternalLink href="/ressources/scenes-a-deux-personnages">scènes à deux</InternalLink>,{" "}
        <InternalLink href="/ressources/scenes-de-theatre-a-3-personnages">
          à trois personnages
        </InternalLink>{" "}
        ou les{" "}
        <InternalLink href="/ressources/scenes-de-theatre-courtes">scènes courtes</InternalLink>{" "}
        sont regroupées à part.
      </P>
      <P>
        Cet article décrit le principe général du domaine public ; il ne remplace pas un avis
        juridique sur une situation particulière.
      </P>
    </>
  );
}

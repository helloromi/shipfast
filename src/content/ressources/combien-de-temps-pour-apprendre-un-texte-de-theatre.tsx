import type { ReactNode } from "react";
import NextLink from "next/link";

import type { ArticleFaqEntry } from "./articles";

export const slug = "combien-de-temps-pour-apprendre-un-texte-de-theatre" as const;

export const meta = {
  title: "Combien de temps faut-il pour apprendre un texte de théâtre",
  metaTitle: "Combien de temps pour apprendre un texte de théâtre ?",
  description:
    "Combien de jours pour mémoriser une tirade ou une scène ? Ce qui fait vraiment varier le temps d'apprentissage, et pourquoi la répétition espacée change le calcul.",
  // Date de publication éditoriale, choisie pour étaler la parution des pages —
  // ce n'est pas un horodatage de création de fichier.
  publishedAt: new Date("2026-07-08"),
};

/**
 * Guide de méthode, sur une requête très directe (« combien de temps pour
 * apprendre un texte »). Il complète la page méthode flashcard, qui explique le
 * comment ; celle-ci répond au combien, qui est ce que les gens tapent d'abord.
 *
 * Les ordres de grandeur donnés sont présentés comme tels, jamais comme des
 * mesures : ils servent à planifier, pas à promettre.
 */
export const faq: ArticleFaqEntry[] = [
  {
    question: "Combien de temps faut-il pour apprendre une tirade de théâtre ?",
    answer:
      "Pour une tirade d'une à deux minutes, comptez trois à cinq sessions courtes réparties sur une semaine plutôt qu'une longue séance. Le texte peut être récité de mémoire dès la deuxième ou troisième session ; ce qui demande les suivantes, c'est de le tenir sans y penser, condition pour pouvoir jouer plutôt que réciter.",
  },
  {
    question: "Vaut-il mieux apprendre en une fois ou en plusieurs séances ?",
    answer:
      "En plusieurs séances, sans hésitation. Une même durée totale de travail donne un résultat nettement plus durable quand elle est répartie sur plusieurs jours plutôt que concentrée en une soirée. C'est le principe de la répétition espacée : chaque rappel à distance renforce la trace davantage qu'une relecture immédiate.",
  },
  {
    question: "Combien de temps pour une scène entière plutôt qu'une tirade ?",
    answer:
      "Une scène à deux de cinq minutes demande généralement deux à trois semaines de travail régulier, à raison de sessions courtes. La difficulté n'est pas le volume mais les enchaînements : il faut connaître les répliques de l'autre autant que les siennes pour rebondir sans temps mort.",
  },
  {
    question: "Le vers est-il plus long à apprendre que la prose ?",
    answer:
      "Non, souvent l'inverse. L'alexandrin impose une longueur régulière, une rime et une césure, qui servent d'appuis de mémoire : une syllabe manquante s'entend. La prose est plus libre, donc plus facile à paraphraser sans s'en rendre compte. Le vers est plus difficile à dire, pas plus long à retenir.",
  },
  {
    question: "Que faire quand on bloque toujours au même endroit ?",
    answer:
      "Un blocage récurrent signale presque toujours une transition mal comprise plutôt qu'un problème de mémoire : on ne sait pas pourquoi le personnage passe de cette idée à la suivante. Reprendre le passage en cherchant l'enchaînement logique, puis le travailler isolément plutôt qu'en reprenant la scène depuis le début, débloque plus vite que la répétition brute.",
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
        C’est la question qu’on se pose la veille d’une audition, ou trois semaines avant un
        spectacle de fin d’année. La réponse honnête est qu’elle dépend de trois choses — et
        qu’aucune n’est le nombre de pages.
      </P>

      <H2>Savoir un texte et le tenir sont deux étapes différentes</H2>
      <P>
        Un texte se récite de mémoire assez vite : deux ou trois sessions suffisent souvent pour
        une tirade courte. Mais réciter et jouer ne demandent pas le même niveau de maîtrise. Tant
        que le texte occupe l’attention, il ne reste rien pour le partenaire, l’intention, le
        corps. Ce qui prend du temps, ce n’est pas d’apprendre : c’est d’arriver au point où on
        n’y pense plus.
      </P>
      <P>
        C’est aussi ce qui explique l’écart entre une répétition réussie chez soi et un trou de
        mémoire devant le jury. Un texte su « juste assez » tient au calme et lâche sous stress.
      </P>

      <H2>Ce qui fait vraiment varier le temps</H2>
      <P>
        <strong>La répartition, plus que la durée totale.</strong> Une heure étalée sur cinq jours
        vaut mieux que trois heures d’affilée la veille. Chaque rappel à distance renforce la trace
        davantage qu’une relecture immédiate — c’est le principe de la répétition espacée, et c’est
        de loin le facteur le plus décisif.
      </P>
      <P>
        <strong>La compréhension des enchaînements.</strong> Un texte dont on suit la logique
        s’apprend beaucoup plus vite qu’une suite de phrases. Les blocages se situent presque
        toujours aux transitions — là où on ne sait pas pourquoi le personnage passe d’une idée à
        la suivante.
      </P>
      <P>
        <strong>La forme du texte.</strong> Contrairement à l’intuition, le vers n’est pas plus long
        à retenir que la prose : l’alexandrin impose une longueur régulière, une rime et une césure
        qui servent d’appuis, et une syllabe manquante s’entend. La prose se paraphrase sans qu’on
        s’en aperçoive.
      </P>

      <H2>Des ordres de grandeur, pas des promesses</H2>
      <P>
        À titre de repère, pour quelqu’un qui travaille régulièrement en sessions courtes : une
        tirade d’une à deux minutes demande généralement trois à cinq sessions réparties sur une
        semaine ; une scène à deux de cinq minutes, deux à trois semaines, l’essentiel du temps
        passant dans les enchaînements avec le partenaire plutôt que dans le texte lui-même.
      </P>
      <P>
        Ce sont des ordres de grandeur pour planifier, pas des mesures. Le même texte prendra deux
        fois moins de temps à quelqu’un qui connaît la pièce, et deux fois plus la semaine où tout
        le reste déborde.
      </P>

      <H2>Comment raccourcir le délai</H2>
      <P>
        La méthode qui change le plus le calcul consiste à se tester plutôt qu’à relire : masquer
        la réplique, essayer de la retrouver, vérifier. L’effort de rappel est ce qui fixe le texte
        — relire donne l’impression de savoir sans produire le même effet. Le détail de la méthode
        est ici :{" "}
        <InternalLink href="/ressources/comment-apprendre-son-texte-de-theatre">
          apprendre son texte avec la méthode des flashcards
        </InternalLink>
        .
      </P>
      <P>
        Toutes les scènes du catalogue se testent de cette façon, gratuitement et sans compte. Pour
        un premier texte, le guide{" "}
        <InternalLink href="/ressources/comment-apprendre-premier-texte-theatre-sans-stress">
          apprendre son premier texte sans stress
        </InternalLink>{" "}
        détaille la mise en route.
      </P>
    </>
  );
}

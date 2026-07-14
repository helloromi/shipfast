import type { ReactNode } from "react";
import NextLink from "next/link";

export const slug = "comment-apprendre-son-texte-de-theatre" as const;

export const meta = {
  title: "Comment apprendre son texte de théâtre : la méthode flashcard",
  description:
    "Relire son texte en boucle ne suffit pas. La méthode flashcard, avec répétition espacée, entraîne ta mémoire à produire tes répliques seul. Guide complet et gratuit.",
  publishedAt: new Date("2026-07-14"),
};

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

function Ul({ children }: { children: ReactNode }) {
  return (
    <ul className="ml-4 mt-2 list-disc space-y-1 text-sm leading-relaxed text-[#524b5a]">
      {children}
    </ul>
  );
}

function Li({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

function Ol({ children }: { children: ReactNode }) {
  return (
    <ol className="ml-4 mt-2 list-decimal space-y-3 text-sm leading-relaxed text-[#524b5a]">
      {children}
    </ol>
  );
}

function InternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <NextLink href={href} className="font-semibold text-[#3b1f4a] underline underline-offset-2 hover:no-underline">
      {children}
    </NextLink>
  );
}

export function Body() {
  return (
    <>
      <P>
        Tu relis ta scène pour la dixième fois, tu la sais presque, et puis en répétition le trou.
        Ce n’est pas un problème de mémoire. C’est un problème de méthode.
      </P>
      <P>
        Relire un texte en boucle donne une impression de familiarité — tu reconnais les mots
        quand tu les vois. Mais reconnaître n’est pas se souvenir. Sur scène, personne ne te tend
        le texte sous les yeux : il faut le produire, seul, sans aide. Entre « je reconnais » et
        « je peux le dire », il y a un monde. La relecture passive travaille le premier. Elle ne
        travaille jamais le second.
      </P>

      <H2>La méthode qui marche : la flashcard, appliquée au théâtre</H2>
      <P>
        La technique vient de l’apprentissage des langues, où elle a fait ses preuves depuis
        longtemps : au lieu de relire un mot et sa traduction, tu caches la traduction et tu
        essaies de t’en souvenir. Le geste actif de rappel forme la mémoire beaucoup plus
        efficacement que la lecture répétée.
      </P>
      <P>
        Pour un texte de théâtre, le principe est le même. Ta réplique est masquée. Tu dois la
        retrouver de mémoire, mot pour mot ou dans l’esprit selon ce que tu vises. Tu te corriges
        toi-même en la révélant. Et surtout : les répliques que tu rates reviennent plus souvent,
        celles que tu maîtrises reviennent moins. C’est la répétition espacée — le temps que tu
        passes se concentre automatiquement là où tu en as besoin, pas sur ce que tu sais déjà.
      </P>
      <P>
        Dix minutes de ce travail ciblé remplacent une heure de relecture parce que chaque minute
        est utile. Il n’y a pas de temps perdu à relire pour la vingtième fois une réplique que tu
        connais depuis la troisième.
      </P>

      <H2>Comment procéder concrètement</H2>
      <Ol>
        <Li>
          <strong>Découpe ta scène en répliques.</strong> Pas en tirades entières — en unités
          courtes. Une réplique de quinze mots que tu dois produire seul est plus formatrice
          qu’une tirade de deux minutes que tu relis en entier.
        </Li>
        <Li>
          <strong>Cache, essaie, révèle.</strong> Pour chaque réplique : masque-la, essaie de la
          dire à voix haute ou dans ta tête, puis vérifie. Si tu t’es trompé, ce n’est pas grave —
          c’est même le but. Une réplique ratée aujourd’hui revient plus vite que les autres.
        </Li>
        <Li>
          <strong>Fais des sessions courtes et répétées, pas une session longue.</strong> Dix
          minutes le matin dans les transports, dix minutes le soir, valent mieux qu’une heure
          d’affilée un dimanche. La mémoire se construit sur la répétition espacée dans le temps,
          pas sur la durée d’une seule séance.
        </Li>
        <Li>
          <strong>Repère où tu bloques avant la répétition.</strong> Si tu sais déjà, en arrivant,
          que tel enchaînement te pose problème, tu peux le travailler avec ton partenaire de
          scène plutôt que de découvrir le trou devant tout le monde.
        </Li>
        <Li>
          <strong>Passe à voix haute dès que possible.</strong> Le rappel silencieux aide à
          mémoriser le texte, mais le dire à voix haute engage la mémoire différemment —
          articulation, rythme, souffle. Les deux se complètent.
        </Li>
      </Ol>

      <H2>Pourquoi pas la méthode audio (la réplique donnée à l’oreille)</H2>
      <P>
        Certaines applications font écouter le texte, avec une voix de synthèse qui donne la
        réplique avant la tienne. Ça fonctionne pour une mémoire auditive. Mais si tu retiens
        mieux ce que tu as lu que ce que tu as entendu — ce qui est le cas pour une grande partie
        des comédiens — cette méthode ne t’entraîne pas à produire le texte seul, elle t’entraîne
        à le reconnaître quand on te le souffle. Ce n’est pas la même compétence que ce qu’on te
        demande sur scène.
      </P>

      <H2>Comment appliquer cette méthode simplement</H2>
      <P>
        C’est exactement ce que fait <InternalLink href="/">Côté-Cour</InternalLink> : tes
        répliques sont masquées, tu les révèles une à une, l’application repère automatiquement où
        tu hésites et te les représente plus souvent. Le catalogue de scènes du domaine public —
        Molière, Racine, Corneille, Rostand — est accessible gratuitement et sans compte, en mode
        flashcard directement. Tu peux tester la méthode sur une scène connue avant de l’appliquer
        à ton propre texte.
      </P>

      <P>Quelques scènes pour commencer :</P>
      <Ul>
        <Li>
          <InternalLink href="/scenes/edmond-rostand/cyrano-de-bergerac/acte-i-scene-4-la-tirade-du-nez">
            La tirade du nez, Cyrano de Bergerac
          </InternalLink>
        </Li>
        <Li>
          <InternalLink href="/scenes/pierre-corneille/le-cid/acte-iv-scene-iii-2">
            Acte IV, Scène III, Le Cid
          </InternalLink>
        </Li>
      </Ul>

      <P>
        Si tu es professeur et que tu veux appliquer cette méthode à toute une classe ou une
        troupe, la <InternalLink href="/professeurs">page dédiée aux professeurs</InternalLink>{" "}
        explique comment distribuer les textes et suivre la progression de chacun.
      </P>
    </>
  );
}

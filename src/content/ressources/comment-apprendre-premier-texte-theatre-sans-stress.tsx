import type { ReactNode } from "react";

export const slug = "comment-apprendre-premier-texte-theatre-sans-stress" as const;

export const meta = {
  title: "Comment apprendre son premier texte de théâtre sans stress ?",
  description:
    "Cours de théâtre débutant : 5 exercices de mémorisation pour surmonter la peur du trou de mémoire et apprendre tes répliques sereinement. Conseils et outil Côté-Cour.",
  publishedAt: new Date("2025-03-01"),
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

export function Body() {
  return (
    <>
      <P>
        Tu viens de t’inscrire à un cours de théâtre débutant et ton premier texte te fait déjà
        stresser ? La peur du trou de mémoire en scène est très fréquente, surtout quand on
        découvre le jeu. Bonne nouvelle : avec de bons exercices de mémorisation et une méthode
        adaptée, tu peux apprendre ton premier texte de théâtre sans stress. Voici comment.
      </P>

      <H2>5 astuces pour mémoriser rapidement</H2>
      <P>
        Ces exercices de mémorisation t’aideront à ancrer tes répliques sans tout bachoter la veille.
      </P>
      <Ul>
        <Li>
          <strong>Découpe par blocs.</strong> Ne apprends pas la scène d’un coup. Travaille
          scène par scène, puis réplique par réplique. C’est plus digeste et ça limite la peur du
          trou de mémoire en te donnant des repères clairs.
        </Li>
        <Li>
          <strong>Répétition espacée.</strong> Réviser à intervalles espacés (le soir même, le
          lendemain, puis quelques jours plus tard) est bien plus efficace que de tout répéter
          d’affilée. Ton cerveau consolide mieux quand tu laisses passer un peu de temps entre
          deux sessions.
        </Li>
        <Li>
          <strong>Dire le texte à voix haute.</strong> Lire dans sa tête ne suffit pas. Réciter
          comme en conditions de jeu sollicite la mémoire visuelle et la mémoire du corps, et ça
          révèle tout de suite les endroits qui accrochent.
        </Li>
        <Li>
          <strong>Masquer pour tester.</strong> Cache tes répliques (avec un cache, une feuille ou
          une app) et essaie de les dire sans regarder. C’est un des meilleurs exercices de
          mémorisation : tu vérifies vraiment que tu sais, au lieu de simplement relire.
        </Li>
        <Li>
          <strong>Répéter en conditions.</strong> Une fois à l’aise, entraîne-toi debout, en
          bougeant un peu, comme en répétition. Ça évite la surprise le jour J et ça réduit le
          stress.
        </Li>
      </Ul>

      <H2>Pourquoi le stabilo ne suffit plus</H2>
      <P>
        Surligner son texte aide à repérer son rôle, mais ça reste un outil passif : tu ne testes
        pas ta mémoire, tu ne reçois aucun feedback. Pour vraiment apprendre et combattre la peur
        du trou de mémoire, il faut des exercices de mémorisation actifs : réciter, se faire
        interroger, révéler les répliques au fur et à mesure pour vérifier. Le stabilo ne te dit
        pas où tu bloques ni quand revoir une réplique. Des outils qui masquent le texte et
        t’obligent à réciter (ou qui utilisent la répétition espacée) vont beaucoup plus loin.
      </P>

      <H2>Comment Côté-Cour aide les élèves des cours de théâtre amateurs</H2>
      <P>
        Côté-Cour est pensé pour les élèves en cours de théâtre, y compris débutants. Tu importes
        ta scène (photo ou PDF), l’app extrait ton rôle et masque tes répliques. Tu les révèles
        une à une en récitant : un vrai exercice de mémorisation, sans avoir à tout préparer à
        la main. Tu vois tout de suite où tu hésites, et tu peux cibler les passages à retravailler.
        Beaucoup d’élèves des cours de théâtre amateurs gagnent du temps entre deux cours en
        répétant comme ça sur leur téléphone, et arrivent moins stressés grâce à une mémorisation
        plus structurée — et donc moins de peur du trou de mémoire le jour de la répétition ou
        de l’audition.
      </P>
    </>
  );
}

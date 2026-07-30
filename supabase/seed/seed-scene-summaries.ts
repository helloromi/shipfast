/**
 * Côté-Cour — pose la fiche éditoriale (`scenes.summary`) sur les scènes du catalogue.
 *
 * Pourquoi. Le corps d'une page scène, c'est le texte de la scène : un texte du domaine
 * public disponible mot pour mot sur Wikisource, toutlemoliere.net et theatre-classique.fr.
 * Sans couche éditoriale, nos 190 pages sont 190 doublons et rien ne justifie qu'un moteur
 * nous préfère à la source. La fiche est le seul contenu de la page qui n'existe nulle part
 * ailleurs. Elle alimente trois endroits d'un coup : le corps de la page
 * (src/components/scenes/scene-detail-view.tsx), la `description` du JSON-LD CreativeWork
 * (src/lib/seo/json-ld.ts), et le verdict d'indexation des scènes courtes
 * (src/lib/seo/thin-scenes.ts — une scène qui porte une fiche n'est jamais « mince »).
 *
 * Format. Trois paragraphes séparés par une ligne vide, dans cet ordre :
 *   1. la situation — où on en est dans la pièce, qui parle à qui, pourquoi ;
 *   2. ce qui se joue — l'enjeu dramatique, ce que le comédien doit tenir ;
 *   3. pour l'apprendre — volume, vers ou prose, difficulté, à qui la scène s'adresse.
 * Le troisième paragraphe est ce qui nous distingue vraiment d'un site de textes : il
 * répond à l'intention « je dois jouer ou apprendre cette scène », pas « je veux la lire ».
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/seed-scene-summaries.ts             # dry-run : n'écrit rien
 *   npx tsx supabase/seed/seed-scene-summaries.ts --apply     # écrit en base
 *
 * Le script n'écrase jamais une fiche existante sans le dire : il affiche l'ancienne et la
 * nouvelle, et ne remplace que sous --apply. Une scène introuvable est signalée, pas créée.
 */

import { join } from "node:path";

import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type Fiche = {
  /** Slug de l'œuvre (works.slug). */
  work: string;
  /** Slug de la scène (scenes.slug), unique dans son œuvre. */
  scene: string;
  /** Les trois paragraphes de la fiche. */
  summary: string;
};

/**
 * Lot pilote. Dix scènes au texte intégral vérifié (aucun extrait tronqué), choisies
 * sur la demande de recherche : les duos et tirades les plus demandés en cours, en
 * audition et à l'oral de français.
 */
const FICHES: Fiche[] = [
  {
    work: "phedre",
    scene: "acte-i-scene-iii",
    summary: `Phèdre paraît pour la première fois, épuisée, soutenue par Œnone. Elle se meurt depuis trois jours d'un mal qu'elle refuse de nommer. Œnone la presse, menace de mourir avec elle, et finit par lui arracher le nom qu'elle taisait : Hippolyte, le fils de son mari Thésée.

Tout se joue sur le refus de dire, puis sur l'aveu qui échappe. Phèdre ne raconte pas son amour, elle le subit devant témoin — « Je le vis, je rougis, je pâlis à sa vue ». Œnone n'est pas une confidente passive : c'est elle qui extorque, et sa pression est le moteur de la scène. À deux, il faut tenir la montée et ne pas jouer d'emblée au sommet.

65 répliques en alexandrins, pour deux comédiennes. C'est le grand duo du répertoire tragique, et l'une des scènes les plus demandées en cours comme en concours. La difficulté n'est pas la longueur mais l'enchaînement : les tirades de Phèdre s'appuient sur des rimes qui servent d'appui à la mémoire, une fois le mouvement d'ensemble compris.`,
  },
  {
    work: "le-misanthrope",
    scene: "acte-i-scene-premiere",
    summary: `La pièce s'ouvre sur une dispute déjà commencée. Alceste sort furieux d'un salon où il vient de voir Philinte, son ami, embrasser chaleureusement un homme dont il ne savait même pas le nom. De cette politesse ordinaire, Alceste tire un procès général contre le genre humain.

Ce n'est pas un débat d'idées mais un duel de tempéraments : Alceste veut qu'on dise la vérité en toute occasion, Philinte tient que la vie en société est faite d'accommodements. Molière ne donne raison à personne, et c'est ce qui rend la scène jouable — chacun doit défendre sa position sans caricature. Le rire vient de l'excès d'Alceste, jamais de son mépris.

70 répliques en alexandrins, deux rôles d'homme. Scène d'exposition la plus travaillée du répertoire comique, et un classique de l'oral de français. Pour un duo, c'est un bon terrain d'apprentissage : les répliques sont courtes, la relance est constante, et la mémoire s'accroche au rythme de la joute plus qu'au sens de chaque vers.`,
  },
  {
    work: "les-fourberies-de-scapin",
    scene: "acte-ii-scene-vii",
    summary: `Scapin doit tirer de l'argent à Argante pour sauver le mariage secret de son fils. Il lui raconte que Léandre est retenu sur une galère turque et qu'il faut cinq cents écus pour le racheter. Argante, avare, résiste réplique après réplique.

C'est le moteur comique le plus connu de Molière : la même phrase revient — « Que diable allait-il faire dans cette galère ? » — pendant qu'Argante cède centimètre par centimètre. Le comique tient entièrement au rythme de l'usure : Scapin ne force jamais, il attend. Pour celui qui joue Argante, la difficulté est de rendre chaque refus sincère alors que la salle sait qu'il va payer.

84 répliques en prose, deux rôles d'homme. La prose de Molière se retient plus vite que l'alexandrin, mais la répétition est un piège : les reprises de « Que diable… » sont presque identiques et se confondent à la récitation. C'est exactement le cas où un travail carte par carte sert plus qu'une relecture.`,
  },
  {
    work: "le-malade-imaginaire",
    scene: "acte-iii-scene-iii",
    summary: `Béralde vient plaider auprès de son frère Argan la cause d'Angélique, qu'Argan veut marier à un médecin. Il commence par lui demander de ne pas s'échauffer, puis attaque de front ce qui tient Argan debout : sa foi dans la médecine.

La scène est un duel entre un homme raisonnable et un homme dont la maladie imaginaire est la raison de vivre. Béralde ne cherche pas à convaincre en douceur : il démonte, argument par argument, jusqu'à provoquer la fureur. Molière y règle ses comptes avec les médecins de son temps, mais la scène ne tient que si Argan reste attachant dans son entêtement.

80 répliques en prose, deux rôles d'homme, dont plusieurs longues tirades pour Béralde. Passage très fréquemment donné à l'oral et en atelier. Les tirades argumentatives se retiennent par leur enchaînement logique plus que par les mots : repérer les étapes du raisonnement avant d'apprendre les phrases fait gagner beaucoup de temps.`,
  },
  {
    work: "le-cid",
    scene: "acte-iii-scene-iv",
    summary: `Rodrigue a tué le père de Chimène en duel. Au lieu de fuir, il entre chez elle, lui tend l'épée du meurtre et lui demande de le tuer. Chimène, qui vient de réclamer justice au roi, se retrouve face à l'homme qu'elle aime et qu'elle doit poursuivre.

Les deux personnages sont d'accord sur tout — l'honneur commandait le duel, l'honneur commande la vengeance — et c'est ce qui rend la scène insoutenable. Chacun exige de l'autre qu'il fasse son devoir contre lui-même. C'est la scène du « Va, je ne te hais point », où l'aveu ne peut passer que par la litote.

69 répliques en alexandrins, deux rôles principaux. L'un des duos les plus demandés en concours et un incontournable du programme. Les stichomythies — ces répliques d'un vers qui se répondent — font l'attrait de la scène et sa difficulté : elles s'apprennent par paires, jamais isolément.`,
  },
  {
    work: "le-cid",
    scene: "acte-iv-scene-iii",
    summary: `Rodrigue revient victorieux du combat nocturne contre les Mores. Le roi Don Fernand le reçoit et lui demande le récit de la bataille. Rodrigue raconte l'embarquement secret, l'attente, la surprise et la déroute de l'ennemi.

C'est un récit, pas une action : tout l'enjeu est de faire voir une bataille avec la seule parole. Le morceau monte du silence de l'embuscade au fracas, puis retombe sur « Et le combat cessa faute de combattants ». Le comédien doit tenir une longue tirade narrative sans jamais la déclamer d'un bloc.

33 répliques en alexandrins, dont une très longue tirade pour Rodrigue. Grand classique du travail de tirade seule, en audition comme à l'oral. C'est la scène idéale pour un découpage en cartes : le récit suit une chronologie, et chaque carte correspond à une étape du combat.`,
  },
  {
    work: "berenice",
    scene: "acte-iv-scene-v",
    summary: `Titus, devenu empereur, doit renvoyer Bérénice : Rome n'acceptera pas une reine étrangère sur le trône. Il a fui l'explication pendant tout l'acte. Bérénice le force enfin à parler, et il lui apprend qu'il l'aime et qu'il la quitte.

Racine écrit ici une rupture où personne n'a tort et où personne ne peut céder. Bérénice passe de l'incrédulité à la colère, puis à la menace de mourir ; Titus ne répond presque rien, et ce silence est le rôle. Toute la tragédie tient dans un mot répété, qui est aussi le dernier de la scène : adieu.

52 répliques en alexandrins, un homme et une femme. L'une des scènes de rupture les plus jouées, et parmi les plus difficiles : peu d'action, tout dans la nuance. À apprendre en repérant d'abord les changements d'état de Bérénice, qui structurent la scène mieux que le découpage en répliques.`,
  },
  {
    work: "britannicus",
    scene: "acte-ii-scene-iii",
    summary: `Néron a fait enlever Junie dans la nuit. Il la reçoit seul, lui déclare son amour, puis lui ordonne de rompre avec Britannicus — devant Britannicus, sans rien lui laisser deviner, pendant que lui-même écoutera, caché.

C'est la scène où la tyrannie devient intime. Néron ne menace presque jamais directement : il propose, il suggère, il fait de son amour une affaire d'État. Junie n'a aucune arme et sa résistance passe uniquement par la politesse. Pour les deux comédiens, la difficulté est de tenir cette violence sous une conversation de cour.

53 répliques en alexandrins, un homme et une femme. Scène très demandée en cours et à l'oral. Les répliques de Néron alternent tirades et vers isolés : mémoriser d'abord les enchaînements courts, les plus glissants, avant d'attaquer les longues tirades.`,
  },
  {
    work: "britannicus",
    scene: "acte-iv-scene-ii",
    summary: `Agrippine a obtenu de son fils l'entretien qu'elle réclamait depuis le début de la pièce. Elle lui rappelle tout ce qu'elle a fait pour le mettre sur le trône : les intrigues, les mariages, les morts. Néron l'écoute jusqu'au bout, puis répond.

La tirade d'Agrippine est un plaidoyer et une menace : en énumérant ses propres crimes, elle rappelle à Néron qu'elle peut défaire ce qu'elle a fait. La réponse de Néron est brève et glaçante, car il feint de céder. C'est le sommet politique de la pièce, et tout bascule sur les deux derniers vers.

52 répliques en alexandrins, dominées par l'une des plus longues tirades du théâtre classique. Morceau de référence pour travailler la tirade au long cours. Le récit d'Agrippine suit un ordre chronologique strict : l'apprendre en suivant cette chronologie évite les sauts d'un épisode à l'autre, qui sont l'erreur la plus fréquente.`,
  },
  {
    work: "les-caprices-de-marianne",
    scene: "acte-i-scene-1-une-rue",
    summary: `Cœlio aime Marianne, mariée au juge Claudio, plus âgé et jaloux. Trop timide pour se déclarer, il charge son cousin Octave — noceur, éloquent, son exact contraire — de plaider sa cause. La scène installe les deux amis, la ville, et le premier refus de Marianne.

Musset y oppose deux façons d'aimer : Cœlio ne sait que souffrir, Octave ne sait que parler. C'est cette dissymétrie qui fera la tragédie de la pièce. L'écriture est en prose, avec des répliques très inégales — quelques mots ici, une tirade là — et le rythme de la scène dépend entièrement de cette irrégularité.

101 répliques en prose, six personnages, mais l'essentiel repose sur Octave et Cœlio. Long à monter, plus facile à retenir que du vers : la prose de Musset est proche du parlé. Utile pour un atelier qui cherche une scène d'exposition à distribution large plutôt qu'un duo.`,
  },
];

type SceneRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  works: { slug: string } | null;
};

/** Normalise pour comparer deux fiches sans se faire piéger par les fins de ligne. */
const normalize = (text: string) => text.replace(/\r\n/g, "\n").trim();

async function main(): Promise<void> {
  console.log(
    `${APPLY ? "✍️  ÉCRITURE" : "🔍 DRY-RUN"} — ${FICHES.length} fiche(s) à poser.\n`
  );

  let toWrite = 0;
  let unchanged = 0;
  let overwritten = 0;
  const missing: string[] = [];
  const updates: { id: string; summary: string }[] = [];

  for (const fiche of FICHES) {
    const { data, error } = await db
      .from("scenes")
      .select("id, title, slug, summary, works!inner(slug)")
      .eq("slug", fiche.scene)
      .eq("works.slug", fiche.work)
      .eq("is_private", false)
      .returns<SceneRow[]>();

    if (error) {
      console.error(`❌ ${fiche.work}/${fiche.scene} — erreur Supabase : ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    if (!data || data.length === 0) {
      console.log(`⚠️  ${fiche.work}/${fiche.scene} — scène introuvable, ignorée.`);
      missing.push(`${fiche.work}/${fiche.scene}`);
      continue;
    }
    if (data.length > 1) {
      console.log(
        `⚠️  ${fiche.work}/${fiche.scene} — ${data.length} scènes portent ce couple (slug, œuvre), ignorée.`
      );
      missing.push(`${fiche.work}/${fiche.scene}`);
      continue;
    }

    const scene = data[0]!;
    const next = normalize(fiche.summary);
    const current = scene.summary ? normalize(scene.summary) : null;

    if (current === next) {
      console.log(`＝ ${fiche.work}/${fiche.scene} — déjà à jour.`);
      unchanged++;
      continue;
    }

    const paragraphs = next.split(/\n\s*\n/).length;
    const words = next.split(/\s+/).length;
    console.log(`→ ${fiche.work}/${fiche.scene} — « ${scene.title} »`);
    console.log(`  ${paragraphs} paragraphes, ${words} mots.`);
    if (current) {
      // On ne remplace jamais une fiche existante en silence.
      console.log(`  ⚠️  ÉCRASE la fiche actuelle : « ${current.slice(0, 120)}… »`);
      overwritten++;
    }
    updates.push({ id: scene.id, summary: next });
    toWrite++;
  }

  console.log(
    `\nRésumé : ${toWrite} à écrire (dont ${overwritten} écrasement(s)), ${unchanged} inchangée(s), ${missing.length} introuvable(s).`
  );

  if (missing.length > 0) {
    console.log(`Introuvables : ${missing.join(", ")}`);
  }

  if (!APPLY) {
    console.log("\nDry-run : rien n'a été écrit. Relance avec --apply pour appliquer.");
    return;
  }

  for (const update of updates) {
    const { error } = await db
      .from("scenes")
      .update({ summary: update.summary })
      .eq("id", update.id);
    if (error) {
      console.error(`❌ écriture ${update.id} : ${error.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`\n✅ ${updates.length} fiche(s) écrite(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

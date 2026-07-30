-- Les deux dernières scènes « vitrine » tronquées.
--
-- Complément de 20260730140000 : ces deux-là avaient été écartées du premier lot
-- faute d'être vérifiables, chacune butant sur une particularité de l'édition
-- Louandre 1910.
--
-- L'Avare IV,7 (« Au voleur ! ») : Louandre enchaîne sans séparation sur son
-- appareil critique — un pastiche « dans le ton du drame moderne » commandé par
-- Saint-Marc Girardin, avec des personnages LE PÈRE et LE FILS. Le parser le lisait
-- comme la suite de la scène. On coupe au premier locuteur non-HARPAGON, c'est-à-dire
-- après « je me pendrai moi-même après », qui clôt bien le monologue chez Molière.
--
-- Le Bourgeois gentilhomme, la leçon de prose : elle porte le numéro II,6 chez
-- Louandre, alors que les éditions courantes — et notre URL — la numérotent II,4.
-- C'est ce décalage qui avait fait croire à un mauvais appariement. Le slug et le
-- titre ne bougent pas : ils suivent la numérotation que les lecteurs cherchent.
-- L'édition alterne « LE MAÎTRE DE PHILOSOPHIE » et « MAÎTRE DE PHILOSOPHIE » pour
-- le même rôle ; les deux graphies sont fusionnées.
--
-- Source : https://fr.wikisource.org/wiki/L’Avare_(Molière)/Édition_Louandre,_1910/Acte_IV
--          https://fr.wikisource.org/wiki/Le_Bourgeois_gentilhomme/Édition_Louandre,_1910/Acte_II

-- l-avare/acte-iv-scene-7 — monologue « Au voleur ! » complet (11 cartes, 2 007 car. contre 6 et 1 126)
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'l-avare' and s.slug = 'acte-iv-scene-7';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'HARPAGON');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Au voleur ! au voleur ! à l’assassin ! au meurtrier ! Justice, juste ciel ! Je suis perdu, je suis assassiné ; on m’a coupé la gorge : on m’a dérobé mon argent. Qui peut-ce être ? Qu’est-il devenu ? Où est-il ?'),
    (v_scene, v_c0, 2, 'Où se cache-t-il ? Que ferai-je pour le trouver ? Où courir ? Où ne pas courir ? N’est-il point là ? n’est-il point ici ? Qui est-ce ? Arrête. (À lui-même, se prenant par le bras.) Rends-moi mon argent, coquin… Ah !'),
    (v_scene, v_c0, 3, 'c’est moi ! Mon esprit est troublé, et j’ignore où je suis, qui je suis, et ce que je fais. Hélas ! mon pauvre argent ! mon pauvre argent ! mon cher ami ! on m’a privé de toi ;'),
    (v_scene, v_c0, 4, 'et puisque tu m’es enlevé, j’ai perdu mon support, ma consolation, ma joie : tout est fini pour moi, et je n’ai plus que faire au monde. Sans toi, il m’est impossible de vivre. C’en est fait ; je n’en puis plus ;'),
    (v_scene, v_c0, 5, 'je me meurs ; je suis mort ; je suis enterré. N’y a-t-il personne qui veuille me ressusciter, en me rendant mon cher argent, ou en m’apprenant qui l’a pris? Euh ! que dites-vous ? Ce n’est personne.'),
    (v_scene, v_c0, 6, 'Il faut, qui que ce soit qui ait fait le coup, qu’avec beaucoup de soin on ait épié l’heure ; et l’on a choisi justement le temps que je parlais à mon traître de fils. Sortons.'),
    (v_scene, v_c0, 7, 'Je veux aller quérir la justice, et faire donner la question à toute ma maison ; à servantes, à valets, à fils, à fille, et à moi aussi. Que de gens assemblés !'),
    (v_scene, v_c0, 8, 'Je ne jette mes regards sur personne qui ne me donne des soupçons, et tout me semble mon voleur. Hé ! de quoi est-ce qu’on parle là ? de celui qui m’a dérobé ? Quel bruit fait-on là-haut ? Est-ce mon voleur qui y est ?'),
    (v_scene, v_c0, 9, 'De grâce, si l’on sait des nouvelles de mon voleur, je supplie que l’on m’en dise. N’est-il point caché là parmi vous ? Ils me regardent tous, et se mettent à rire.'),
    (v_scene, v_c0, 10, 'Vous verrez qu’ils ont part, sans doute, au vol que l’on m’a fait. Allons, vite, des commissaires, des archers, des prévôts, des juges, des gênes, des potences, et des bourreaux ! Je veux faire pendre tout le monde ;'),
    (v_scene, v_c0, 11, 'et si je ne retrouve mon argent, je me pendrai moi-même après.');
end $$;

-- le-bourgeois-gentilhomme/acte-ii-scene-4-la-prose — leçon de philosophie complète (89 cartes, 7 644 car. contre 14 et 747)
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'le-bourgeois-gentilhomme' and s.slug = 'acte-ii-scene-4-la-prose';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'LE MAÎTRE DE PHILOSOPHIE');
  insert into characters (id, scene_id, name) values (v_c1, v_scene, 'MONSIEUR JOURDAIN');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Venons à notre leçon.'),
    (v_scene, v_c1, 2, 'Ah ! monsieur, je suis fâché des coups qu’ils vous ont donnés.'),
    (v_scene, v_c0, 3, 'Cela n’est rien. Un philosophe sait recevoir comme il faut les choses ; et je vais composer contre eux une satire du style de Juvénal, qui les déchirera de la belle façon. Laissons cela. Que voulez-vous apprendre ?'),
    (v_scene, v_c1, 4, 'Tout ce que je pourrai ; car j’ai toutes les envies du monde d’être savant ; et j’enrage que mon père et ma mère ne m’aient pas fait bien étudier dans toutes les sciences, quand j’étois jeune.'),
    (v_scene, v_c0, 5, 'Ce sentiment est raisonnable ; nam, sine doctrina, vita est quasi mortis imago. Vous entendez cela, et vous savez le latin, sans doute.'),
    (v_scene, v_c1, 6, 'Oui ; mais faites comme si je ne le savois pas. Expliquez-moi ce que cela veut dire.'),
    (v_scene, v_c0, 7, 'Cela veut dire que, sans la science, la vie est presque une image de la mort.'),
    (v_scene, v_c1, 8, 'Ce latin-là a raison.'),
    (v_scene, v_c0, 9, 'N’avez-vous point quelques principes, quelques commencements des sciences ?'),
    (v_scene, v_c1, 10, 'Oh ! oui, je sais lire et écrire.'),
    (v_scene, v_c0, 11, 'Par où vous plaît-il que nous commencions ? Voulez-vous que je vous apprenne la logique ?'),
    (v_scene, v_c1, 12, 'Qu’est-ce que c’est que cette logique ?'),
    (v_scene, v_c0, 13, 'C’est elle qui enseigne les trois opérations de l’esprit.'),
    (v_scene, v_c1, 14, 'Qui sont-elles, ces trois opérations de l’esprit ?'),
    (v_scene, v_c0, 15, 'La première, la seconde, et la troisième. La première est de bien concevoir, par le moyen des universaux ; la seconde, de bien juger, par le moyen des catégories ;'),
    (v_scene, v_c0, 16, 'et la troisième, de bien tirer une conséquence, par le moyen, des figures : Barbara, Celarent, Darii, Ferio, Baralipton.'),
    (v_scene, v_c1, 17, 'Voilà des mots qui sont trop rébarbatifs. Cette logique-là ne me revient point. Apprenons autre chose qui soit plus joli.'),
    (v_scene, v_c0, 18, 'Voulez-vous apprendre la morale ?'),
    (v_scene, v_c1, 19, 'La morale ?'),
    (v_scene, v_c0, 20, 'Oui.'),
    (v_scene, v_c1, 21, 'Qu’est-ce qu’elle dit, cette morale ?'),
    (v_scene, v_c0, 22, 'Elle traite de la félicité, enseigne aux hommes à modérer leurs passions, et…'),
    (v_scene, v_c1, 23, 'Non ; laissons cela. Je suis bilieux comme tous les diables, et il n’y a morale qui tienne : je me veux mettre en colère tout mon soûl, quand il m’en prend envie.'),
    (v_scene, v_c0, 24, 'Est-ce la physique que vous voulez apprendre ?'),
    (v_scene, v_c1, 25, 'Qu’est-ce qu’elle chante, cette physique ?'),
    (v_scene, v_c0, 26, 'La physique est celle qui explique les principes des choses naturelles, et les propriétés des corps ;'),
    (v_scene, v_c0, 27, 'qui discourt de la nature des éléments, des métaux, des minéraux, des pierres, des plantes et des animaux, et nous enseigne les causes de tous les météores, l’arc-en-ciel, les feux volants, les comètes, les éclairs, le tonnerre, la foudre, la pluie, la neige, la grêle, les vents, et les tourbillons.'),
    (v_scene, v_c1, 28, 'Il y a trop de tintamarre là dedans, trop de brouillamini.'),
    (v_scene, v_c0, 29, 'Que voulez-vous donc que je vous apprenne ?'),
    (v_scene, v_c1, 30, 'Apprenez-moi l’orthographe.'),
    (v_scene, v_c0, 31, 'Très volontiers.'),
    (v_scene, v_c1, 32, 'Après, vous m’apprendrez l’almanach, pour savoir quand il y a de la lune, et quand il n’y en a point.'),
    (v_scene, v_c0, 33, 'Soit.'),
    (v_scene, v_c0, 34, 'Pour bien suivre votre pensée, et traiter cette matière en philosophe, il faut commencer, selon l’ordre des choses, par une exacte connoissance de la nature des lettres, et de la différente manière de les prononcer toutes.'),
    (v_scene, v_c0, 35, 'Et là-dessus j’ai à vous dire que les lettres sont divisées en voyelles, ainsi dites voyelles, parcequ’elles expriment les voix ;'),
    (v_scene, v_c0, 36, 'et en consonnes, ainsi appelées consonnes, parce qu’elles sonnent avec les voyelles, et ne font que marquer les diverses articulations des voix. Il y a cinq voyelles, ou voix : A, E, I, O, U.'),
    (v_scene, v_c1, 37, 'J’entends tout cela.'),
    (v_scene, v_c0, 38, 'La voix A se forme en ouvrant fort la bouche : A.'),
    (v_scene, v_c1, 39, 'A, A. Oui.'),
    (v_scene, v_c0, 40, 'La voix E se forme en rapprochant la mâchoire d’en bas de celle d’en haut : A, E.'),
    (v_scene, v_c1, 41, 'A, E ; A, E. Ma foi, oui. Ah ! que cela est beau !'),
    (v_scene, v_c0, 42, 'Et la voix I, en rapprochant encore davantage les mâchoires l’une de l’autre, et écartant les deux coins de la bouche vers les oreilles : A, E, I.'),
    (v_scene, v_c1, 43, 'A, E, I, I, I, I. Cela est vrai. Vive la science !'),
    (v_scene, v_c0, 44, 'La voix O se forme en rouvrant les mâchoires, et rapprochant les lèvres par les deux coins, le haut et le bas : O.'),
    (v_scene, v_c1, 45, 'O, O. Il n’y a rien de plus juste : A, E, I, O, I, O. Cela est admirable ! I, O ; I, O.'),
    (v_scene, v_c0, 46, 'L’ouverture de la bouche fait justement comme un petit rond qui représente un O.'),
    (v_scene, v_c1, 47, 'O, O, O. Vous avez raison. O. Ah ! la belle chose que de savoir quelque chose !'),
    (v_scene, v_c0, 48, 'La voix U se forme en rapprochant les dents sans les joindre entièrement, et allongeant les deux lèvres en dehors, les approchant aussi l’une de l’autre, sans les joindre tout à fait : U.'),
    (v_scene, v_c1, 49, 'U, U Il n’y a rien de plus véritable : U.'),
    (v_scene, v_c0, 50, 'Vos deux lèvres s’allongent comme si vous faisiez la moue : d’où vient que si vous la voulez faire à quelqu’un et vous moquer de lui, vous ne sauriez lui dire que U.'),
    (v_scene, v_c1, 51, 'U, U. Cela est vrai. Ah ! que n’ai-je étudié plus tôt, pour savoir tout cela !'),
    (v_scene, v_c0, 52, 'Demain, nous verrons les autres lettres, qui sont les consonnes.'),
    (v_scene, v_c1, 53, 'Est-ce qu’il y a des choses aussi curieuses qu’à celles-ci ?'),
    (v_scene, v_c0, 54, 'Sans doute. La consonne D, par exemple, se prononce en donnant du bout de la langue au-dessus des dents d’en haut : DA.'),
    (v_scene, v_c1, 55, 'DA, DA. Oui ! Ah ! les belles choses ! les belles choses !'),
    (v_scene, v_c0, 56, 'L’F, en appuyant les dents d’en haut sur la lèvre de dessous : FA.'),
    (v_scene, v_c1, 57, 'FA, FA. C’est la vérité. Ah ! mon père et ma mère, que je vous veux de mal !'),
    (v_scene, v_c0, 58, 'Et l’R, en portant le bout de la langue jusqu’au haut du palais ; de sorte qu’étant frôlée par l’air qui sort avec force, elle lui cède, et revient toujours au même endroit, faisant une manière de tremblement : R, RA.'),
    (v_scene, v_c1, 59, 'R. R, RA ; R, R, R, R, R, RA. Cela est vrai. Ah ! l’habile homme que vous êtes, et que j’ai perdu de temps ! R, R, R, RA.'),
    (v_scene, v_c0, 60, 'Je vous expliquerai à fond toutes ces curiosités.'),
    (v_scene, v_c1, 61, 'Je vous en prie. Au reste, il faut que je vous fasse une confidence.'),
    (v_scene, v_c1, 62, 'Je suis amoureux d’une personne de grande qualité, et je souhaiterois que vous m’aidassiez à lui écrire quelque chose dans un petit billet que je veux laisser tomber à ses pieds.'),
    (v_scene, v_c0, 63, 'Fort bien !'),
    (v_scene, v_c1, 64, 'Cela sera galant, oui.'),
    (v_scene, v_c0, 65, 'Sans doute. Sont-ce des vers que vous lui voulez écrire ?'),
    (v_scene, v_c1, 66, 'Non, non ; point de vers.'),
    (v_scene, v_c0, 67, 'Vous ne voulez que de la prose ?'),
    (v_scene, v_c1, 68, 'Non, je ne veux ni prose ni vers.'),
    (v_scene, v_c0, 69, 'Il faut bien que ce soit l’un ou l’autre.'),
    (v_scene, v_c1, 70, 'Pourquoi ?'),
    (v_scene, v_c0, 71, 'Par la raison, monsieur, qu’il n’y a, pour s’exprimer, que la prose ou les vers.'),
    (v_scene, v_c1, 72, 'Il n’y a que la prose ou les vers ?'),
    (v_scene, v_c0, 73, 'Non, monsieur. Tout ce qui n’est point prose est vers, et tout ce qui n’est point vers est prose.'),
    (v_scene, v_c1, 74, 'Et comme l’on parle, qu’est-ce que c’est donc que cela ?'),
    (v_scene, v_c0, 75, 'De la prose.'),
    (v_scene, v_c1, 76, 'Quoi ! quand je dis : Nicole, apportez-moi mes pantoufles, et me donnez mon bonnet de nuit, c’est de la prose ?'),
    (v_scene, v_c0, 77, 'Oui, monsieur.'),
    (v_scene, v_c1, 78, 'Par ma foi, il y a plus de quarante ans que je dis de la prose, sans que j’en susse rien ; et je vous suis le plus obligé du monde de m’avoir appris cela.'),
    (v_scene, v_c1, 79, 'Je voudrois donc lui mettre dans un billet : Belle marquise, vos beaux yeux me font mourir d’amour ; mais je voudrois que cela fût mis d’une manière galante, que cela fût tourné gentiment.'),
    (v_scene, v_c0, 80, 'Mettre que les feux de ses yeux réduisent votre cœur en cendres ; que vous souffrez nuit et jour pour elle les violences d’un…'),
    (v_scene, v_c1, 81, 'Non, non, non, je ne veux point tout cela. Je ne veux que ce que je vous ai dit : Belle marquise, vos beaux yeux me font mourir d’amour.'),
    (v_scene, v_c0, 82, 'Il faut bien étendre un peu la chose.'),
    (v_scene, v_c1, 83, 'Non, vous dis-je. Je ne veux que ces seules paroles-là dans le billet, mais tournées à la mode, bien arrangées comme il faut. Je vous prie de me dire un peu, pour voir, les diverses manières dont on les peut mettre.'),
    (v_scene, v_c0, 84, 'On les peut mettre premièrement comme vous avez dit : Belle marquise, vos beaux yeux me font mourir d’amour. Ou bien : D’amour mourir me font, belle marquise, vos beaux yeux.'),
    (v_scene, v_c0, 85, 'Ou bien : Vos yeux beaux d’amour me font, belle marquise, mourir. Ou bien : Mourir vos beaux yeux, belle marquise, d’amour me font. Ou bien : Me font vos yeux beaux mourir, belle marquise, d’amour.'),
    (v_scene, v_c1, 86, 'Mais de toutes ces façons-là, laquelle est la meilleure ?'),
    (v_scene, v_c0, 87, 'Celle que vous avez dite : Belle marquise, vos beaux yeux me font mourir d’amour.'),
    (v_scene, v_c1, 88, 'Cependant je n’ai point étudié, et j’ai fait cela tout du premier coup. Je vous remercie de tout mon cœur, et vous prie de venir demain de bonne heure.'),
    (v_scene, v_c0, 89, 'Je n’y manquerai pas.');
end $$;


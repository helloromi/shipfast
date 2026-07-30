-- Britannicus : remplacement de l'édition 1670 (orthographe originale «ſ»,
-- tirades tronquées, chapter null) par l'édition Didot 1854 (français moderne,
-- actes corrects). Vérifié : aucune progression élève, session, feedback,
-- classe ni copie privée ne pointe sur ces scènes (tout à 0 le 16/07/2026).
-- Suppression en CASCADE de 467 lignes + 59 personnages, insertion de
-- 30 scènes / 65 personnages / 599 répliques.
-- Source : https://fr.wikisource.org/wiki/Britannicus_(éditions_Didot,_1854)

update works set slug = 'britannicus' where id = '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5' and slug is distinct from 'britannicus';

delete from scenes where work_id = '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5';

-- Acte I, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('3b591293-4e00-4603-8796-1045bd07dae1', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte I, Scène première', 'Acte I', 'acte-i-scene-premiere-4', false);
insert into characters (id, scene_id, name) values ('f1197e7c-2d3b-4fcc-9866-e0f6a2365159', '3b591293-4e00-4603-8796-1045bd07dae1', 'ALBINE');
insert into characters (id, scene_id, name) values ('74914d70-51f7-4fdf-af5f-4997179ad827', '3b591293-4e00-4603-8796-1045bd07dae1', 'AGRIPPINE');
insert into lines (scene_id, character_id, "order", text) values
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 1, 'Quoi ! tandis que Néron s’abandonne au sommeil, Faut-il que vous veniez attendre son réveil ? Qu’errant dans le palais, sans suite et sans escorte, La mère de César veille seule à sa porte ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 2, 'Madame, retournez dans votre appartement.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 3, 'Albine, il ne faut pas s’éloigner un moment. Je veux l’attendre ici : les chagrins qu’il me cause M’occuperont assez tout le temps qu’il repose.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 4, 'Tout ce que j’ai prédit n’est que trop assuré : Contre Britannicus Néron s’est déclaré. L’impatient Néron cesse de se contraindre ; Las de se faire aimer, il veut se faire craindre. Britannicus le gêne, Albine ;'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 5, 'et chaque jour Je sens que je deviens importune à mon tour.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 6, 'Quoi ! vous à qui Néron doit le jour qu’il respire. Qui l’avez appelé de si loin à l’empire ? Vous qui, déshéritant le fils de Claudius, Avez nommé César l’heureux Domitius ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 7, 'Tout lui parle, madame, en faveur d’Agrippine : Il vous doit son amour.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 8, 'Il vous doit son amour. Il me le doit, Albine : Tout, s’il est généreux, lui prescrit cette loi ; Mais tout, s’il est ingrat, lui parle contre moi.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 9, 'S’il est ingrat, madame ? Ah ! toute sa conduite Marque dans son devoir une âme trop instruite. Depuis trois ans entiers, qu’a-t-il dit, qu’a-t-il fait Qui ne promette à Rome un empereur parfait ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 10, 'Rome, depuis trois ans par ses soins gouvernée, Au temps de ses consuls croit être retournée : Il la gouverne en père. Enfin Néron naissant A toutes les vertus d’Auguste vieillissant.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 11, 'Non, non ; mon intérêt ne me rend point injuste : Il commence, il est vrai, par où finit Auguste ; Mais crains que, l’avenir détruisant le passé, Il ne finisse ainsi qu’Auguste a commencé.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 12, 'Il se déguise en vain : je lis sur son visage Des fiers Domitius l’humeur triste et sauvage ; Il mêle avec l’orgueil qu’il a pris dans leur sang La fierté des Nérons qu’il puisa dans mon flanc.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 13, 'Toujours la tyrannie a d’heureuses prémices : De Rome, pour un temps, Caïus fut les délices ; Mais sa feinte bonté se tournant en fureur, Les délices de Rome en devinrent l’horreur.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 14, 'Que m’importe, après tout, que Néron, plus fidèle, D’une longue vertu laisse un jour le modèle ? Ai-je mis dans sa main le timon de l’État Pour le conduire au gré du peuple et du sénat ? Ah !'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 15, 'que de la patrie il soit, s’il veut, le père ; Mais qu’il songe un peu plus qu’Agrippine est sa mère. De quel nom cependant pouvons-nous appeler L’attentat que le jour vient de nous révéler ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 16, 'Il sait, car leur amour ne peut être ignorée, Que de Britannicus Junie est adorée : Et ce même Néron, que la vertu conduit, Fait enlever Junie au milieu de la nuit ! Que veut-il ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 17, 'Est-ce haine, est-ce amour qui l’inspire ? Cherche-t-il seulement le plaisir de leur nuire ; Ou plutôt n’est-ce point que sa malignité Punit sur eux l’appui que je leur ai prêté ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 18, 'Vous leur appui, madame ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 19, 'Vous leur appui, madame ? Arrête, chère Albine. Je sais que j’ai moi seule avancé leur ruine ; Que du trône, où le sang l’a dû faire monter, Britannicus par moi s’est vu précipiter.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 20, 'Par moi seule, éloigné de l’hymen d’Octavie, Le frère de Junie abandonna la vie, Silanus, sur qui Claude avait jeté les yeux, Et qui comptait Auguste au rang de ses aïeux.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 21, 'Néron jouit de tout : et moi, pour récompense, Il faut qu’entre eux et lui je tienne la balance, Afin que quelque jour, par une même loi, Britannicus la tienne entre mon fils et moi.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 22, 'Quel dessein !'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 23, 'Quel dessein ! Je m’assure un port dans la tempête. Néron m’échappera, si ce frein ne l’arrête.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 24, 'Mais prendre contre un fils tant de soins superflus !'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 25, 'Je le craindrais bientôt, s’il ne me craignait plus.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 26, 'Une juste frayeur vous alarme peut-être. Mais si Néron pour vous n’est plus ce qu’il doit être, Du moins son changement ne vient pas jusqu’à nous, Et ce sont des secrets entre César et vous.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 27, 'Quelques titres nouveaux que Rome lui défère, Néron n’en reçoit point qu’il ne donne à sa mère. Sa prodigue amitié ne se réserve rien : Votre nom est dans Rome aussi saint que le sien ;'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 28, 'À peine parle-t-on de la triste Octavie. Auguste votre aïeul honora moins Livie : Néron devant sa mère a permis le premier Qu’on portât les faisceaux couronnés de laurier. Quels effets voulez-vous de sa reconnaissance ?'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 29, 'Un peu moins de respect, et plus de confiance. Tous ces présents, Albine, irritent mon dépit : Je vois mes honneurs croître et tomber mon crédit.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 30, 'Non, non, le temps n’est plus que Néron, jeune encore, Me renvoyait les vœux d’une cour qui l’adore ; Lorsqu’il se reposait sur moi de tout l’État ; Que mon ordre au palais assemblait le sénat ;'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 31, 'Et que derrière un voile, invisible et présente, J’étais de ce grand corps l’âme toute-puissante, Des volontés de Rome alors mal assuré, Néron de sa grandeur n’était point enivré.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 32, 'Ce jour, ce triste jour, frappe encor ma mémoire, Où Néron fut lui-même ébloui de sa gloire, Quand les ambassadeurs de tant de rois divers Vinrent le reconnaître au nom de l’univers.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 33, 'Sur son trône avec lui j’allais prendre ma place : J’ignore quel conseil prépara ma disgrâce ; Quoi qu’il en soit, Néron, d’aussi loin qu’il me vit, Laissa sur son visage éclater son dépit.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 34, 'Mon cœur même en conçut un malheureux augure. L’ingrat, d’un faux respect colorant son injure, Se leva par avance ; et courant m’embrasser, Il m’écarta du trône où je m’allais placer.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 35, 'Depuis ce coup fatal le pouvoir d’Agrippine Vers sa chute à grands pas chaque jour s’achemine. L’ombre seule m’en reste ; et l’on n’implore plus Que le nom de Sénèque, et l’appui de Burrhus.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', 'f1197e7c-2d3b-4fcc-9866-e0f6a2365159', 36, 'Ah ! si de ce soupçon votre âme est prévenue, Pourquoi nourrissez-vous le venin qui vous tue ? Allez avec César vous éclaircir du moins.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 37, 'César ne me voit plus, Albine, sans témoins : En public, à mon heure, on me donne audience. Sa réponse est dictée, et même son silence.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 38, 'Je vois deux surveillants, ses maîtres et les miens, Présider l’un ou l’autre à tous nos entretiens. Mais je le poursuivrai d’autant plus qu’il m’évite : De son désordre, Albine, il faut que je profite.'),
  ('3b591293-4e00-4603-8796-1045bd07dae1', '74914d70-51f7-4fdf-af5f-4997179ad827', 39, 'J’entends du bruit ; on ouvre. Allons subitement Lui demander raison de cet enlèvement : Surprenons, s’il se peut, les secrets de son âme. Mais quoi ! déjà Burrhus sort de chez lui !');

-- Acte I, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte I, Scène II', 'Acte I', 'acte-i-scene-ii-4', false);
insert into characters (id, scene_id, name) values ('cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', '69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'BURRHUS');
insert into characters (id, scene_id, name) values ('2aee8031-9fe0-4e44-bd11-74bfed9c48fd', '69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'AGRIPPINE');
insert into lines (scene_id, character_id, "order", text) values
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 1, 'Mais quoi ! déjà Burrhus sort de chez lui !'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 2, 'Madame, Au nom de l’empereur j’allais vous informer D’un ordre qui d’abord a pu vous alarmer, Mais qui n’est que l’effet d’une sage conduite, Dont César a voulu que vous soyez instruite.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 3, 'Puisqu’il le veut, entrons : il m’en instruira mieux.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 4, 'César pour quelque temps s’est soustrait à nos yeux. Déjà par une porte au public moins connue L’un et l’autre consul vous avaient prévenue, Madame. Mais souffrez que je retourne exprès…'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 5, 'Non, je ne trouble point ses augustes secrets ; Cependant voulez-vous qu’avec moins de contrainte L’un et l’autre une fois nous nous parlions sans feinte ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 6, 'Burrhus pour le mensonge eut toujours trop d’horreur.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 7, 'Prétendez-vous longtemps me cacher l’empereur ? Ne le verrai-je plus qu’à titre d’importune ? Ai-je donc élevé si haut votre fortune Pour mettre une barrière entre mon fils et moi ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 8, 'Ne l’osez-vous laisser un moment sur sa foi ? Entre Sénèque et vous disputez-vous la gloire À qui m’effacera plus tôt de sa mémoire ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 9, 'Vous l’ai-je confié pour en faire un ingrat, Pour être, sous son nom, les maîtres de l’État ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 10, 'Certes, plus je médite, et moins je me figure Que vous m’osiez compter pour votre créature, Vous dont j’ai pu laisser vieillir l’ambition Dans les honneurs obscurs de quelque légion ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 11, 'Et moi qui sur le trône ai suivi mes ancêtres, Moi, fille, femme, sœur et mère de vos maîtres ! Que prétendez-vous donc ? Pensez-vous que ma voix Ait fait un empereur pour m’en imposer trois ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 12, 'Néron n’est plus enfant : n’est-il pas temps qu’il règne.  Jusqu’à quand voulez-vous que l’empereur vous craigne ? Ne saurait-il rien voir qu’il n’emprunte vos yeux ? Pour se conduire, enfin, n’a-t-il pas ses aïeux ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 13, 'Qu’il choisisse, s’il veut, d’Auguste ou de Tibère ; Qu’il imite, s’il peut, Germanicus mon père. Parmi tant de héros je n’ose me placer ; Mais il est des vertus que je lui puis tracer ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 14, 'Je puis l’instruire au moins combien sa confidence Entre un sujet et lui doit laisser de distance.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 15, 'Je ne m’étais chargé dans cette occasion Que d’excuser César d’une seule action ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 16, 'Mais puisque sans vouloir que je le justifie Vous me rendez garant du reste de sa vie, Je répondrai, madame, avec la liberté D’un soldat qui sait mal farder la vérité.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 17, 'Vous m’avez de César confié la jeunesse, Je l’avoue ; et je dois m’en souvenir sans cesse. Mais vous avais-je fait serment de le trahir, D’en faire un empereur qui ne sût qu’obéir ? Non.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 18, 'Ce n’est plus à vous qu’il faut que j’en réponde : Ce n’est plus votre fils, c’est le maître du monde. J’en dois compte, madame, à l’empire romain, Qui croit voir son salut ou sa perte en ma main. Ah !'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 19, 'si dans l’ignorance il le fallait instruire, N’avait-on que Sénèque et moi pour le séduire ? Pourquoi de sa conduite éloigner les flatteurs ? Fallait-il dans l’exil chercher des corrupteurs ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 20, 'La cour de Claudius, en esclaves fertile, Pour deux que l’on cherchait en eût présenté mille, Qui tous auraient brigué l’honneur de l’avilir : Dans une longue enfance ils l’auraient fait vieillir.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 21, 'De quoi vous plaignez-vous, madame ? On vous révère : Ainsi que par César, on jure par sa mère. L’empereur, il est vrai, ne vient plus chaque jour Mettre à vos pieds l’empire, et grossir votre cour ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 22, 'Mais le doit-il, madame ? et sa reconnaissance Ne peut-elle éclater que dans sa dépendance ? Toujours humble, toujours le timide Néron N’ose-t-il être Auguste et César que de nom ? Vous le dirai-je enfin ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 23, 'Rome le justifie. Rome, à trois affranchis si longtemps asservie, À peine respirant du joug qu’elle a porté, Du règne de Néron compte sa liberté. Que dis-je ? la vertu semble même renaître.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 24, 'Tout l’empire n’est plus la dépouille d’un maître. Le peuple au champ de Mars nomme ses magistrats ; César nomme les chefs sur la foi des soldats ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 25, 'Thraséas au sénat, Corbulon dans l’armée, Sont encore innocents, malgré leur renommée ; Les déserts, autrefois peuplés de sénateurs, Ne sont plus habités que par leurs délateurs.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 26, 'Qu’importe que César continue à nous croire, Pourvu que nos conseils ne tendent qu’à sa gloire ; Pourvu que dans le cours d’un règne florissant Rome soit toujours libre, et César tout-puissant ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 27, 'Mais, madame, Néron suffit pour se conduire. J’obéis, sans prétendre à l’honneur de l’instruire. Sur ses aïeux, sans doute, il n’a qu’à se régler ; Pour bien faire, Néron n’a qu’à se ressembler.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 28, 'Heureux si ses vertus, l’une à l’autre enchaînées, Ramènent tous les ans ses premières années !'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 29, 'Ainsi, sur l’avenir n’osant vous assurer, Vous croyez que sans vous Néron va s’égarer.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 30, 'Mais vous qui, jusqu’ici content de votre ouvrage, Venez de ses vertus nous rendre témoignage, Expliquez-nous pourquoi, devenu ravisseur, Néron de Silanus fait enlever la sœur ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 31, 'Ne tient-il qu’à marquer de cette ignominie Le sang de mes aïeux qui brille dans Junie ? De quoi l’accuse-t-il ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 32, 'Et par quel attentat Devient-elle en un jour criminelle d’État : Elle qui, sans orgueil jusqu’alors élevée, N’aurait point vu Néron, s’il ne l’eût enlevée ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 33, 'Et qui même aurait mis au rang de ses bienfaits L’heureuse liberté de ne le voir jamais ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 34, 'Je sais que d’aucun crime elle n’est soupçonnée ; Mais jusqu’ici César ne l’a point condamnée, Madame. Aucun objet ne blesse ici ses yeux : Elle est dans un palais tout plein de ses aïeux.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 35, 'Vous savez que les droits qu’elle porte avec elle Peuvent de son époux faire un prince rebelle : Que le sang de César ne se doit allier Qu’à ceux à qui César le veut bien confier ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 36, 'Et vous-même avoûrez qu’il ne serait pas juste Qu’on disposât sans lui de la nièce d’Auguste.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 37, 'Je vous entends : Néron m’apprend par votre voix Qu’en vain Britannicus s’assure sur mon choix.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 38, 'En vain, pour détourner ses yeux de sa misère, J’ai flatté son amour d’un hymen qu’il espère : À ma confusion, Néron veut faire voir Qu’Agrippine promet par delà son pouvoir.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 39, 'Rome de ma faveur est trop préoccupée : Il veut par cet affront qu’elle soit détrompée, Et que tout l’univers apprenne avec terreur À ne confondre plus mon fils et l’empereur. Il le peut.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 40, 'Toutefois j’ose encore lui dire Qu’il doit avant ce coup affermir son empire ; Et qu’en me réduisant à la nécessité D’éprouver contre lui ma faible autorité, Il expose la sienne ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 41, 'et que dans la balance Mon nom peut-être aura plus de poids qu’il ne pense.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 42, 'Quoi ! madame, toujours soupçonner son respect ! Ne peut-il faire un pas qui ne vous soit suspect ? L’empereur vous croit-il du parti de Junie ? Avec Britannicus vous croit-il réunie ? Quoi !'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 43, 'de vos ennemis devenez-vous l’appui Pour trouver un prétexte à vous plaindre de lui ? Sur le moindre discours qu’on pourra vous redire Serez-vous toujours prête à partager l’empire ? Vous craindrez-vous sans cesse ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 44, 'et vos embrassements Ne se passeront-ils qu’en éclaircissements ? Ah ! quittez d’un censeur la triste diligence ; D’une mère facile affectez l’indulgence ; Souffrez quelques froideurs sans les faire éclater ;'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 45, 'Et n’avertissez point la cour de vous quitter.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', '2aee8031-9fe0-4e44-bd11-74bfed9c48fd', 46, 'Et qui s’honorerait de l’appui d’Agrippine, Lorsque Néron lui-même annonce ma ruine, Lorsque de sa présence il semble me bannir, Quand Burrhus à sa porte ose me retenir ?'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 47, 'Madame, je vois bien qu’il est temps de me taire, Et que ma liberté commence à vous déplaire. La douleur est injuste : et toutes les raisons Qui ne la flattent point aigrissent ses soupçons. Voici Britannicus.'),
  ('69c34e9d-0dc6-4d71-afe1-7c98ffd5c3f4', 'cb6ab6e1-e0ce-426a-a816-1a8ad673dd7b', 48, 'Je lui cède ma place. Je vous laisse écouter et plaindre sa disgrâce. Et peut-être, madame, en accuser les soins De ceux que l’empereur a consultés le moins.');

-- Acte I, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte I, Scène III', 'Acte I', 'acte-i-scene-iii-3', false);
insert into characters (id, scene_id, name) values ('ea480cf1-4d34-4e19-a35d-678ebba600fb', 'ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('722faece-e1c3-4433-96ca-ae581cb99386', 'ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', 'BRITANNICUS');
insert into lines (scene_id, character_id, "order", text) values
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', 'ea480cf1-4d34-4e19-a35d-678ebba600fb', 1, 'Ah ! prince, où courez-vous ? Quelle ardeur inquiète Parmi vos ennemis en aveugle vous jette ? Que venez-vous chercher ?'),
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', '722faece-e1c3-4433-96ca-ae581cb99386', 2, 'Que venez-vous chercher ? Ce que je cherche ? Ah ! dieux ! Tout ce que j’ai perdu, madame, est en ces lieux. De mille affreux soldats Junie environnée S’est vue en ce palais indignement traînée. Hélas !'),
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', '722faece-e1c3-4433-96ca-ae581cb99386', 3, 'de quelle horreur ses timides esprits À ce nouveau spectacle auront été surpris ? Enfin on me l’enlève.'),
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', '722faece-e1c3-4433-96ca-ae581cb99386', 4, 'Une loi trop sévère Va séparer deux cœurs qu’assemblait leur misère : Sans doute on ne veut pas que, mêlant nos douleurs, Nous nous aidions l’un l’autre à porter nos malheurs.'),
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', 'ea480cf1-4d34-4e19-a35d-678ebba600fb', 5, 'Il suffit. Comme vous je ressens vos injures ; Mes plaintes ont déjà précédé vos murmures. Mais je ne prétends pas qu’un impuissant courroux Dégage ma parole et m’acquitte envers vous. Je ne m’explique point.'),
  ('ab50a7aa-a9f0-46c6-91c3-39fcfcd7e7a2', 'ea480cf1-4d34-4e19-a35d-678ebba600fb', 6, 'Si vous voulez m’entendre, Suivez-moi chez Pallas, où je vais vous attendre.');

-- Acte I, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte I, Scène IV', 'Acte I', 'acte-i-scene-iv-6', false);
insert into characters (id, scene_id, name) values ('c38ca7e7-f268-477c-a69d-4d05214a432b', '421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('1b0715d3-aa8d-4270-9c31-8df4a8f55f0e', '421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'NARCISSE');
insert into lines (scene_id, character_id, "order", text) values
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 1, 'La croirai-je, Narcisse ? et dois-je sur sa foi La prendre pour arbitre entre son fils et moi ? Qu’en dis-tu ?'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 2, 'N’est-ce pas cette même Agrippine Que mon père épousa jadis pour ma ruine, Et qui, si je t’en crois, a de ses derniers jours, Trop lents pour ses desseins, précipité le cours ?'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', '1b0715d3-aa8d-4270-9c31-8df4a8f55f0e', 3, 'N’importe. Elle se sent comme vous outragée ;'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', '1b0715d3-aa8d-4270-9c31-8df4a8f55f0e', 4, 'À vous donner Junie elle s’est engagée : Unissez vos chagrins, liez vos intérêts : Ce palais retentit en vain de vos regrets : Tandis qu’on vous verra d’une voix suppliante Semer ici la plainte et non pas l’épouvante, Que vos ressentiments se perdront en discours, Il n’en faut pas douter, vous vous plaindrez toujours.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 5, 'Ah, Narcisse ! tu sais si de la servitude Je prétends faire encore une longue habitude ; Tu sais si pour jamais, de ma chute étonné, Je renonce à l’empire où j’étais destiné.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 6, 'Mais je suis seul encor : les amis de mon père Sont autant d’inconnus que glace ma misère, Et ma jeunesse même écarte loin de moi Tous ceux qui dans le cœur me réservent leur foi.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 7, 'Pour moi, depuis un an qu’un peu d’expérience M’a donné de mon sort la triste connaissance, Que vois-je autour de moi, que des amis vendus Qui sont de tous mes pas les témoins assidus, Qui, choisis par Néron pour ce commerce infâme, Trafiquent avec lui des secrets de mon âme ?'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 8, 'Quoi qu’il en soit, Narcisse, on me vend tous les jours : Il prévoit mes desseins, il entend mes discours : Comme toi, dans mon cœur il sait ce qui se passe. Que t’en semble, Narcisse ?'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', '1b0715d3-aa8d-4270-9c31-8df4a8f55f0e', 9, 'Que t’en semble, Narcisse ? Ah ! quelle âme assez basse… C’est à vous de choisir des confidents discrets, Seigneur, et de ne pas prodiguer vos secrets.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 10, 'Narcisse, tu dis vrai ; mais cette défiance Est toujours d’un grand cœur la dernière science ; On le trompe longtemps. Mais enfin je te croi, Ou plutôt je fais vœu de ne croire que toi.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 11, 'Mon père, il m’en souvient, m’assura de ton zèle : Seul de ses affranchis tu m’es toujours fidèle ; Tes yeux, sur ma conduite incessamment ouverts, M’ont sauvé jusqu’ici de mille écueils couverts.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 12, 'Va donc voir si le bruit de ce nouvel orage Aura de nos amis excité le courage ; Examine leurs yeux, observe leurs discours ; Vois si j’en puis attendre un fidèle secours.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 13, 'Surtout dans ce palais remarque avec adresse Avec quel soin Néron fait garder la princesse : Sache si du péril ses beaux yeux sont remis, Et si son entretien m’est encore permis.'),
  ('421f55b4-c2b1-4b6f-9018-4fdec6ee6923', 'c38ca7e7-f268-477c-a69d-4d05214a432b', 14, 'Cependant de Néron je vais trouver la mère Chez Pallas, comme toi l’affranchi de mon père : Je vais la voir, l’aigrir, la suivre, et s’il se peut, M’engager sous son nom plus loin qu’elle ne veut.');

-- Acte II, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène II', 'Acte II', 'acte-ii-scene-ii-4', false);
insert into characters (id, scene_id, name) values ('47f623ec-b84b-4758-9988-3f951be58586', 'd7360c98-c343-4695-9709-5b7b74f0a2fa', 'NARCISSE');
insert into characters (id, scene_id, name) values ('cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 'd7360c98-c343-4695-9709-5b7b74f0a2fa', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 1, 'Grâces aux dieux, seigneur, Junie entre vos mains Vous assure aujourd’hui du reste des Romains. Vos ennemis, déchus de leur vaine espérance, Sont allés chez Pallas pleurer leur impuissance. Mais que vois-je ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 2, 'Vous-même, inquiet, étonné, Plus que Britannicus paraissez consterné. Que présage à mes yeux cette tristesse obscure, Et ces sombres regards errants à l’aventure ? Tout vous rit : la fortune obéit à vos vœux.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 3, 'Narcisse, c’en est fait, Néron est amoureux.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 4, 'Vous !'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 5, 'Vous ! Depuis un moment, mais pour toute ma vie. J’aime, que dis-je, aimer ? j’idolâtre Junie.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 6, 'Vous l’aimez !'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 7, 'Vous l’aimez ! Excité d’un désir curieux, Cette nuit je l’ai vue arriver en ces lieux, Triste, levant au ciel ses yeux mouillés de larmes, Qui brillaient au travers des flambeaux et des armes ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 8, 'Belle sans ornement, dans le simple appareil D’une beauté qu’on vient d’arracher au sommeil. Que veux-tu ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 9, 'Je ne sais si cette négligence, Les ombres, les flambeaux, les cris et le silence, Et le farouche aspect de ses fiers ravisseurs, Relevaient de ses yeux les timides douceurs.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 10, 'Quoi qu’il en soit, ravi d’une si belle vue, J’ai voulu lui parler, et ma voix s’est perdue : Immobile, saisi d’un long étonnement, Je l’ai laissé passer dans son appartement. J’ai passé dans le mien.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 11, 'C’est là que, solitaire, De son image en vain j’ai voulu me distraire. Trop présente à mes yeux je croyais lui parler ; J’aimais jusqu’à ses pleurs que je faisais couler.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 12, 'Quelquefois, mais trop tard, je lui demandais grâce : J’employais les soupirs, et même la menace. Voilà comme, occupé de mon nouvel amour, Mes yeux, sans se fermer, ont attendu le jour.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 13, 'Mais je m’en fais peut-être une trop belle image : Elle m’est apparue avec trop d’avantage : Narcisse, qu’en dis-tu ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 14, 'Narcisse, qu’en dis-tu ? Quoi, seigneur ! croira-t-on Qu’elle ait pu si longtemps se cacher à Néron ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 15, 'Tu le sais bien, Narcisse. Et soit que sa colère M’imputât le malheur qui lui ravit son frère ; Soit que son cœur, jaloux d’une austère fierté, Enviât à nos yeux sa naissante beauté ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 16, 'Fidèle à sa douleur, et dans l’ombre enfermée, Elle se dérobait même à sa renommée : Et c’est cette vertu, si nouvelle à la cour, Dont la persévérance irrite mon amour. Quoi !'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 17, 'Narcisse, tandis qu’il n’est point de Romaine Que mon amour n’honore et ne rende plus vaine, Qui, dès qu’à ses regards elle ose se fier, Sur le cœur de César ne les vienne essayer ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 18, 'Seule, dans son palais, la modeste Junie Regarde leurs honneurs comme une ignominie ; Fuit, et ne daigne pas peut-être s’informer Si César est aimable, ou bien s’il sait aimer ! Dis-moi : Britannicus l’aime-t-il ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 19, 'Dis-moi : Britannicus l’aime-t-il ? Quoi ! s’il l’aime, Seigneur ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 20, 'Seigneur ? Si jeune encor, se connaît-il lui même ? D’un regard enchanteur connaît-il le poison ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 21, 'Seigneur, l’amour toujours n’attend pas la raison. N’en doutez point, il l’aime. Instruits par tant de charmes, Ses yeux sont déjà faits à l’usage des larmes ; À ses moindres désirs il sait s’accommoder ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 22, 'Et peut-être déjà sait-il persuader.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 23, 'Que dis-tu ? Sur son cœur il aurait quelque empire ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 24, 'Je ne sais.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 25, 'Mais, seigneur, ce que je puis vous dire, Je l’ai vu quelquefois s’arracher de ces lieux, Le cœur plein d’un courroux qu’il cachait à vos yeux, D’une cour qui le fuit pleurant l’ingratitude, Las de votre grandeur et de sa servitude, Entre l’impatience et la crainte flottant, Il allait voir Junie, et revenait content.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 26, 'D’autant plus malheureux qu’il aura su lui plaire, Narcisse, il doit plutôt souhaiter sa colère : Néron impunément ne sera pas jaloux.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 27, 'Vous ? Et de quoi, seigneur, vous inquiétez-vous ? Junie a pu le plaindre et partager ses peines : Elle n’a vu couler de larmes que les siennes ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 28, 'Mais aujourd’hui, seigneur, que ses yeux dessillés, Regardant de plus près l’éclat dont vous brillez, Verront autour de vous les rois sans diadème, Inconnus dans la foule, et son amant lui-même, Attachés sur vos yeux, s’honorer d’un regard Que vous aurez sur eux fait tomber au hasard ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 29, 'Quand elle vous verra, de ce degré de gloire, Venir en soupirant avouer sa victoire ; Maître, n’en doutez point, d’un cœur déjà charmé, Commandez qu’on vous aime, et vous serez aimé.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 30, 'À combien de chagrins il faut que je m’apprête ! Que d’importunités !'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 31, 'Que d’importunités ! Quoi donc ! qui vous arrête, Seigneur ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 32, 'Seigneur ? Tout : Octavie, Agrippine, Burrhus, Sénèque, Rome entière, et trois ans de vertus. Non que pour Octavie un reste de tendresse M’attache à son hymen et plaigne sa jeunesse ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 33, 'Mes yeux, depuis longtemps fatigués de ses soins, Rarement de ses pleurs daignent être témoins. Trop heureux, si bientôt la faveur d’un divorce Me soulageait d’un joug qu’on m’imposa par force !'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 34, 'Le ciel même en secret semble la condamner : Ses vœux, depuis quatre ans, ont beau l’importuner ; Les dieux ne montrent point que sa vertu les touche : D’aucun gage, Narcisse, ils n’honorent sa couche ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 35, 'L’empire vainement demande un héritier.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 36, 'Que tardez-vous, seigneur, à la répudier ? L’empire, votre cœur, tout condamne Octavie. Auguste, votre aïeul, soupirait pour Livie ; Par un double divorce ils s’unirent tous deux ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 37, 'Et vous devez l’empire à ce divorce heureux. Tibère, que l’hymen plaça dans sa famille, Osa bien à ses yeux répudier sa fille. Vous seul, jusques ici, contraire à vos désirs, N’osez par un divorce assurer vos plaisirs.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 38, 'Et ne connais-tu pas l’implacable Agrippine ? Mon amour inquiet déjà se l’imagine Qui m’amène Octavie, et d’un œil enflammé Atteste les saints droits d’un nœud qu’elle a formé ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 39, 'Et, portant à mon cœur des atteintes plus rudes, Me fait un long récit de mes ingratitudes. De quel front soutenir ce fâcheux entretien ?'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 40, 'N’êtes-vous pas, seigneur, votre maître et le sien ? Vous verrons-nous toujours trembler sous sa tutelle ? Vivez, régnez pour vous : c’est trop régner pour elle. Craignez-vous ? Mais, seigneur, vous ne la craignez pas ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 41, 'Vous venez de bannir le superbe Pallas, Pallas, dont vous savez qu’elle soutient l’audace.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 42, 'Éloigné de ses yeux, j’ordonne, je menace, J’écoute vos conseils, j’ose les approuver ; Je m’excite contre elle, et tâche à la braver ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 43, 'Mais, je t’expose ici mon âme toute nue, Sitôt que mon malheur me ramène à sa vue, Soit que je n’ose encor démentir le pouvoir De ces yeux où j’ai lu si longtemps mon devoir ;'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 44, 'Soit qu’à tant de bienfaits ma mémoire fidèle Lui soumette en secret tout ce que je tiens d’elle ; Mais enfin mes efforts ne me servent de rien : Mon génie étonné tremble devant le sien.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 45, 'Et c’est pour m’affranchir de cette dépendance, Que je la fuis partout, que même je l’offense, Et que, de temps en temps, j’irrite ses ennuis, Afin qu’elle m’évite autant que je la fuis.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 46, 'Mais je t’arrête trop : retire-toi, Narcisse ; Britannicus pourrait t’accuser d’artifice.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 47, 'Non, non ; Britannicus s’abandonne à ma foi : Par son ordre, seigneur, il croit que je vous voi, Que je m’informe ici de tout ce qui le touche, Et veut de vos secrets être instruit par ma bouche.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 48, 'Impatient, surtout, de revoir ses amours, Il attend de mes soins ce fidèle secours.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 49, 'J’y consens ; porte-lui cette douce nouvelle : Il la verra.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', '47f623ec-b84b-4758-9988-3f951be58586', 50, 'Il la verra. Seigneur, bannissez-le loin d’elle.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 51, 'J’ai mes raisons, Narcisse ; et tu peux concevoir Que je lui vendrai cher le plaisir de la voir. Cependant vante-lui ton heureux stratagème ; Dis-lui qu’en sa faveur on me trompe moi-même, Qu’il la voit sans mon ordre.'),
  ('d7360c98-c343-4695-9709-5b7b74f0a2fa', 'cc1865b4-fb19-40e4-80e6-a0b8de7bbac2', 52, 'On ouvre ; la voici. Va retrouver ton maître, et l’amener ici.');

-- Acte II, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('b697679e-043a-4589-8c3c-dc3456133b48', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène III', 'Acte II', 'acte-ii-scene-iii-2', false);
insert into characters (id, scene_id, name) values ('bbfd57e7-fa29-40de-a90a-39714bc09cf0', 'b697679e-043a-4589-8c3c-dc3456133b48', 'NÉRON');
insert into characters (id, scene_id, name) values ('ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 'b697679e-043a-4589-8c3c-dc3456133b48', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 1, 'Vous vous troublez, madame, et changez de visage ! Lisez-vous dans mes yeux quelque triste présage ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 2, 'Seigneur, je ne vous puis déguiser mon erreur ; J’allais voir Octavie, et non pas l’empereur.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 3, 'Je le sais bien, madame, et n’ai pu sans envie Apprendre vos bontés pour l’heureuse Octavie.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 4, 'Vous, seigneur ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 5, 'Vous, seigneur ? Pensez-vous, madame, qu’en ces lieux Seule pour vous connaître, Octavie ait des yeux ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 6, 'Et quel autre, seigneur, voulez-vous que j’implore ? À qui demanderais-je un crime que j’ignore ? Vous qui le punissez, vous ne l’ignorez pas : De grâce, apprenez-moi, seigneur, mes attentats.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 7, 'Quoi ! madame, est-ce donc une légère offense De m’avoir si longtemps caché votre présence ? Ces trésors dont le ciel voulut vous embellir, Les avez-vous reçus pour les ensevelir ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 8, 'L’heureux Britannicus verra-t-il sans alarmes Croître, loin de nos yeux, son amour et vos charmes ? Pourquoi, de cette gloire exclu jusqu’à ce jour, M’avez-vous, sans pitié, relégué dans ma cour ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 9, 'On dit plus : vous souffrez, sans en être offensée, Qu’il vous ose, madame, expliquer sa pensée, Car je ne croirai point que sans me consulter La sévère Junie ait voulu le flatter ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 10, 'Ni qu’elle ait consenti d’aimer et d’être aimée, Sans que j’en sois instruit que par la renommée.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 11, 'Je ne vous nîrai point, seigneur, que ses soupirs M’ont daigné quelquefois expliquer ses désirs.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 12, 'Il n’a point détourné ses regards d’une fille Seul reste du débris d’une illustre famille : Peut-être il se souvient qu’en un temps plus heureux Son père me nomma pour l’objet de ses vœux. Il m’aime ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 13, 'il obéit à l’empereur son père, Et j’ose dire encore, à vous, à votre mère : Vos désirs sont toujours si conformes aux siens…'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 14, 'Ma mère a ses desseins, madame ; et j’ai les miens. Ne parlons plus ici de Claude et d’Agrippine ; Ce n’est point par leur choix que je me détermine. C’est à moi seul, madame, à répondre de vous ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 15, 'Et je veux de ma main vous choisir un époux.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 16, 'Ah, seigneur ! songez-vous que toute autre alliance Fera honte aux Césars, auteurs de ma naissance ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 17, 'Non, madame, l’époux dont je vous entretiens Peut, sans honte, assembler vos aïeux et les siens ; Vous pouvez, sans rougir, consentir à sa flamme.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 18, 'Et quel est donc, seigneur, cet époux ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 19, 'Et quel est donc, seigneur, cet époux ? Moi, madame.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 20, 'Vous !'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 21, 'Vous ! Je vous nommerais, madame, un autre nom, Si j’en savais quelque autre au-dessus de Néron. Oui, pour vous faire un choix où vous puissiez souscrire, J’ai parcouru des yeux la cour, Rome, et l’empire.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 22, 'Plus j’ai cherché, madame, et plus je cherche encor En quelles mains je dois confier ce trésor ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 23, 'Plus je vois que César, digne seul de vous plaire, En doit être lui seul l’heureux dépositaire, Et ne peut dignement vous confier qu’aux mains À qui Rome a commis l’empire des humains.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 24, 'Vous-même, consultez vos premières années ; Claudius à son fils les avait destinées ; Mais c’était en un temps où de l’empire entier Il croyait quelque jour le nommer l’héritier. Les dieux ont prononcé.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 25, 'Loin de leur contredire, C’est à vous de passer du côté de l’empire. En vain de ce présent ils m’auraient honoré, Si votre cœur devait en être séparé ; Si tant de soins ne sont adoucis par vos charmes ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 26, 'Si, tandis que je donne aux veilles, aux alarmes, Des jours toujours à plaindre et toujours enviés, Je ne vais quelquefois respirer à vos pieds.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 27, 'Qu’Octavie à vos yeux ne fasse point d’ombrage : Rome, aussi bien que moi, vous donne son suffrage, Répudie Octavie, et me fait dénouer Un hymen que le ciel ne veut point avouer.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 28, 'Songez-y donc, madame, et pesez en vous-même Ce choix digne des soins d’un prince qui vous aime, Digne de vos beaux yeux trop longtemps captivés, Digne de l’univers à qui vous vous devez.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 29, 'Seigneur, avec raison je demeure étonnée. Je me vois, dans le cours d’une même journée, Comme une criminelle amenée en ces lieux ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 30, 'Et lorsque avec frayeur je parais à vos yeux, Que sur mon innocence à peine je me fie, Vous m’offrez tout d’un coup la place d’Octavie. J’ose dire pourtant que je n’ai mérité Ni cet excès d’honneur, ni cette indignité.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 31, 'Et pouvez-vous, seigneur, souhaiter qu’une fille Qui vit presque en naissant éteindre sa famille ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 32, 'Qui, dans l’obscurité nourrissant sa douleur, S’est fait une vertu conforme à son malheur, Passe subitement de cette nuit profonde Dans un rang qui l’expose aux yeux de tout le monde, Dont je n’ai pu de loin soutenir la clarté, Et dont une autre enfin remplit la majesté ?'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 33, 'Je vous ai déjà dit que je la répudie : Ayez moins de frayeur, ou moins de modestie. N’accusez point ici mon choix d’aveuglement ; Je vous réponds de vous ; consentez seulement.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 34, 'Du sang dont vous sortez rappelez la mémoire ; Et ne préférez point à la solide gloire Des honneurs dont César prétend vous revêtir, La gloire d’un refus sujet au repentir.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 35, 'Le ciel connaît, seigneur, le fond de ma pensée. Je ne me flatte point d’une gloire insensée : Je sais de vos présents mesurer la grandeur ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 36, 'Mais plus ce rang sur moi répandrait de splendeur, Plus il me ferait honte, et mettrait en lumière Le crime d’en avoir dépouillé l''héritière.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 37, 'C’est de ses intérêts prendre beaucoup de soin, Madame ; et l’amitié ne peut aller plus loin. Mais ne nous flattons point, et laissons le mystère : La sœur vous touche ici beaucoup moins que le frère ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 38, 'Et pour Britannicus…'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 39, 'Et pour Britannicus… Il a su me toucher, Seigneur ; et je n’ai point prétendu m’en cacher. Cette sincérité, sans doute, est peu discrète ; Mais toujours de mon cœur ma bouche est l’interprète.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 40, 'Absente de la cour, je n’ai pas dû penser, Seigneur, qu’en l’art de feindre il fallût m’exercer. J’aime Britannicus.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 41, 'Je lui fus destinée Quand l’empire devait suivre son hyménée : Mais ces mêmes malheurs qui l’en ont écarté, Ses honneurs abolis, son palais déserté, La fuite d’une cour que sa chute a bannie, Sont autant de liens qui retiennent Junie.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 42, 'Tout ce que vous voyez conspire à vos désirs ; Vos jours toujours sereins coulent dans les plaisirs ; L’empire en est pour vous l’inépuisable source ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 43, 'Ou, si quelque chagrin en interrompt la course, Tout l’univers, soigneux de les entretenir, S’empresse à l’effacer de votre souvenir. Britannicus est seul.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 44, 'Quelque ennui qui le presse, Il ne voit, dans son sort, que moi qui s’intéresse, Et n’a, pour tous plaisirs, seigneur, que quelques pleurs Qui lui font quelquefois oublier ses malheurs.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 45, 'Et ce sont ces plaisirs et ces pleurs que j’envie, Que tout autre que lui me paîrait de sa vie. Mais je garde à ce prince un traitement plus doux : Madame, il va bientôt paraître devant vous.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 46, 'Ah, seigneur ! vos vertus m’ont toujours rassurée.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 47, 'Je pouvais de ces lieux lui défendre l’entrée ; Mais, madame, je veux prévenir le danger Où son ressentiment le pourrait engager.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 48, 'Je ne veux point le perdre : il vaut mieux que lui-même Entende son arrêt de la bouche qu’il aime. Si ses jours vous sont chers, éloignez-le de vous Sans qu’il ait aucun lieu de me croire jaloux.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 49, 'De son bannissement prenez sur vous l’offense ; Et, soit par vos discours, soit par votre silence, Du moins par vos froideurs, faites-lui concevoir Qu’il doit porter ailleurs ses vœux et son espoir.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 50, 'Moi ! que je lui prononce un arrêt si sévère ! Ma bouche mille fois lui jura le contraire. Quand même jusque-là je pourrais me trahir, Mes yeux lui défendront, seigneur, de m’obéir.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 51, 'Caché près de ces lieux, je vous verrai, madame. Renfermez votre amour dans le fond de votre âme : Vous n’aurez point pour moi de langages secrets, J’entendrai des regards que vous croirez muets ;'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'bbfd57e7-fa29-40de-a90a-39714bc09cf0', 52, 'Et sa perte sera l’infaillible salaire D’un geste ou d’un soupir échappé pour lui plaire.'),
  ('b697679e-043a-4589-8c3c-dc3456133b48', 'ab70ad16-7386-4fca-95dd-ce8ad6b537ec', 53, 'Hélas ! si j’ose encor former quelques souhaits, Seigneur, permettez-moi de ne le voir jamais !');

-- Acte II, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('d623e8c7-0da3-470a-8813-c77108b07fbc', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène IV', 'Acte II', 'acte-ii-scene-iv-3', false);
insert into characters (id, scene_id, name) values ('85a737de-61ca-4d8a-9821-1b282eac8bc8', 'd623e8c7-0da3-470a-8813-c77108b07fbc', 'NARCISSE');
insert into characters (id, scene_id, name) values ('63df2b61-07d6-4376-93e6-707f37c2bd8a', 'd623e8c7-0da3-470a-8813-c77108b07fbc', 'NÉRON');
insert into characters (id, scene_id, name) values ('65f59923-2da4-4744-92d1-04892c67b001', 'd623e8c7-0da3-470a-8813-c77108b07fbc', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('d623e8c7-0da3-470a-8813-c77108b07fbc', '85a737de-61ca-4d8a-9821-1b282eac8bc8', 1, 'Britannicus, seigneur, demande la princesse ; Il approche.'),
  ('d623e8c7-0da3-470a-8813-c77108b07fbc', '63df2b61-07d6-4376-93e6-707f37c2bd8a', 2, 'Il approche. Qu’il vienne.'),
  ('d623e8c7-0da3-470a-8813-c77108b07fbc', '65f59923-2da4-4744-92d1-04892c67b001', 3, 'Il approche. Qu’il vienne. Ah ! seigneur !'),
  ('d623e8c7-0da3-470a-8813-c77108b07fbc', '63df2b61-07d6-4376-93e6-707f37c2bd8a', 4, 'Il approche. Qu’il vienne. Ah ! seigneur ! Je vous laisse. Sa fortune dépend de vous plus que de moi : Madame, en le voyant, songez que je vous voi.');

-- Acte II, Scène VI
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène VI', 'Acte II', 'acte-ii-scene-vi-5', false);
insert into characters (id, scene_id, name) values ('35e20bbb-7f4f-4d14-b7af-0665e0705d19', '2d0b9158-9f5d-4c82-8b52-9413de3314cb', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('9b28a59d-a714-4dda-ad2c-358b6b0ff588', '2d0b9158-9f5d-4c82-8b52-9413de3314cb', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 1, 'Madame, quel bonheur me rapproche de vous ? Quoi ! je puis donc jouir d’un entretien si doux ! Mais parmi ce plaisir quel chagrin me dévore ! Hélas ! puis-je espérer de vous revoir encore ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 2, 'Faut-il que je dérobe, avec mille détours, Un bonheur que vos yeux m’accordaient tous les jours ? Quelle nuit ! Quel réveil ! Vos pleurs, votre présence, N’ont point de ces cruels désarmé l’insolence !'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 3, 'Que faisait votre amant ? Quel démon envieux M’a refusé l’honneur de mourir à vos yeux ? Hélas ! dans la frayeur dont vous étiez atteinte, M’avez-vous, en secret, adressé quelque plainte ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 4, 'Ma princesse, avez-vous daigné me souhaiter ? Songiez-vous aux douleurs que vous m’alliez coûter ? Vous ne me dites rien ! Quel accueil ! Quelle glace ! Est-ce ainsi que vos yeux consolent ma disgrâce ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 5, 'Parlez : nous sommes seuls. Notre ennemi, trompé, Tandis que je vous parle, est ailleurs occupé. Ménageons les moments de cette heureuse absence.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '9b28a59d-a714-4dda-ad2c-358b6b0ff588', 6, 'Vous êtes en des lieux tout pleins de sa puissance : Ces murs mêmes, seigneur, peuvent avoir des yeux ; Et jamais l’empereur n’est absent de ces lieux.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 7, 'Et depuis quand, madame, êtes-vous si craintive ? Quoi ! déjà votre amour souffre qu’on le captive ? Qu’est devenu ce cœur qui me jurait toujours De faire à Néron même envier nos amours ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 8, 'Mais bannissez, madame, une inutile crainte : La foi dans tous les cœurs n’est pas encore éteinte ; Chacun semble des yeux approuver mon courroux ; La mère de Néron se déclare pour nous.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 9, 'Rome, de sa conduite elle-même offensée…'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '9b28a59d-a714-4dda-ad2c-358b6b0ff588', 10, 'Ah ! seigneur ! vous parlez contre votre pensée. Vous-même vous m’avez avoué mille fois Que Rome le louait d’une commune voix ; Toujours à sa vertu vous rendiez quelque hommage ;'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '9b28a59d-a714-4dda-ad2c-358b6b0ff588', 11, 'Sans doute la douleur vous dicte ce langage.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 12, 'Ce discours me surprend, il le faut avouer : Je ne vous cherchais pas pour l’entendre louer. Quoi ! pour vous confier la douleur qui m’accable, À peine je dérobe un moment favorable ;'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 13, 'Et ce moment si cher, madame, est consumé À louer l’ennemi dont je suis opprimé ! Qui vous rend à vous-même, en un jour, si contraire ? Quoi ! même vos regards ont appris à se taire ? Que vois-je ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 14, 'Vous craignez de rencontrer mes yeux ! Néron vous plairait-il ? Vous serais-je odieux ? Oh ! si je le croyais… Au nom des dieux, madame, Éclaircissez le trouble où vous jetez mon âme. Parlez.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 15, 'Ne suis-je plus dans votre souvenir ?'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '9b28a59d-a714-4dda-ad2c-358b6b0ff588', 16, 'Retirez-vous, seigneur ; l’empereur va venir.'),
  ('2d0b9158-9f5d-4c82-8b52-9413de3314cb', '35e20bbb-7f4f-4d14-b7af-0665e0705d19', 17, 'Après ce coup, Narcisse, à qui dois-je m’attendre ?');

-- Acte II, Scène VII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('a5ea5cb6-a8a9-4464-bbda-d36dc74334f3', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène VII', 'Acte II', 'acte-ii-scene-vii-5', false);
insert into characters (id, scene_id, name) values ('2c08e08a-4d3d-4ea9-a41e-27bc5fcbdc89', 'a5ea5cb6-a8a9-4464-bbda-d36dc74334f3', 'NÉRON');
insert into characters (id, scene_id, name) values ('da0e4699-fcf6-42f9-84d2-4d99bcc7ea48', 'a5ea5cb6-a8a9-4464-bbda-d36dc74334f3', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('a5ea5cb6-a8a9-4464-bbda-d36dc74334f3', '2c08e08a-4d3d-4ea9-a41e-27bc5fcbdc89', 1, 'Madame…'),
  ('a5ea5cb6-a8a9-4464-bbda-d36dc74334f3', 'da0e4699-fcf6-42f9-84d2-4d99bcc7ea48', 2, 'Madame… Non, seigneur, je ne puis rien entendre. Vous êtes obéi. Laissez couler du moins Des larmes dont ses yeux ne seront pas témoins.');

-- Acte II, Scène VIII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('2ac57d7d-8058-473b-b3d9-20cc2729e6c3', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte II, Scène VIII', 'Acte II', 'acte-ii-scene-viii-4', false);
insert into characters (id, scene_id, name) values ('411c28bd-eef7-44db-a4a4-fcce5a05ade6', '2ac57d7d-8058-473b-b3d9-20cc2729e6c3', 'NÉRON');
insert into characters (id, scene_id, name) values ('ab0a5608-b675-4da6-b754-34c8323e2fc1', '2ac57d7d-8058-473b-b3d9-20cc2729e6c3', 'NARCISSE');
insert into lines (scene_id, character_id, "order", text) values
  ('2ac57d7d-8058-473b-b3d9-20cc2729e6c3', '411c28bd-eef7-44db-a4a4-fcce5a05ade6', 1, 'Eh bien ! de leur amour tu vois la violence, Narcisse : elle a paru jusque dans son silence ! Elle aime mon rival, je ne puis l’ignorer ; Mais je mettrai ma joie à le désespérer.'),
  ('2ac57d7d-8058-473b-b3d9-20cc2729e6c3', '411c28bd-eef7-44db-a4a4-fcce5a05ade6', 2, 'Je me fais de sa peine une image charmante ; Et je l’ai vu douter du cœur de son amante. Je la suis. Mon rival t’attend pour éclater : Par de nouveaux soupçons, va, cours le tourmenter ;'),
  ('2ac57d7d-8058-473b-b3d9-20cc2729e6c3', '411c28bd-eef7-44db-a4a4-fcce5a05ade6', 3, 'Et tandis qu’à mes yeux on le pleure, on l’adore, Fais-lui payer bien cher un bonheur qu’il ignore.'),
  ('2ac57d7d-8058-473b-b3d9-20cc2729e6c3', 'ab0a5608-b675-4da6-b754-34c8323e2fc1', 4, 'La fortune t’appelle une seconde fois, Narcisse : voudrais-tu résister à sa voix ? Suivons jusques au bout ses ordres favorables ; Et, pour nous rendre heureux, perdons les misérables.');

-- Acte III, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène première', 'Acte III', 'acte-iii-scene-premiere-2', false);
insert into characters (id, scene_id, name) values ('daa7165a-e415-4932-9dda-14c18cf5add5', 'a59bea5b-46cd-4901-8497-7c23da6d6f31', 'BURRHUS');
insert into characters (id, scene_id, name) values ('3f7b75e0-2075-4b1a-b048-6475ae9ec971', 'a59bea5b-46cd-4901-8497-7c23da6d6f31', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 1, 'Pallas obéira, seigneur.'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 2, 'Pallas obéira, seigneur. Et de quel œil Ma mère a-t-elle vu confondre son orgueil ?'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 3, 'Ne doutez point, seigneur, que ce coup ne la frappe ; Qu’en reproches bientôt sa douleur ne s’échappe. Ses transports dès longtemps commencent d’éclater. À d’inutiles cris puissent-ils s’arrêter !'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 4, 'Quoi ! de quelque dessein la croyez-vous capable ?'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 5, 'Agrippine, seigneur, est toujours redoutable : Rome et tous vos soldats révèrent ses aïeux ; Germanicus son père est présent à leurs yeux. Elle sait son pouvoir ; vous savez son courage ;'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 6, 'Et ce qui me la fait redouter davantage, C’est que vous appuyez vous-même son courroux, Et que vous lui donnez des armes contre vous.'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 7, 'Moi, Burrhus ?'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 8, 'Moi, Burrhus ? Cet amour, seigneur, qui vous possède…'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 9, 'Je vous entends, Burrhus. Le mal est sans remède : Mon cœur s’en est plus dit que vous ne m’en direz ; Il faut que j’aime enfin.'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 10, 'Il faut que j’aime enfin. Vous vous le figurez, Seigneur ; et, satisfait de quelque résistance, Vous redoutez un mal faible dans sa naissance.'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 11, 'Mais si dans son devoir votre cœur affermi Voulait ne point s’entendre avec son ennemi ; Si de vos premiers ans vous consultiez la gloire ;'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 12, 'Si vous daigniez, seigneur, rappeler la mémoire Des vertus d’Octavie indignes de ce prix, Et de son chaste amour vainqueur de vos mépris ;'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', 'daa7165a-e415-4932-9dda-14c18cf5add5', 13, 'Surtout si, de Junie évitant la présence, Vous condamniez vos yeux à quelques jours d’absence ; Croyez-moi, quelque amour qui semble vous charmer, On n’aime point, seigneur, si l’on ne veut aimer.'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 14, 'Je vous croirai, Burrhus, lorsque dans les alarmes Il faudra soutenir la gloire de nos armes, Ou lorsque, plus tranquille, assis dans le sénat, Il faudra décider du destin de l’État ;'),
  ('a59bea5b-46cd-4901-8497-7c23da6d6f31', '3f7b75e0-2075-4b1a-b048-6475ae9ec971', 15, 'Je m’en reposerai sur votre expérience. Mais, croyez-moi, l’amour est une autre science, Burrhus ; et je ferais quelque difficulté D’abaisser jusque-là votre sévérité. Adieu. Je souffre trop, éloigné de Junie.');

-- Acte III, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène III', 'Acte III', 'acte-iii-scene-iii-5', false);
insert into characters (id, scene_id, name) values ('6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 'b7b61aa2-695a-4f42-8372-e04d39843349', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('15ac94b8-1226-4efa-9470-e3c8b0ecb307', 'b7b61aa2-695a-4f42-8372-e04d39843349', 'BURRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 1, 'Eh bien ! je me trompais, Burrhus, dans mes soupçons ! Et vous vous signalez par d’illustres leçons ! On exile Pallas, dont le crime peut-être Est d’avoir à l’empire élevé votre maître. Vous le savez trop bien ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 2, 'jamais, sans ses avis, Claude qu’il gouvernait n’eût adopté mon fils. Que dis-je ? À son épouse on donne une rivale ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 3, 'On affranchit Néron de la foi conjugale : Digne emploi d’un ministre ennemi des flatteurs, Choisi pour mettre un frein à ses jeunes ardeurs, De les flatter lui-même, et nourrir dans son âme Le mépris de sa mère et l’oubli de sa femme !'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 4, 'Madame, jusqu’ici c’est trop tôt m’accuser ; L’empereur n’a rien fait qu’on ne puisse excuser. N’imputez qu’à Pallas un exil nécessaire : Son orgueil dès longtemps exigeait ce salaire ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 5, 'Et l’empereur ne fait qu’accomplir à regret Ce que toute la cour demandait en secret. Le reste est un malheur qui n’est point sans ressource : Des larmes d’Octavie on peut tarir la source. Mais calmez vos transports ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 6, 'par un chemin plus doux, Vous lui pourrez plus tôt ramener son époux : Les menaces, les cris, le rendront plus farouche.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 7, 'Ah ! l’on s’efforce en vain de me fermer la bouche. Je vois que mon silence irrite vos dédains ; Et c’est trop respecter l’ouvrage de mes mains.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 8, 'Pallas n’emporte pas tout l’appui d’Agrippine : Le ciel m’en laisse assez pour venger ma ruine. Le fils de Claudius commence à ressentir Des crimes dont je n’ai que le seul repentir.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 9, 'J’irai, n’en doutez point, le montrer à l’armée, Plaindre aux yeux des soldats son enfance opprimée, Leur faire, à mon exemple, expier leur erreur.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 10, 'On verra d’un côté le fils d’un empereur Redemandant la foi jurée à sa famille, Et de Germanicus on entendra la fille ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 11, 'De l’autre, l’on verra le fils d’Ænobarbus, Appuyé de Sénèque et du tribun Burrhus, Qui, tous deux de l’exil rappelés par moi-même, Partagent à mes yeux l’autorité suprême.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 12, 'De nos crimes communs je veux qu’on soit instruit ; On saura les chemins par où je l’ai conduit : Pour rendre sa puissance et la vôtre odieuses, J’avoûrai les rumeurs les plus injurieuses ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '6c963d63-68bc-45f8-bbbb-87e86e2e98fd', 13, 'Je confesserai tout, exils, assassinats, Poison même…'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 14, 'Poison même… Madame, ils ne vous croiront pas : Ils sauront récuser l’injuste stratagème D’un témoin irrité qui s’accuse lui-même.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 15, 'Pour moi, qui le premier secondai vos desseins, Qui fis même jurer l’armée entre ses mains, Je ne me repens point de ce zèle sincère. Madame, c’est un fils qui succède à son père.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 16, 'En adoptant Néron, Claudius, par son choix, De son fils et du vôtre a confondu les droits. Rome l’a pu choisir. Ainsi, sans être injuste, Elle choisit Tibère adopté par Auguste ;'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 17, 'Et le jeune Agrippa, de son sang descendu, Se vit exclu du rang vainement prétendu.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 18, 'Sur tant de fondements sa puissance établie Par vous-même aujourd’hui ne peut être affaiblie : Et, s’il m’écoute encor, madame, sa bonté Vous en fera bientôt perdre la volonté.'),
  ('b7b61aa2-695a-4f42-8372-e04d39843349', '15ac94b8-1226-4efa-9470-e3c8b0ecb307', 19, 'J’ai commencé, je veux poursuivre mon ouvrage.');

-- Acte III, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène IV', 'Acte III', 'acte-iii-scene-iv-3', false);
insert into characters (id, scene_id, name) values ('2302934d-c9d4-4d54-a038-a76d0d8a6ed5', '0fc48604-08ac-41fa-baa0-7f54b608b50c', 'ALBINE');
insert into characters (id, scene_id, name) values ('63ec0c73-aaed-4a5f-9a70-d6f241499cd7', '0fc48604-08ac-41fa-baa0-7f54b608b50c', 'AGRIPPINE');
insert into lines (scene_id, character_id, "order", text) values
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '2302934d-c9d4-4d54-a038-a76d0d8a6ed5', 1, 'Dans quel emportement la douleur vous engage, Madame ! L’empereur puisse-t-il l’ignorer !'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '63ec0c73-aaed-4a5f-9a70-d6f241499cd7', 2, 'Ah ! lui-même à mes yeux puisse-t-il se montrer !'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '2302934d-c9d4-4d54-a038-a76d0d8a6ed5', 3, 'Madame, au nom des dieux, cachez votre colère. Quoi ! pour les intérêts de la sœur ou du frère, Faut-il sacrifier le repos de vos jours ? Contraindrez-vous César jusque dans ses amours ?'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '63ec0c73-aaed-4a5f-9a70-d6f241499cd7', 4, 'Quoi ! tu ne vois donc pas jusqu’où l’on me ravale, Albine ? C’est à moi qu’on donne une rivale. Bientôt, si je ne romps ce funeste lien, Ma place est occupée, et je ne suis plus rien.'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '63ec0c73-aaed-4a5f-9a70-d6f241499cd7', 5, 'Jusqu’ici d’un vain titre Octavie honorée, Inutile à la cour, en était ignorée : Les grâces, les honneurs, par moi seule versés, M’attiraient des mortels les vœux intéressés.'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '63ec0c73-aaed-4a5f-9a70-d6f241499cd7', 6, 'Une autre de César a surpris la tendresse : Elle aura le pouvoir d’épouse et de maîtresse ; Le fruit de tant de soins, la pompe des Césars, Tout deviendra le prix d’un seul de ses regards. Que dis-je ?'),
  ('0fc48604-08ac-41fa-baa0-7f54b608b50c', '63ec0c73-aaed-4a5f-9a70-d6f241499cd7', 7, 'l’on m’évite, et déjà délaissée… Ah ! je ne puis, Albine, en souffrir la pensée. Quand je devrais du ciel hâter l’arrêt fatal, Néron, l’ingrat Néron… Mais voici son rival.');

-- Acte III, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène V', 'Acte III', 'acte-iii-scene-v', false);
insert into characters (id, scene_id, name) values ('dfa234f6-754f-44dd-a149-6a9101a120c5', '9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('bb248458-0336-4f7e-a043-5110246712ff', '9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'AGRIPPINE');
insert into lines (scene_id, character_id, "order", text) values
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 1, 'Nos ennemis communs ne sont pas invincibles, Madame ;'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 2, 'nos malheurs trouvent des cœurs sensibles : Vos amis et les miens, jusqu’alors si secrets, Tandis que nous perdions le temps en vains regrets, Animés du courroux qu’allume l’injustice, Viennent de confier leur douleur à Narcisse.'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 3, 'Néron n’est pas encor tranquille possesseur De l’ingrate qu’il aime au mépris de ma sœur. Si vous êtes toujours sensible à son injure, On peut dans son devoir ramener le parjure.'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 4, 'La moitié du sénat s’intéresse pour nous : Sylla, Pison, Plautus…'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'bb248458-0336-4f7e-a043-5110246712ff', 5, 'Sylla, Pison, Plautus… Prince, que dites-vous ? Sylla, Pison, Plautus, les chefs de la noblesse !'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 6, 'Madame, je vois bien que ce discours vous blesse, Et que votre courroux, tremblant, irrésolu, Craint déjà d’obtenir tout ce qu’il a voulu. Non, vous avez trop bien établi ma disgrâce ;'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'dfa234f6-754f-44dd-a149-6a9101a120c5', 7, 'D’aucun ami pour moi ne redoutez l’audace : Il ne m’en reste plus ; et vos soins trop prudents Les ont tous écartés ou séduits dès longtemps.'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'bb248458-0336-4f7e-a043-5110246712ff', 8, 'Seigneur, à vos soupçons donnez moins de créance ; Notre salut dépend de notre intelligence. J’ai promis, il suffit. Malgré vos ennemis, Je ne révoque rien de ce que j’ai promis.'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'bb248458-0336-4f7e-a043-5110246712ff', 9, 'Le coupable Néron fuit en vain ma colère : Tôt ou tard il faudra qu’il entende sa mère. J’essaîrai tour à tour la force et la douceur ;'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'bb248458-0336-4f7e-a043-5110246712ff', 10, 'Ou moi-même, avec moi conduisant votre sœur, J’irai semer partout ma crainte et ses alarmes, Et ranger tous les cœurs du parti de ses larmes. Adieu. J’assiégerai Néron de toutes parts.'),
  ('9939e662-48ea-4a90-bd7c-5e79bdaf9a98', 'bb248458-0336-4f7e-a043-5110246712ff', 11, 'Vous, si vous m’en croyez, évitez ses regards.');

-- Acte III, Scène VI
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène VI', 'Acte III', 'acte-iii-scene-vi-6', false);
insert into characters (id, scene_id, name) values ('0c502287-ccb9-4c1f-a936-2a60a7ea0f43', '85c2d688-1bf7-4921-afdd-01e24dbcda82', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('b3cb44f2-c50e-49bf-aff0-b461ebeec842', '85c2d688-1bf7-4921-afdd-01e24dbcda82', 'NARCISSE');
insert into lines (scene_id, character_id, "order", text) values
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 1, 'Ne m’as-tu point flatté d’une fausse espérance ? Puis-je sur ton récit fonder quelque assurance, Narcisse ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 2, 'Narcisse ? Oui. Mais, seigneur, ce n’est pas en ces lieux Qu’il faut développer ce mystère à vos yeux. Sortons. Qu’attendez-vous ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 3, 'Sortons. Qu’attendez-vous ? Ce que j’attends, Narcisse ? Hélas !'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 4, 'Hélas ! Expliquez-vous.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 5, 'Hélas ! Expliquez-vous. Si par ton artifice, Je pouvais revoir…'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 6, 'Je pouvais revoir… Qui ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 7, 'Je pouvais revoir… Qui ? J’en rougis. Mais enfin D’un cœur moins agité j’attendrais mon destin.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 8, 'Après tous mes discours, vous la croyez fidèle ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 9, 'Non, je la crois, Narcisse, ingrate, criminelle, Digne de mon courroux ; mais je sens, malgré moi Que je ne le crois pas autant que je le doi.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 10, 'Dans ses égarements, mon cœur opiniâtre Lui prête des raisons, l’excuse, l’idolâtre. Je voudrais vaincre enfin mon incrédulité ; Je la voudrais haïr avec tranquillité. Eh !'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 11, 'qui croira qu’un cœur si grand en apparence, D’une infidèle cour ennemi dès l’enfance, Renonce à tant de gloire, et, dès le premier jour, Trame une perfidie inouïe à la cour ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 12, 'Eh ! qui sait si l’ingrate, en sa longue retraite, N’a point de l’empereur médité la défaite ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 13, 'Trop sûre que ses yeux ne pouvaient se cacher, Peut-être elle fuyait pour se faire chercher, Pour exciter Néron par la gloire pénible De vaincre une fierté jusqu’alors invincible.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 14, 'Je ne la puis donc voir ?'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 15, 'Je ne la puis donc voir ? Seigneur, en ce moment Elle reçoit les vœux de son nouvel amant.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', '0c502287-ccb9-4c1f-a936-2a60a7ea0f43', 16, 'Eh bien ! Narcisse, allons. Mais que vois-je ? c’est elle.'),
  ('85c2d688-1bf7-4921-afdd-01e24dbcda82', 'b3cb44f2-c50e-49bf-aff0-b461ebeec842', 17, 'Ah ! dieux ! À l’empereur portons cette nouvelle.');

-- Acte III, Scène VII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène VII', 'Acte III', 'acte-iii-scene-vii-4', false);
insert into characters (id, scene_id, name) values ('d51a0479-b3d5-4eef-97e0-e2c626f885ed', '615d4fc4-5e69-4a00-b478-e8b506a431c1', 'JUNIE');
insert into characters (id, scene_id, name) values ('6858cf14-c1c7-414c-97ae-ddee14b55a4c', '615d4fc4-5e69-4a00-b478-e8b506a431c1', 'BRITANNICUS');
insert into lines (scene_id, character_id, "order", text) values
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 1, 'Retirez-vous, seigneur, et fuyez un courroux Que ma persévérance allume contre vous. Néron est irrité. Je me suis échappée Tandis qu’à l’arrêter sa mère est occupée.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 2, 'Adieu, réservez-vous, sans blesser mon amour, Au plaisir de me voir justifier un jour. Votre image sans cesse est présente à mon âme : Rien ne l’en peut bannir.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 3, 'Rien ne l’en peut bannir. Je vous entends, madame : Vous voulez que ma fuite assure vos désirs, Que je laisse un champ libre à vos nouveaux soupirs.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 4, 'Sans doute, en me voyant, une pudeur secrète Ne vous laisse goûter qu’une joie inquiète. Eh bien, il faut partir !'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 5, 'Eh bien, il faut partir ! Seigneur, sans m’imputer…'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 6, 'Ah ! vous deviez du moins plus longtemps disputer. Je ne murmure point qu’une amitié commune Se range du parti que flatte la fortune ; Que l’éclat d’un empire ait pu vous éblouir ;'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 7, 'Qu’aux dépens de ma sœur vous en vouliez jouir ; Mais que, de ces grandeurs comme une autre occupée, Vous m’en ayez paru si longtemps détrompée ;'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 8, 'Non, je l’avoue encor, mon cœur désespéré Contre ce seul malheur n’était point préparé. J’ai vu sur ma ruine élever l’injustice ;'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 9, 'De mes persécutions j’ai vu le ciel complice : Tant d’horreurs n’avaient point épuisé son courroux, Madame ; il me restait d’être oublié de vous.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 10, 'Dans un temps plus heureux, ma juste impatience Vous ferait repentir de votre défiance ; Mais Néron vous menace : en ce pressant danger, Seigneur, j’ai d’autres soins que de vous affliger.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 11, 'Allez, rassurez-vous, et cessez de vous plaindre : Néron nous écoutait, et m’ordonnait de feindre.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 12, 'Quoi ! le cruel…'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 13, 'Quoi ! le cruel… Témoin de tout notre entretien, D’un visage sévère examinait le mien, Prêt à faire sur vous éclater la vengeance D’un geste confident de notre intelligence.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 14, 'Néron nous écoutait, madame ! Mais, hélas ! Vos yeux auraient pu feindre, et ne m’abuser pas : Ils pouvaient me nommer l’auteur de cet outrage ! L’amour est-il muet, ou n’a-t-il qu’un langage ?'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 15, 'De quel trouble un regard pouvait me préserver ! Il fallait…'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 16, 'Il fallait… Il fallait me taire et vous sauver. Combien de fois, hélas ! puisqu’il faut vous le dire, Mon cœur de son désordre allait-il vous instruire !'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 17, 'De combien de soupirs interrompant le cours, Ai-je évité vos yeux que je cherchais toujours !'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 18, 'Quel tourment de se taire en voyant ce qu’on aime, De l’entendre gémir, de l’affliger soi-même, Lorsque par un regard on peut le consoler ! Mais quels pleurs ce regard aurait-il fait couler ! Ah !'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 19, 'dans ce souvenir, inquiète, troublée, Je ne me sentais pas assez dissimulée : De mon front effrayé je craignais la pâleur ; Je trouvais mes regards trop pleins de ma douleur ;'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 20, 'Sans cesse il me semblait que Néron en colère Me venait reprocher trop de soin de vous plaire ; Je craignais mon amour vainement renfermé ; Enfin, j’aurais voulu n’avoir jamais aimé. Hélas !'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 21, 'pour son bonheur, seigneur, et pour le nôtre, Il n’est que trop instruit de mon cœur et du vôtre ! Allez, encore un coup, cachez-vous à ses yeux : Mon cœur plus à loisir vous éclaircira mieux.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 22, 'De mille autres secrets j’aurais compte à vous rendre.'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', '6858cf14-c1c7-414c-97ae-ddee14b55a4c', 23, 'Ah ! n’en voilà que trop ; c’est trop me faire entendre, Madame, mon bonheur, mon crime, vos bontés Et savez-vous pour moi tout ce que vous quittez ? ((se jetant aux pieds de Junie.))'),
  ('615d4fc4-5e69-4a00-b478-e8b506a431c1', 'd51a0479-b3d5-4eef-97e0-e2c626f885ed', 24, 'Que faites-vous ? Hélas ! votre rival s’approche.');

-- Acte III, Scène VIII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène VIII', 'Acte III', 'acte-iii-scene-viii-5', false);
insert into characters (id, scene_id, name) values ('64d8a693-1006-407e-8447-af5623914dc0', 'fe59d39e-61c5-438e-b404-06da7ace1e0a', 'NÉRON');
insert into characters (id, scene_id, name) values ('904dd464-9212-48b6-9d6d-761018ef826c', 'fe59d39e-61c5-438e-b404-06da7ace1e0a', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('c98c09e1-89ab-4922-9645-9defd946e544', 'fe59d39e-61c5-438e-b404-06da7ace1e0a', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 1, 'Prince, continuez des transports si charmants. Je conçois vos bontés par ses remercîments, Madame ; à vos genoux je viens de le surprendre. Mais il aurait aussi quelque grâce à me rendre ;'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 2, 'Ce lieu le favorise, et je vous y retiens Pour lui faciliter de si doux entretiens.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 3, 'Je puis mettre à ses pieds ma douleur ou ma joie Partout où sa bonté consent que je la voie, Et l’aspect de ces lieux où vous la retenez N’a rien dont mes regards doivent être étonnés.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 4, 'Et que vous montrent-ils qui ne vous avertisse Qu’il faut qu’on me respecte et que l’on m’obéisse ?'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 5, 'Ils ne nous ont pas vu l’un et l’autre élever, Moi pour vous obéir, et vous pour me braver ; Et ne s’attendaient pas, lorsqu’ils nous virent naître, Qu’un jour Domitius me dût parler en maître.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 6, 'Ainsi par le destin nos vœux sont traversés ; J’obéissais alors, et vous obéissez. Si vous n’avez appris à vous laisser conduire, Vous êtes jeune encore, et l’on peut vous instruire.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 7, 'Et qui m’en instruira ?'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 8, 'Et qui m’en instruira ? Tout l’empire à la fois, Rome.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 9, 'Rome. Rome met-elle au nombre de vos droits Tout ce qu’a de cruel l’injustice et la force, Les emprisonnements, le rapt et le divorce ?'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 10, 'Rome ne porte point ses regards curieux Jusque dans des secrets que je cache à ses yeux. Imitez son respect.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 11, 'Imitez son respect. On sait ce qu’elle en pense.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 12, 'Elle se tait du moins : imitez son silence.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 13, 'Ainsi Néron commence à ne se plus forcer.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 14, 'Néron de vos discours commence à se lasser.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 15, 'Chacun devait bénir le bonheur de son règne.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 16, 'Heureux ou malheureux, il suffit qu’on me craigne.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 17, 'Je connais mal Junie, ou de tels sentiments Ne mériteront pas ses applaudissements.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 18, 'Du moins, si je ne sais le secret de lui plaire, Je sais l’art de punir un rival téméraire.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 19, 'Pour moi, quelque péril qui me puisse accabler, Sa seule inimitié peut me faire trembler.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 20, 'Souhaitez-la ; c’est tout ce que je puis vous dire.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 21, 'Le bonheur de lui plaire est le seul où j’aspire.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 22, 'Elle vous l’a promis, vous lui plairez toujours.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 23, 'Je ne sais pas du moins épier ses discours. Je la laisse expliquer sur tout ce qui me touche, Et ne me cache point pour lui fermer la bouche.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 24, 'Je vous entends. Eh bien ! gardes !'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', 'c98c09e1-89ab-4922-9645-9defd946e544', 25, 'Je vous entends. Eh bien ! gardes ! Que faites-vous ? C’est votre frère. Hélas ! c’est un amant jaloux. Seigneur, mille malheurs persécutent sa vie : Ah ! son bonheur peut-il exciter votre envie ?'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', 'c98c09e1-89ab-4922-9645-9defd946e544', 26, 'Souffrez que, de vos cœurs rapprochant les liens, Je me cache à vos yeux, et me dérobe aux siens. Ma fuite arrêtera vos discordes fatales ; Seigneur, j’irai remplir le nombre des vestales.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', 'c98c09e1-89ab-4922-9645-9defd946e544', 27, 'Ne lui disputez plus mes vœux infortunés, Souffrez que les dieux seuls en soient importunés.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 28, 'L’entreprise, madame, est étrange et soudaine. Dans son appartement, gardes, qu’on la remène ! Gardez Britannicus dans celui de sa sœur.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '904dd464-9212-48b6-9d6d-761018ef826c', 29, 'C’est ainsi que Néron sait disputer un cœur !'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', 'c98c09e1-89ab-4922-9645-9defd946e544', 30, 'Prince, sans l’irriter, cédons à cet orage.'),
  ('fe59d39e-61c5-438e-b404-06da7ace1e0a', '64d8a693-1006-407e-8447-af5623914dc0', 31, 'Gardes, obéissez sans tarder davantage.');

-- Acte III, Scène IX
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte III, Scène IX', 'Acte III', 'acte-iii-scene-ix-4', false);
insert into characters (id, scene_id, name) values ('e38ea77c-ea5c-4325-9228-1cf0faa04c82', '6bf6c0e7-8b1b-48fd-a915-ac930120b106', 'BURRHUS');
insert into characters (id, scene_id, name) values ('1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', '6bf6c0e7-8b1b-48fd-a915-ac930120b106', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', 'e38ea77c-ea5c-4325-9228-1cf0faa04c82', 1, 'Que vois-je ? Ô ciel !'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', 2, 'Que vois-je ? Ô ciel ! Ainsi leurs feux sont redoublés ; Je reconnais la main qui les a rassemblés.'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', 3, 'Agrippine ne s’est présentée à ma vue, Ne s’est dans ses discours si longtemps étendue, Que pour faire jouer ce ressort odieux. ((apercevant Burrhus.))'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', 4, 'Burrhus, dans ce palais je veux qu’on la retienne, Et qu’au lieu de sa garde on lui donne la mienne.'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', 'e38ea77c-ea5c-4325-9228-1cf0faa04c82', 5, 'Quoi ! seigneur, sans l’ouïr ! Une mère !'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', 6, 'Quoi ! seigneur, sans l’ouïr ! Une mère ! Arrêtez : J’ignore quels projets, Burrhus, vous méditez ; Mais, depuis quelques jours, tout ce que je désire Trouve en vous un censeur prêt à me contredire.'),
  ('6bf6c0e7-8b1b-48fd-a915-ac930120b106', '1ddc024c-c8f2-496a-95e5-a0c2127dcb0f', 7, 'Répondez-m’en, vous dis-je, ou, sur votre refus, D’autres me répondront et d’elle et de Burrhus.');

-- Acte IV, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte IV, Scène première', 'Acte IV', 'acte-iv-scene-premiere', false);
insert into characters (id, scene_id, name) values ('5c8173ce-58a4-42b4-8581-6fe99536c7a1', 'dfeac111-1646-4c89-b300-7c4352a51e3b', 'BURRHUS');
insert into characters (id, scene_id, name) values ('ad4a6e09-bd99-4af9-9f45-c458e344bb89', 'dfeac111-1646-4c89-b300-7c4352a51e3b', 'AGRIPPINE');
insert into lines (scene_id, character_id, "order", text) values
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', '5c8173ce-58a4-42b4-8581-6fe99536c7a1', 1, 'Oui, madame, à loisir vous pourrez vous défendre ; César lui-même ici consent de vous entendre. Si son ordre au palais vous a fait retenir, C’est peut-être à dessein de vous entretenir.'),
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', '5c8173ce-58a4-42b4-8581-6fe99536c7a1', 2, 'Quoi qu’il en soit, si j’ose expliquer ma pensée, Ne vous souvenez plus qu’il vous ait offensée ; Préparez-vous plutôt à lui tendre les bras, Défendez-vous, madame, et ne l’accusez pas.'),
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', '5c8173ce-58a4-42b4-8581-6fe99536c7a1', 3, 'Vous voyez, c’est lui seul que la cour envisage. Quoiqu’il soit votre fils, et même votre ouvrage, Il est votre empereur. Vous êtes, comme nous, Sujette à ce pouvoir qu’il a reçu de vous.'),
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', '5c8173ce-58a4-42b4-8581-6fe99536c7a1', 4, 'Selon qu’il vous menace, ou bien qu’il vous caresse, La cour autour de vous ou s’écarte ou s’empresse. C’est son appui qu’on cherche en cherchant votre appui. Mais voici l’empereur.'),
  ('dfeac111-1646-4c89-b300-7c4352a51e3b', 'ad4a6e09-bd99-4af9-9f45-c458e344bb89', 5, 'Mais voici l’empereur. Qu’on me laisse avec lui.');

-- Acte IV, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte IV, Scène II', 'Acte IV', 'acte-iv-scene-ii-2', false);
insert into characters (id, scene_id, name) values ('6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', '2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('3a947361-fe05-47ef-af3d-f25c3c227aec', '2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 1, 'Approchez-vous, Néron, et prenez votre place. On veut sur vos soupçons que je vous satisfasse. J’ignore de quel crime on a pu me noircir ; De tous ceux que j’ai faits je vais vous éclaircir. Vous régnez ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 2, 'vous savez combien votre naissance Entre l’empire et vous avait mis de distance. Les droits de mes aïeux, que Rome a consacrés, Étaient même sans moi d’inutiles degrés.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 3, 'Quand de Britannicus la mère condamnée Laissa de Claudius disputer l’hyménée, Parmi tant de beautés qui briguèrent son choix, Qui de ses affranchis mendièrent les voix, Je souhaitai son lit, dans la seule pensée De vous laisser au trône où je serais placée, Je fléchis mon orgueil ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 4, 'j’allai prier Pallas. Son maître, chaque jour caressé dans mes bras, Prit insensiblement dans les yeux de sa nièce L’amour où je voulais amener sa tendresse.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 5, 'Mais ce lien du sang qui nous joignait tous deux Écartait Claudius d’un lit incestueux ; Il n’osait épouser la fille de son frère.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 6, 'Le sénat fut séduit : une loi moins sévère Mit Claude dans mon lit, et Rome à mes genoux. C’était beaucoup pour moi, ce n’était rien pour vous. Je vous fis sur mes pas entrer dans sa famille ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 7, 'Je vous nommai son gendre, et vous donnai sa fille : Silanus, qui l’aimait, s’en vit abandonné, Et marqua de son sang ce jour infortuné. Ce n’était rien encore.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 8, 'Eussiez-vous pu prétendre Qu’un jour Claude à son fils pût préférer son gendre ? De ce même Pallas j’implorai le secours ; Claude vous adopta, vaincu par ses discours, Vous appela Néron ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 9, 'et du pouvoir suprême Voulut, avant le temps, vous faire part lui-même. C’est alors que chacun, rappelant le passé, Découvrit mon dessein déjà trop avancé ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 10, 'Que de Britannicus la disgrâce future Des amis de son père excita le murmure. Mes promesses aux uns éblouirent les yeux ; L’exil me délivra des plus séditieux ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 11, 'Claude même, lassé de ma plainte éternelle, Éloigna de son fils tous ceux de qui le zèle, Engagé dès longtemps à suivre son destin, Pouvait du trône encor lui rouvrir le chemin. Je fis plus ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 12, 'je choisis moi-même dans ma suite Ceux à qui je voulais qu’on livrât sa conduite ; J’eus soin de vous nommer par un contraire choix, Des gouverneurs que Rome honorait de sa voix ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 13, 'Je fus sourde à la brigue, et crus la renommée ; J’appelai de l’exil, je tirai de l’armée, Et ce même Sénèque, et ce même Burrhus, Qui depuis… Rome alors estimait leurs vertus.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 14, 'De Claude en même temps épuisant les richesses, Ma main, sous votre nom, répandait ses largesses.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 15, 'Les spectacles, les dons, invincibles appas, Vous attiraient les cœurs du peuple et des soldats, Qui d’ailleurs, réveillant leur tendresse première, Favorisaient en vous Germanicus mon père.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 16, 'Cependant Claudius penchait vers son déclin. Ses yeux, longtemps fermés, s’ouvrirent à la fin ; Il connut son erreur.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 17, 'Occupé de sa crainte, Il laissa pour son fils échapper quelque plainte, Et voulut, mais trop tard, assembler ses amis. Ses gardes, son palais, son lit, m’étaient soumis.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 18, 'Je lui laissai sans fruit consumer sa tendresse, De ses derniers soupirs je me rendis maîtresse : Mes soins, en apparence, épargnant ses douleurs, De son fils, en mourant, lui cachèrent les pleurs. Il mourut.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 19, 'Mille bruits en courent à ma honte. J’arrêtai de sa mort la nouvelle trop prompte ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 20, 'Et tandis que Burrhus allait secrètement De l’armée en vos mains exiger le serment, Que vous marchiez au camp, conduit sous mes auspices, Dans Rome les autels fumaient de sacrifices ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 21, 'Par mes ordres trompeurs tout le peuple excité Du prince déjà mort demandait la santé. Enfin, des légions l’entière obéissance Ayant de votre empire affermi la puissance, On vit Claude ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 22, 'et le peuple, étonné de son sort, Apprit en même temps votre règne et sa mort. C’est le sincère aveu que je voulais vous faire : Voilà tous mes forfaits.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 23, 'En voici le salaire : Du fruit de tant de soins à peine jouissant En avez-vous six mois paru reconnaissant, Que, lassé d’un respect qui vous gênait peut-être, Vous avez affecté de ne me plus connaître.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 24, 'J’ai vu Burrhus, Sénèque, aigrissant vos soupçons, De l’infidélité vous tracer des leçons, Ravis d’être vaincus dans leur propre science.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 25, 'J’ai vu favorisés de votre confiance Othon, Sénécion, jeunes voluptueux, Et de tous vos plaisirs flatteurs respectueux ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 26, 'Et lorsque, vos mépris excitant mes murmures, Je vous ai demandé raison de tant d’injures, (Seul recours d’un ingrat qui se voit confondu) Par de nouveaux affronts vous m’avez répondu.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 27, 'Aujourd’hui je promets Junie à votre frère ; Ils se flattent tous deux du choix de votre mère : Que faites-vous ? Junie, enlevée à la cour, Devient en une nuit l’objet de votre amour ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 28, 'Je vois de votre cœur Octavie effacée, Prête à sortir du lit où je l’avais placée ; Je vois Pallas banni, votre frère arrêté ; Vous attentez enfin jusqu’à ma liberté ; Burrhus ose sur moi porter ses mains hardies.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 29, 'Et lorsque, convaincu de tant de perfidies, Vous deviez ne me voir que pour les expier, C’est vous qui m’ordonnez de me justifier !'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 30, 'Je me souviens toujours que je vous dois l’empire, Et, sans vous fatiguer du soin de le redire, Votre bonté, madame, avec tranquillité Pouvait se reposer sur ma fidélité.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 31, 'Aussi bien ces soupçons, ces plaintes assidues Ont fait croire à tous ceux qui les ont entendues Que jadis, j’ose ici vous le dire entre nous, Vous n’aviez, sous mon nom, travaillé que pour vous.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 32, '« Tant d’honneurs, disaient-ils, et tant de déférences, « Sont-ce de ses bienfaits de faibles récompenses ? « Quel crime a donc commis ce fils tant condamné ? « Est-ce pour obéir qu’elle l’a couronné ?'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 33, '« N’est-il de son pouvoir que le dépositaire ? » Non que, si jusque-là j’avais pu vous complaire, Je n’eusse pris plaisir, madame, à vous céder Ce pouvoir que vos cris semblaient redemander ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 34, 'Mais Rome veut un maître, et non une maîtresse. Vous entendiez les bruits qu’excitait ma faiblesse ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 35, 'Le sénat chaque jour et le peuple, irrités De s’ouïr par ma voix dicter vos volontés, Publiaient qu’en mourant Claude avec sa puissance M’avait encor laissé sa simple obéissance.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 36, 'Vous avez vu cent fois nos soldats en courroux Porter en murmurant leurs aigles devant vous ; Honteux de rabaisser par cet indigne usage Les héros dont encore elles portent l’image.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 37, 'Toute autre se serait rendue à leurs discours ; Mais si vous ne régnez, vous vous plaignez toujours. Avec Britannicus contre moi réunie, Vous le fortifiez du parti de Junie ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 38, 'Et la main de Pallas trame tous ces complots. Et lorsque malgré moi j’assure mon repos, On vous voit de colère et de haine animée ; Vous voulez présenter mon rival à l’armée, Déjà jusques au camp le bruit en a couru.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 39, 'Moi, le faire empereur ? Ingrat ! l’avez-vous cru ? Quel serait mon dessein ? qu’aurais-je pu prétendre ? Quels honneurs dans sa cour, quel rang pourrais-je attendre ? Ah !'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 40, 'si sous votre empire on ne m’épargne pas, Si mes accusateurs observent tous mes pas, Si de leur empereur ils poursuivent la mère, Que ferais-je au milieu d’une cour étrangère ?'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 41, 'Ils me reprocheraient, non des cris impuissants, Des desseins étouffés aussitôt que naissants, Mais des crimes pour vous commis à votre vue, Et dont je ne serais que trop tôt convaincue.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 42, 'Vous ne me trompez point, je vois tous vos détours ; Vous êtes un ingrat, vous le fûtes toujours. Dès vos plus jeunes ans, mes soins et mes tendresses N’ont arraché de vous que de feintes caresses.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 43, 'Rien ne vous a pu vaincre ; et votre dureté Aurait dû dans son cours arrêter ma bonté. Que je suis malheureuse ! et par quelle infortune Faut-il que tous mes soins me rendent importune ! Je n’ai qu’un fils. Ô ciel !'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 44, 'qui m’entends aujourd’hui, T’ai-je fait quelques vœux qui ne fussent pour lui ? Remords, crainte, périls, rien ne m’a retenue ; J’ai vaincu ses mépris ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 45, 'j’ai détourné ma vue Des malheurs qui dès lors me furent annoncés ; J’ai fait ce que j’ai pu ; vous régnez, c’est assez.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 46, 'Avec ma liberté, que vous m’avez ravie, Si vous le souhaitez, prenez encor ma vie, Pourvu que par ma mort tout le peuple irrité Ne vous ravisse pas ce qui m’a tant coûté.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 47, 'Eh bien donc, prononcez. Que voulez-vous qu’on fasse ?'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 48, 'De mes accusateurs qu’on punisse l’audace ; Que de Britannicus on calme le courroux ; Que Junie à son choix puisse prendre un époux ; Qu’ils soient libres tous deux, et que Pallas demeure ;'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '6eebc644-a97f-4e87-ad6e-ee9dbaf36ddc', 49, 'Que vous me permettiez de vous voir à toute heure ; ((apercevant Burrhus dans le fond du théâtre.)) À votre porte enfin n’ose plus m’arrêter.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 50, 'Oui, madame, je veux que ma reconnaissance Désormais dans les cœurs grave votre puissance ; Et je bénis déjà cette heureuse froideur, Qui de notre amitié va rallumer l’ardeur.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 51, 'Quoi que Pallas ait fait, il suffit, je l’oublie ; Avec Britannicus je me réconcilie ; Et quant à cet amour qui nous a séparés, Je vous fais notre arbitre, et vous nous jugerez.'),
  ('2f4f50f9-aba0-4a59-9c3c-1b39fbc25b05', '3a947361-fe05-47ef-af3d-f25c3c227aec', 52, 'Allez donc, et portez cette joie à mon frère. Gardes, qu’on obéisse aux ordres de ma mère.');

-- Acte IV, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte IV, Scène III', 'Acte IV', 'acte-iv-scene-iii-4', false);
insert into characters (id, scene_id, name) values ('fa2ee26b-41fa-4aa6-b866-af37b6062308', '55c175b9-393b-4a5d-9eed-dbec192e5b46', 'BURRHUS');
insert into characters (id, scene_id, name) values ('cbbc910c-f5a4-4f52-a09b-9b943ed810a3', '55c175b9-393b-4a5d-9eed-dbec192e5b46', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 1, 'Que cette paix, seigneur, et ces embrassements Vont offrir à mes yeux de spectacles charmants !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 2, 'Vous savez si jamais ma voix lui fut contraire, Si de son amitié j’ai voulu vous distraire, Et si j’ai mérité cet injuste courroux.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 3, 'Je ne vous flatte point, je me plaignais de vous, Burrhus ; je vous ai crus tous deux d’intelligence ; Mais son inimitié vous rend ma confiance. Elle se hâte trop, Burrhus, de triompher ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 4, 'J’embrasse mon rival, mais c’est pour l’étouffer.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 5, 'Quoi, seigneur !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 6, 'Quoi, seigneur ! C’en est trop ; il faut que sa ruine Me délivre à jamais des fureurs d’Agrippine. Tant qu’il respirera, je ne vis qu’à demi. Elle m’a fatigué de ce nom ennemi ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 7, 'Et je ne prétends pas que sa coupable audace Une seconde fois lui promette ma place.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 8, 'Elle va donc bientôt pleurer Britannicus ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 9, 'Avant la fin du jour je ne le craindrai plus.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 10, 'Et qui de ce dessein vous inspire l’envie ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 11, 'Ma gloire, mon amour, ma sûreté, ma vie.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 12, 'Non, quoi que vous disiez, cet horrible dessein Ne fut jamais, seigneur, conçu dans votre sein.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 13, 'Burrhus !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 14, 'Burrhus ! De votre bouche, ô ciel ! puis-je l’apprendre ? Vous-même, sans frémir, avez-vous pu l’entendre ? Songez-vous dans quel sang vous allez vous baigner ? Néron dans tous les cœurs est-il las de régner ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 15, 'Que dira-t-on de vous ? quelle est votre pensée ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 16, 'Quoi ! toujours enchaîné de ma gloire passée, J’aurai devant les yeux je ne sais quel amour Que le hasard nous donne et nous ôte en un jour ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 17, 'Soumis à tous leurs vœux, à mes désirs contraire, Suis-je leur empereur seulement pour leur plaire ?'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 18, 'Eh ! ne suffit-il pas, seigneur, à vos souhaits Que le bonheur public soit un de vos bienfaits ? C’est à vous à choisir, vous êtes encor maître. Vertueux jusqu’ici, vous pouvez toujours l’être ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 19, 'Le chemin est tracé, rien ne vous retient plus, Vous n’avez qu’à marcher de vertus en vertus.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 20, 'Mais si de vos flatteurs vous suivez la maxime, Il vous faudra, seigneur, courir de crime en crime, Soutenir vos rigueurs par d’autres cruautés, Et laver dans le sang vos bras ensanglantés.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 21, 'Britannicus mourant excitera le zèle De ses amis, tout prêts à prendre sa querelle. Ces vengeurs trouveront de nouveaux défenseurs, Qui, même après leur mort, auront des successeurs ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 22, 'Vous allumez un feu qui ne pourra s’éteindre. Craint de tout l’univers, il vous faudra tout craindre, Toujours punir, toujours trembler dans vos projets, Et pour vos ennemis compter tous vos sujets. Ah !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 23, 'de vos premiers ans l’heureuse expérience Vous fait-elle, seigneur, haïr votre innocence ? Songez-vous au bonheur qui les a signalés ? Dans quel repos, ô ciel ! les avez-vous coulés !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 24, 'Quel plaisir de penser et de dire en vous-même : « Partout en ce moment on me bénit, on m’aime ; « On ne voit point le peuple à mon nom s’alarmer ; « Le ciel dans tous leurs pleurs ne m’entend point nommer ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 25, '« Leur sombre inimitié ne fuit point mon visage ; « Je vois voler partout les cœurs à mon passage ! » Tels étaient vos plaisirs. Quel changement, ô dieux !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 26, 'Le sang le plus abject vous était précieux : Un jour, il m’en souvient, le sénat équitable Vous pressait de souscrire à la mort d’un coupable ; Vous résistiez, seigneur, à leur sévérité ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 27, 'Votre cœur s’accusait de trop de cruauté ; Et plaignant les malheurs attachés à l’empire, « Je voudrais, disiez-vous, ne savoir pas écrire.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 28, '» Non, ou vous me croirez, ou bien de ce malheur Ma mort m’épargnera la vue et la douleur ; On ne me verra point survivre à votre gloire. Si vous allez commettre une action si noire, ((se jetant aux pieds de Néron.))'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 29, 'Faites percer ce cœur qui n’y peut consentir ; Appelez les cruels qui vous l’ont inspirée ; Qu’ils viennent essayer leur main mal assurée… Mais je vois que mes pleurs touchent mon empereur ;'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 30, 'Je vois que sa vertu frémit de leur fureur. Ne perdez point de temps, nommez-moi les perfides Qui vous osent donner ces conseils parricides ; Appelez votre frère, oubliez dans ses bras…'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 31, 'Ah ! que demandez-vous !'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'fa2ee26b-41fa-4aa6-b866-af37b6062308', 32, 'Ah ! que demandez-vous ! Non, il ne vous hait pas, Seigneur ; on le trahit ; je sais son innocence ; Je vous réponds pour lui de son obéissance. J’y cours. Je vais presser un entretien si doux.'),
  ('55c175b9-393b-4a5d-9eed-dbec192e5b46', 'cbbc910c-f5a4-4f52-a09b-9b943ed810a3', 33, 'Dans mon appartement qu’il m’attende avec vous.');

-- Acte IV, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte IV, Scène IV', 'Acte IV', 'acte-iv-scene-iv', false);
insert into characters (id, scene_id, name) values ('3c33320c-8196-4003-8c72-fbd8714fae49', '00c111a5-d490-4e5c-af42-0e2ec1627120', 'NARCISSE');
insert into characters (id, scene_id, name) values ('b8244a86-2bca-4a7a-a162-556fabbad6d7', '00c111a5-d490-4e5c-af42-0e2ec1627120', 'NÉRON');
insert into lines (scene_id, character_id, "order", text) values
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 1, 'Seigneur, j’ai tout prévu pour une mort si juste : Le poison est tout prêt. La fameuse Locuste A redoublé pour moi ses soins officieux : Elle a fait expirer un esclave à mes yeux ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 2, 'Et le fer est moins prompt, pour trancher une vie, Que le nouveau poison que sa main me confie.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 3, 'Narcisse, c’est assez ; je reconnais ce soin, Et ne souhaite pas que vous alliez plus loin.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 4, 'Quoi ! pour Britannicus votre haine affaiblie Me défend…'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 5, 'Me défend… Oui, Narcisse : on nous réconcilie.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 6, 'Je me garderai bien de vous en détourner, Seigneur. Mais il s’est vu tantôt emprisonner : Cette offense en son cœur sera longtemps nouvelle.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 7, 'Il n’est point de secrets que le temps ne révèle : Il saura que ma main lui devait présenter Un poison que votre ordre avait fait apprêter. Les dieux de ce dessein puissent-ils le distraire !'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 8, 'Mais peut-être il fera ce que vous n’osez faire.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 9, 'On répond de son cœur ; et je vaincrai le mien.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 10, 'Et l’hymen de Junie en est-il le lien ? Seigneur, lui faites-vous encor ce sacrifice ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 11, 'C’est prendre trop de soin. Quoi qu’il en soit, Narcisse, Je ne le compte plus parmi mes ennemis.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 12, 'Agrippine, seigneur, se l’était bien promis : Elle a repris sur vous son souverain empire.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 13, 'Quoi donc ? qu’a-t-elle dit ? et que voulez-vous dire ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 14, 'Elle s’en est vantée assez publiquement.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 15, 'De quoi ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 16, 'De quoi ? Qu’elle n’avait qu’à vous voir un moment ; Qu’à tout ce grand éclat, à ce courroux funeste, On verrait succéder un silence modeste ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 17, 'Que vous-même à la paix souscririez le premier : Heureux que sa bonté daignât tout oublier !'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 18, 'Mais, Narcisse, dis-moi, que veux-tu que je fasse ? Je n’ai que trop de pente à punir son audace ; Et, si je m’en croyais, ce triomphe indiscret Serait bientôt suivi d’un éternel regret.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 19, 'Mais de tout l’univers quel sera le langage ? Sur les pas des tyrans veux-tu que je m’engage, Et que Rome, effaçant tant de titres d’honneur, Me laisse pour tout nom celui d’empoisonneur ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 20, 'Ils mettront ma vengeance au rang des parricides.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 21, 'Et prenez-vous, seigneur, leurs caprices pour guides ? Avez-vous prétendu qu’ils se tairaient toujours ? Est-ce à vous de prêter l’oreille à leurs discours ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 22, 'De vos propres désirs perdrez-vous la mémoire, Et serez-vous le seul que vous n’oserez croire ? Mais, seigneur, les Romains ne vous sont pas connus : Non, non, dans leurs discours ils sont plus retenus.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 23, 'Tant de précaution affaiblit votre règne : Ils croiront, en effet, mériter qu’on les craigne. Au joug, depuis longtemps, ils se sont façonnés ; Ils adorent la main qui les tient enchaînés.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 24, 'Vous les verrez toujours ardents à vous complaire : Leur prompte servitude a fatigué Tibère.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 25, 'Moi-même, revêtu d’un pouvoir emprunté, Que je reçus de Claude avec la liberté, J’ai cent fois, dans le cours de ma gloire passée, Tenté leur patience, et ne l’ai point lassée.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 26, 'D’un empoisonnement vous craignez la noirceur ! Faites périr le frère, abandonnez la sœur ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 27, 'Rome, sur les autels prodiguant les victimes, Fussent-ils innocents, leur trouvera des crimes : Vous verrez mettre au rang des jours infortunés Ceux où jadis la sœur et le frère sont nés.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 28, 'Narcisse, encore un coup, je ne puis l’entreprendre. J’ai promis à Burrhus, il a fallu me rendre. Je ne veux point encore, en lui manquant de foi, Donner à sa vertu des armes contre moi.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 29, 'J’oppose à ses raisons un courage inutile : Je ne l’écoute point avec un cœur tranquille.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 30, 'Burrhus ne pense pas, seigneur, tout ce qu’il dit : Son adroite vertu ménage son crédit ; Ou plutôt ils n’ont tous qu’une même pensée. Ils verraient par ce coup leur puissance abaissée ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 31, 'Vous seriez libre alors, seigneur, et devant vous Ces maîtres orgueilleux fléchiraient comme nous. Quoi donc ! ignorez-vous tout ce qu’ils osent dire ! « Néron, s’ils en sont crus, n’est point né pour l’empire ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 32, '« Il ne dit, il ne fait que ce qu’on lui prescrit : « Burrhus conduit son cœur, Sénèque son esprit.'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 33, '« Pour toute ambition, pour vertu singulière, « Il excelle à conduire un char dans la carrière, « À disputer des prix indignes de ses mains, « À se donner lui-même en spectacle aux Romains, « À venir prodiguer sa voix sur un théâtre, « À réciter des chants qu’il veut qu’on idolâtre ;'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', '3c33320c-8196-4003-8c72-fbd8714fae49', 34, '« Tandis que des soldats, de moments en moments, « Vont arracher pour lui les applaudissements. » Ah ! ne voulez-vous pas les forcer à se taire ?'),
  ('00c111a5-d490-4e5c-af42-0e2ec1627120', 'b8244a86-2bca-4a7a-a162-556fabbad6d7', 35, 'Viens, Narcisse : allons voir ce que nous devons faire.');

-- Acte V, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('f2891679-fe1a-43f9-a588-8579688d435a', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène première', 'Acte V', 'acte-v-scene-premiere-2', false);
insert into characters (id, scene_id, name) values ('ef351e4c-220c-4898-8849-ebef862038ff', 'f2891679-fe1a-43f9-a588-8579688d435a', 'BRITANNICUS');
insert into characters (id, scene_id, name) values ('48fe0f12-d1ad-4eda-8332-906c130bc069', 'f2891679-fe1a-43f9-a588-8579688d435a', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 1, 'Oui, madame, Néron, qui l’aurait pu penser ? Dans son appartement m’attend pour m’embrasser. Il y fait de sa cour inviter la jeunesse ;'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 2, 'Il veut que d’un festin la pompe et l’allégresse Confirment à leurs yeux la foi de nos serments, Et réchauffent l’ardeur de nos embrassements. Il éteint cet amour source de tant de haine ;'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 3, 'Il vous fait de mon sort arbitre souveraine.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 4, 'Pour moi, quoique banni du rang de mes aïeux, Quoique de leur dépouille il se pare à mes yeux, Depuis qu’à mon amour cessant d’être contraire Il semble me céder la gloire de vous plaire, Mon cœur, je l’avoûrai, lui pardonne en secret, Et lui laisse le reste avec moins de regret.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 5, 'Quoi ! je ne serai plus séparé de vos charmes ! Quoi ! même en ce moment, je puis voir sans alarmes Ces yeux que n’ont émus ni soupirs ni terreur, Qui m’ont sacrifié l’empire et l’empereur ! Ah, madame !… Mais quoi !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 6, 'Quelle nouvelle crainte Tient parmi mes transports votre joie en contrainte ? D’où vient qu’en m’écoutant, vos yeux, vos tristes yeux Avec de longs regards se tournent vers les cieux ? Qu’est-ce que vous craignez ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 7, 'Qu’est-ce que vous craignez ? Je l’ignore moi-même ; Mais je crains.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 8, 'Mais je crains. Vous m’aimez ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 9, 'Mais je crains. Vous m’aimez ? Hélas ! si je vous aime !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 10, 'Néron ne trouble plus notre félicité.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 11, 'Mais me répondez-vous de sa sincérité ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 12, 'Quoi ! vous le soupçonnez d’une haine couverte ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 13, 'Néron m’aimait tantôt, il jurait votre perte ; Il me fuit, il vous cherche ; un si grand changement Peut-il être, seigneur, l’ouvrage d’un moment ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 14, 'Cet ouvrage, madame, est un coup d’Agrippine : Elle a cru que ma perte entraînait sa ruine. Grâce aux préventions de son esprit jaloux, Nos plus grands ennemis ont combattu pour nous.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 15, 'Je m’en fie aux transports qu’elle m’a fait paraître ; Je m’en fie à Burrhus ; j’en crois même son maître : Je crois qu’à mon exemple, impuissant à trahir, Il hait à cœur ouvert, ou cesse de haïr.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 16, 'Seigneur, ne jugez pas de son cœur par le vôtre : Sur des pas différents vous marchez l’un et l’autre. Je ne connais Néron et la cour que d’un jour ; Mais, si j’ose le dire, hélas !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 17, 'dans cette cour Combien tout ce qu’on dit est loin de ce qu’on pense ! Que la bouche et le cœur sont peu d’intelligence ! Avec combien de joie on y trahit sa foi ! Quel séjour étranger et pour vous et pour moi !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 18, 'Mais que son amitié soit véritable ou feinte, Si vous craignez Néron, lui-même est-il sans crainte ? Non, non, il n’ira point, par un lâche attentat, Soulever contre lui le peuple et le sénat. Que dis-je ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 19, 'il reconnaît sa dernière injustice ; Ses remords ont paru, même aux yeux de Narcisse. Ah ! s’il vous avait dit, ma princesse, à quel point…'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 20, 'Mais Narcisse, seigneur, ne vous trahit-il point ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 21, 'Et pourquoi voulez-vous que mon cœur s’en défie ?'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 22, 'Et que sais-je ? Il y va, seigneur, de votre vie : Tout m’est suspect : je crains que tout ne soit séduit ; Je crains Néron ; je crains le malheur qui me suit.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 23, 'D’un noir pressentiment malgré moi prévenue, Je vous laisse à regret éloigner de ma vue. Hélas ! si cette paix dont vous vous repaissez Couvrait contre vos jours quelques pièges dressés ;'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 24, 'Si Néron, irrité de notre intelligence, Avait choisi la nuit pour cacher sa vengeance ; S’il préparait ses coups tandis que je vous vois ; Et si je vous parlais pour la dernière fois ! Ah, prince !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 25, 'Ah, prince ! Vous pleurez ! Ah, ma chère princesse ! Et pour moi jusque-là votre cœur s’intéresse ! Quoi, madame !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 26, 'en un jour où, plein de sa grandeur, Néron croit éblouir vos yeux de sa splendeur, Dans des lieux où chacun me fuit et le révère, Aux pompes de sa cour préférer ma misère ! Quoi !'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 27, 'dans ce même jour et dans ces mêmes lieux, Refuser un empire, et pleurer à mes yeux ! Mais, madame, arrêtez ces précieuses larmes : Mon retour va bientôt dissiper vos alarmes.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 28, 'Je me rendrais suspect par un plus long séjour : Adieu. Je vais, le cœur tout plein de mon amour, Au milieu des transports d’une aveugle jeunesse, Ne voir, n’entretenir que ma belle princesse. Adieu.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 29, 'Adieu. Prince…'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', 'ef351e4c-220c-4898-8849-ebef862038ff', 30, 'Adieu. Prince… On m’attend, madame, il faut partir.'),
  ('f2891679-fe1a-43f9-a588-8579688d435a', '48fe0f12-d1ad-4eda-8332-906c130bc069', 31, 'Mais du moins attendez qu’on vous vienne avertir.');

-- Acte V, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('a4946cc3-08e6-469a-946a-fc358636a8c7', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène II', 'Acte V', 'acte-v-scene-ii-2', false);
insert into characters (id, scene_id, name) values ('e99f32a0-a17a-4290-b58b-de796c552a81', 'a4946cc3-08e6-469a-946a-fc358636a8c7', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('723b19b6-ba5d-4a2d-a23a-4cff4d6b7286', 'a4946cc3-08e6-469a-946a-fc358636a8c7', 'BRITANNICUS');
insert into lines (scene_id, character_id, "order", text) values
  ('a4946cc3-08e6-469a-946a-fc358636a8c7', 'e99f32a0-a17a-4290-b58b-de796c552a81', 1, 'Prince, que tardez-vous ? partez en diligence. Néron impatient se plaint de votre absence. La joie et le plaisir de tous les conviés Attend, pour éclater, que vous vous embrassiez.'),
  ('a4946cc3-08e6-469a-946a-fc358636a8c7', 'e99f32a0-a17a-4290-b58b-de796c552a81', 2, 'Ne faites point languir une si juste envie ; Allez. Et nous, madame, allons chez Octavie.'),
  ('a4946cc3-08e6-469a-946a-fc358636a8c7', '723b19b6-ba5d-4a2d-a23a-4cff4d6b7286', 3, 'Allez, belle Junie ; et, d’un esprit content, Hâtez-vous d’embrasser ma sœur qui vous attend. Dès que je le pourrai, je reviens sur vos traces, Madame ; et de vos soins j’irai vous rendre grâces.');

-- Acte V, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène III', 'Acte V', 'acte-v-scene-iii', false);
insert into characters (id, scene_id, name) values ('b91905af-1a81-430f-83ed-d6001eff6043', 'f9f8f23c-962e-4de5-b4ad-452774a524d2', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('2d13bb57-c1a9-4352-873f-8ea08b18f08f', 'f9f8f23c-962e-4de5-b4ad-452774a524d2', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 1, 'Madame, ou je me trompe, ou durant vos adieux, Quelques pleurs répandus ont obscurci vos yeux. Puis-je savoir quel trouble a formé ce nuage ? Doutez-vous d’une paix dont je fais mon ouvrage ?'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', '2d13bb57-c1a9-4352-873f-8ea08b18f08f', 2, 'Après tous les ennuis que ce jour m’a coûtés, Ai-je pu rassurer mes esprits agités ? Hélas ! à peine encor je conçois ce miracle.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', '2d13bb57-c1a9-4352-873f-8ea08b18f08f', 3, 'Quand même à vos bontés je craindrais quelque obstacle, Le changement, madame, est commun à la cour ; Et toujours quelque crainte accompagne l’amour.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 4, 'Il suffit ; j’ai parlé, tout a changé de face : Mes soins à vos soupçons ne laissent point de place. Je réponds d’une paix jurée entre mes mains ; Néron m’en a donné des gages trop certains. Ah !'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 5, 'si vous aviez vu par combien de caresses Il m’a renouvelé la foi de ses promesses ; Par quels embrassements il vient de m’arrêter ! Ses bras, dans nos adieux, ne pouvaient me quitter.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 6, 'Sa facile bonté, sur son front répandue, Jusqu’aux moindres secrets est d’abord descendue : Il s’épanchait en fils qui vient en liberté Dans le sein de sa mère oublier sa fierté.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 7, 'Mais bientôt reprenant un visage sévère, Tel que d’un empereur qui consulte sa mère, Sa confidence auguste a mis entre mes mains Des secrets d’où dépend le destin des humains.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 8, 'Non, il le faut ici confesser à sa gloire, Son cœur n’enferme point une malice noire ; Et nos seuls ennemis, altérant sa bonté, Abusaient contre nous de sa facilité : Mais enfin, à son tour, leur puissance décline ;'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 9, 'Rome encore une fois va connaître Agrippine ; Déjà de ma faveur on adore le bruit.'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', 'b91905af-1a81-430f-83ed-d6001eff6043', 10, 'Cependant en ces lieux n’attendons pas la nuit : Passons chez Octavie, et donnons-lui le reste D’un jour autant heureux que je l’ai cru funeste. Mais qu’est-ce que j’entends ? Quel tumulte confus ! Que peut-on faire ?'),
  ('f9f8f23c-962e-4de5-b4ad-452774a524d2', '2d13bb57-c1a9-4352-873f-8ea08b18f08f', 11, 'Que peut-on faire ? Ô ciel, sauvez Britannicus !');

-- Acte V, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène IV', 'Acte V', 'acte-v-scene-iv', false);
insert into characters (id, scene_id, name) values ('8382735f-30f0-4290-8cda-2e71b3808cea', '01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('c96b07c6-688c-4007-8df7-f8df931115cd', '01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'BURRHUS');
insert into characters (id, scene_id, name) values ('bd8b5c06-12e5-4061-8ff3-adf0f0324b5f', '01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'JUNIE');
insert into lines (scene_id, character_id, "order", text) values
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', '8382735f-30f0-4290-8cda-2e71b3808cea', 1, 'Burrhus, où courez-vous ? Arrêtez. Que veut dire…'),
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'c96b07c6-688c-4007-8df7-f8df931115cd', 2, 'Madame, c’en est fait, Britannicus expire.'),
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'bd8b5c06-12e5-4061-8ff3-adf0f0324b5f', 3, 'Ah ! mon prince !'),
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', '8382735f-30f0-4290-8cda-2e71b3808cea', 4, 'Ah ! mon prince ! Il expire ?'),
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'c96b07c6-688c-4007-8df7-f8df931115cd', 5, 'Ah ! mon prince ! Il expire ? Ou plutôt il est mort, Madame.'),
  ('01e3568c-f9e8-4334-bc0e-9c8cb76b18de', 'bd8b5c06-12e5-4061-8ff3-adf0f0324b5f', 6, 'Madame. Pardonnez, madame, à ce transport, Je vais le secourir, si je puis, ou le suivre.');

-- Acte V, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène V', 'Acte V', 'acte-v-scene-v-2', false);
insert into characters (id, scene_id, name) values ('79c52b49-171a-4ac3-95c0-4c5a295dbc74', 'a1a3d183-ff0e-4b50-b11f-f076e69c4e36', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 'a1a3d183-ff0e-4b50-b11f-f076e69c4e36', 'BURRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '79c52b49-171a-4ac3-95c0-4c5a295dbc74', 1, 'Quel attentat, Burrhus !'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 2, 'Quel attentat, Burrhus ! Je n’y pourrai survivre, Madame ; il faut quitter la cour et l’empereur.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '79c52b49-171a-4ac3-95c0-4c5a295dbc74', 3, 'Quoi ! du sang de son frère il n’a point eu d’horreur !'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 4, 'Ce dessein s’est conduit avec plus de mystère. À peine l’empereur a vu venir son frère, Il se lève, il l’embrasse, on se tait ;'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 5, 'et soudain César prend le premier une coupe à la main : « Pour achever ce jour sous de meilleurs auspices, « Ma main de cette coupe épanche les prémices, « Dit-il.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 6, 'Dieux, que j’appelle à cette effusion, « Venez favoriser notre réunion. » Par les mêmes serments Britannicus se lie. La coupe dans ses mains par Narcisse est remplie ;'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 7, 'Mais ses lèvres à peine en ont touché les bords, Le fer ne produit point de si puissants efforts, Madame : la lumière à ses yeux est ravie ; Il tombe sur son lit sans chaleur et sans vie.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 8, 'Jugez combien ce coup frappe tous les esprits. La moitié s’épouvante et sort avec des cris ; Mais ceux qui de la cour ont un plus long usage, Sur les yeux de César composent leur visage.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 9, 'Cependant sur son lit il demeure penché ; D’aucun étonnement il ne paraît touché ; « Ce mal dont vous craignez, dit-il, la violence, « A souvent sans péril attaqué son enfance.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 10, '» Narcisse veut en vain affecter quelque ennui, Et sa perfide joie éclate malgré lui. Pour moi, dût l’empereur punir ma hardiesse, D’une odieuse cour j’ai traversé la presse ;'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '112dc6d3-9d7e-4a87-8a87-af43e4fb2d24', 11, 'Et j’allais, accablé de cet assassinat, Pleurer Britannicus, César et tout l’État.'),
  ('a1a3d183-ff0e-4b50-b11f-f076e69c4e36', '79c52b49-171a-4ac3-95c0-4c5a295dbc74', 12, 'Le voici. Vous verrez si c’est moi qui l’inspire.');

-- Acte V, Scène VI
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène VI', 'Acte V', 'acte-v-scene-vi-3', false);
insert into characters (id, scene_id, name) values ('5cdd8833-710e-49e5-b9b0-ae841ddc1e34', '3b51f506-23d7-4688-b268-e2b806ddeea5', 'NÉRON');
insert into characters (id, scene_id, name) values ('6dd4e115-5256-4dc7-96f4-9fe156958f49', '3b51f506-23d7-4688-b268-e2b806ddeea5', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('25d1868b-2359-4b69-91b5-ba553adf68ef', '3b51f506-23d7-4688-b268-e2b806ddeea5', 'NARCISSE');
insert into lines (scene_id, character_id, "order", text) values
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 1, 'Dieux !'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 2, 'Dieux ! Arrêtez, Néron : j’ai deux mots à vous dire. Britannicus est mort : je reconnais les coups ; Je connais l’assassin.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 3, 'Je connais l’assassin. Et qui, madame ?'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 4, 'Je connais l’assassin. Et qui, madame ? Vous.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 5, 'Moi ! Voilà les soupçons dont vous êtes capable. Il n’est point de malheur dont je ne sois coupable. Et, si l’on veut, madame, écouter vos discours, Ma main de Claude même aura tranché les jours.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 6, 'Son fils vous était cher, sa mort peut vous confondre ; Mais des coups du destin je ne puis pas répondre.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 7, 'Non, non, Britannicus est mort empoisonné ; Narcisse a fait le coup, vous l’avez ordonné.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 8, 'Madame !… Mais qui peut vous tenir ce langage ?'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '25d1868b-2359-4b69-91b5-ba553adf68ef', 9, 'Eh, seigneur ! ce soupçon vous fait-il tant d’outrage ? Britannicus, madame, eut des desseins secrets Qui vous auraient coûté de plus justes regrets : Il aspirait plus loin qu’à l’hymen de Junie ;'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '25d1868b-2359-4b69-91b5-ba553adf68ef', 10, 'De vos propres bontés il vous aurait punie. Il vous trompait vous-même ; et son cœur offensé Prétendait tôt ou tard rappeler le passé.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '25d1868b-2359-4b69-91b5-ba553adf68ef', 11, 'Soit donc que malgré vous le sort vous ait servie, Soit qu’instruit des complots qui menaçaient sa vie, Sur ma fidélité César s’en soit remis, Laissez les pleurs, madame, à vos seuls ennemis : Qu’ils mettent ce malheur au rang des plus sinistres : Mais vous…'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 12, 'Mais vous… Poursuis, Néron : avec de tels ministres, Par des faits glorieux tu te vas signaler ; Poursuis. Tu n’as pas fait ce pas pour reculer : Ta main a commencé par le sang de ton frère ;'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 13, 'Je prévois que tes coups viendront jusqu’à ta mère. Dans le fond de ton cœur je sais que tu me hais ; Tu voudras t’affranchir du joug de mes bienfaits.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 14, 'Mais je veux que ma mort te soit même inutile : Ne crois pas qu’en mourant je te laisse tranquille ; Rome, ce ciel, ce jour que tu reçus de moi, Partout, à tout moment, m’offriront devant toi.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 15, 'Tes remords te suivront comme autant de furies ; Tu croiras les calmer par d’autres barbaries ; Ta fureur s’irritant soi-même dans son cours, D’un sang toujours nouveau marquera tous tes jours.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 16, 'Mais j’espère qu’enfin le ciel, las de tes crimes, Ajoutera ta perte à tant d’autres victimes ; Qu’après t’être couvert de leur sang et du mien Tu te verras forcé de répandre le tien ;'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '6dd4e115-5256-4dc7-96f4-9fe156958f49', 17, 'Et ton nom paraîtra, dans la race future, Aux plus cruels tyrans une cruelle injure. Voilà ce que mon cœur se présage de toi. Adieu : tu peux sortir.'),
  ('3b51f506-23d7-4688-b268-e2b806ddeea5', '5cdd8833-710e-49e5-b9b0-ae841ddc1e34', 18, 'Adieu : tu peux sortir. Narcisse, suivez-moi.');

-- Acte V, Scène VII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('5655a9b4-75da-4655-bf91-e52d186eb801', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène VII', 'Acte V', 'acte-v-scene-vii-3', false);
insert into characters (id, scene_id, name) values ('4ba978c8-8f06-4afa-9673-a0aaa8004c39', '5655a9b4-75da-4655-bf91-e52d186eb801', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('f6b01075-bad3-4b53-bbb1-171b2788e3ea', '5655a9b4-75da-4655-bf91-e52d186eb801', 'BURRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('5655a9b4-75da-4655-bf91-e52d186eb801', '4ba978c8-8f06-4afa-9673-a0aaa8004c39', 1, 'Ah ciel ! de mes soupçons quelle était l’injustice ! Je condamnais Burrhus pour écouter Narcisse ! Burrhus, avez-vous vu quels regards furieux Néron en me quittant m’a laissés pour adieux ?'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', '4ba978c8-8f06-4afa-9673-a0aaa8004c39', 2, 'C’en est fait, le cruel n’a plus rien qui l’arrête ; Le coup qu’on m’a prédit va tomber sur ma tête. Il vous accablera vous-même à votre tour.'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', 'f6b01075-bad3-4b53-bbb1-171b2788e3ea', 3, 'Ah, madame ! pour moi, j’ai vécu trop d’un jour. Plût au ciel que sa main, heureusement cruelle, Eût fait sur moi l’essai de sa fureur nouvelle !'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', 'f6b01075-bad3-4b53-bbb1-171b2788e3ea', 4, 'Qu’il ne m’eût pas donné, par ce triste attentat, Un gage trop certain des malheurs de l’État ! Son crime seul n’est pas ce qui me désespère ;'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', 'f6b01075-bad3-4b53-bbb1-171b2788e3ea', 5, 'Sa jalousie a pu l’armer contre son frère : Mais s’il vous faut, madame, expliquer ma douleur ;'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', 'f6b01075-bad3-4b53-bbb1-171b2788e3ea', 6, 'Néron l’a vu mourir sans changer de couleur, Ses yeux indifférents ont déjà la constance D’un tyran dans le crime endurci dès l’enfance.'),
  ('5655a9b4-75da-4655-bf91-e52d186eb801', 'f6b01075-bad3-4b53-bbb1-171b2788e3ea', 7, 'Qu’il achève, madame, et qu’il fasse périr Un ministre importun qui ne le peut souffrir. Hélas ! loin de vouloir éviter sa colère, La plus soudaine mort me sera la plus chère.');

-- Acte V, Scène VIII
insert into scenes (id, work_id, author, title, chapter, slug, is_private) values
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', '7a3e701b-b594-4ca4-a6dc-e34722ab6ca5', 'Jean Racine', 'Acte V, Scène VIII', 'Acte V', 'acte-v-scene-viii', false);
insert into characters (id, scene_id, name) values ('ce93a2f6-91b2-4638-827f-d093358b7808', '99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ALBINE');
insert into characters (id, scene_id, name) values ('b18ffb5e-d9bb-4521-99bb-5d8d5070e0e2', '99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'AGRIPPINE');
insert into characters (id, scene_id, name) values ('738b0e47-7873-4cb3-bd10-e0a43768b9c6', '99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'BURRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 1, 'Ah, madame ! ah, seigneur ! courez vers l’empereur ; Venez sauver César de sa propre fureur ; Il se voit pour jamais séparé de Junie.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'b18ffb5e-d9bb-4521-99bb-5d8d5070e0e2', 2, 'Quoi ! Junie elle-même a terminé sa vie ?'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 3, 'Pour accabler César d’un éternel ennui, Madame, sans mourir elle est morte pour lui, Vous savez de ces lieux comme elle s’est ravie : Elle a feint de passer chez la triste Octavie, Mais bientôt elle a pris des chemins écartés, Où mes yeux ont suivi ses pas précipités.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 4, 'Des portes du palais elle sort éperdue. D’abord elle a d’Auguste aperçu la statue ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 5, 'Et mouillant de ses pleurs le marbre de ses pieds, Que de ses bras pressants elle tenait liés : « Prince, par ces genoux, dit-elle, que j’embrasse, « Protége en ce moment le reste de ta race ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 6, '« Rome, dans ton palais, vient de voir immoler « Le seul de tes neveux qui te pût ressembler. « On veut après sa mort que je lui sois parjure ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 7, '« Mais pour lui conserver une foi toujours pure, « Prince, je me dévoue à ces dieux immortels « Dont ta vertu t’a fait partager les autels.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 8, '» Le peuple, cependant, que ce spectacle étonne, Vole de toutes parts, se presse, l’environne, S’attendrit à ses pleurs, et plaignant son ennui, D’une commune voix la prend sous son appui ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 9, 'Ils la mènent au temple où depuis tant d’années Au culte des autels nos vierges destinées Gardent fidèlement le dépôt précieux Du feu toujours ardent qui brûle pour nos dieux César les voit partir sans oser les distraire.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 10, 'Narcisse, plus hardi, s’empresse pour lui plaire Il vole vers Junie, et, sans s’épouvanter, D’une profane main commence à l’arrêter. De mille coups mortels son audace est punie ; Son infidèle sang rejaillit sur Junie.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 11, 'César, de tant d’objets en même temps frappé, Le laisse entre les mains qui l’ont enveloppé. Il rentre. Chacun fuit son silence farouche ; Le nom seul de Junie échappe de sa bouche. Il marche sans dessein ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 12, 'ses yeux mal assurés N’osent lever au ciel leurs regards égarés ;'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 13, 'Et l’on craint, si la nuit jointe à la solitude Vient de son désespoir aigrir l’inquiétude, Si vous l’abandonnez plus longtemps sans secours, Que sa douleur bientôt n’attente sur ses jours. Le temps presse : courez.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'ce93a2f6-91b2-4638-827f-d093358b7808', 14, 'Il ne faut qu’un caprice ; Il se perdrait, madame.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', 'b18ffb5e-d9bb-4521-99bb-5d8d5070e0e2', 15, 'Il se perdrait, madame. Il se ferait justice. Mais, Burrhus, allons voir jusqu’où vont ses transports : Voyons quel changement produiront ses remords ; S’il voudra désormais suivre d’autres maximes.'),
  ('99a90573-9da6-4f6c-a3e5-5a99ca79d268', '738b0e47-7873-4cb3-bd10-e0a43768b9c6', 16, 'Plût aux dieux que ce fût le dernier de ses crimes !');

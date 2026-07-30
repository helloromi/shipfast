-- Andromaque : remplacement de l'édition Girard 1668 (orthographe d'Ancien Régime —
-- « ſ » long, « & » pour et, PYRRHVS/ANDROMAQVE — relevée en G5 par l'audit du
-- 30/07/2026) par l'édition Didot 1854, la même que Britannicus, Bérénice et Phèdre.
--
-- Corrige simultanément trois constats de l'audit :
--   G5 — les 8 scènes publiées étaient toutes en orthographe 1668, donc illisibles
--        et inutilisables pour apprendre un texte.
--   G6 — CEPHISE/CÉPHISE et HERMIONE/HERMIONNE coexistaient, y compris au sein
--        d'une même scène. L'édition Didot ne porte qu'une graphie par personnage.
--   G4 — « acte-iv-scene-5 » n'était pas l'acte IV scène 5 mais l'acte V scène 3
--        (récit de la mort de Pyrrhus par Oreste). Collationné contre Didot 1854 :
--        confirmé. Son URL est versée dans previous_slugs de acte-v-scene-iii et
--        redirige donc en 308 vers la scène correctement titrée.
--
-- La pièce passe de 9 à 28 scènes : l'intégralité d'Andromaque (I=4, II=5, III=8,
-- IV=6, V=5). Les 4 scènes à un seul personnage — dont le monologue d'Hermione
-- « Où suis-je ? Qu'ai-je fait ? » (V,1) — étaient écartées par le seuil de
-- 2 répliques du parser Wikisource, corrigé dans le même lot.
--
-- Vérifié avant écriture : 0 session d'apprentissage, 0 feedback, 0 surlignage,
-- 0 accès œuvre, 0 scène de classe et 0 copie perso ne pointent sur ces 9 scènes
-- (relevé le 30/07/2026). Les 8 slugs existants sont reconduits à l'identique :
-- aucune URL indexée ne se perd.
--
-- Source : https://fr.wikisource.org/wiki/Andromaque_(Racine,_éditions_Didot,_1854)
-- Contrôles passés sur le JSON généré : aucun marqueur d'orthographe 1668, une
-- seule graphie par personnage, 5 actes renseignés, 0 scène sans chapter.

delete from scenes where work_id = '8c090f49-81d4-499f-a3b7-cdaf9826dd02';


-- Acte I, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte I, Scène première', 'Acte I', 'acte-i-scene-premiere', array['acte-i-scene-premiere-2']::text[], false);
insert into characters (id, scene_id, name) values ('06f859ea-ae83-4c68-b2d3-fee9e74aff32', 'fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', 'ORESTE');
insert into characters (id, scene_id, name) values ('0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 'fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', 'PYLADE');
insert into lines (scene_id, character_id, "order", text) values
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 1, 'Oui, puisque je retrouve un ami si fidèle, Ma fortune va prendre une face nouvelle ; Et déjà son courroux semble s’être adouci Depuis qu’elle a pris soin de nous rejoindre ici.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 2, 'Qui l’eût dit, qu’un rivage à mes vœux si funeste, Présenterait d’abord Pylade aux yeux d’Oreste ; Qu’après plus de six mois que je t’avais perdu, À la cour de Pyrrhus tu me serais rendu ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 3, 'J’en rends grâces au ciel, qui, m’arrêtant sans cesse, Semblait m’avoir fermé le chemin de la Grèce, Depuis le jour fatal que la fureur des eaux, Presque aux yeux de l’Épire, écarta nos vaisseaux.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 4, 'Combien, dans cet exil, ai-je souffert d’alarmes ! Combien à vos malheurs ai-je donné de larmes, Craignant toujours pour vous quelque nouveau danger Que ma triste amitié ne pouvait partager !'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 5, 'Surtout je redoutais cette mélancolie Où j’ai vu si longtemps votre âme ensevelie ; Je craignais que le ciel, par un cruel secours, Ne vous offrît la mort que vous cherchiez toujours. Mais je vous vois, seigneur ;'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 6, 'et, si j’ose le dire, Un destin plus heureux vous conduit en Épire : Le pompeux appareil qui suit ici vos pas N’est point d’un malheureux qui cherche le trépas.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 7, 'Hélas ! qui peut savoir le destin qui m’amène ? L’amour me fait ici chercher une inhumaine ; Mais qui sait ce qu’il doit ordonner de mon sort, Et si je viens chercher ou la vie ou la mort ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 8, 'Quoi ! votre âme à l’Amour en esclave asservie Se repose sur lui du soin de votre vie ? Par quel charme, oubliant tant de tourments soufferts, Pouvez-vous consentir à rentrer dans ses fers ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 9, 'Pensez-vous qu’Hermione, à Sparte inexorable, Vous prépare en Épire un sort plus favorable ? Honteux d’avoir poussé tant de vœux superflus, Vous l’abhorriez ;'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 10, 'enfin, vous ne m’en parliez plus : Vous me trompiez, seigneur.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 11, 'Vous me trompiez, seigneur. Je me trompais moi-même ! Ami, n’accable point un malheureux qui t’aime : T’ai-je jamais caché mon cœur et mes désirs ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 12, 'Tu vis naître ma flamme et mes premiers soupirs : Enfin, quand Ménélas disposa de sa fille En faveur de Pyrrhus, vengeur de sa famille, Tu vis mon désespoir ;'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 13, 'et tu m’as vu depuis Traîner de mers en mers ma chaîne et mes ennuis.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 14, 'Je te vis à regret, en cet état funeste, Prêt à suivre partout le déplorable Oreste, Toujours de ma fureur interrompre le cours, Et de moi-même enfin me sauver tous les jours.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 15, 'Mais quand je me souvins que, parmi tant d’alarmes, Hermione à Pyrrhus prodiguait tous ses charmes, Tu sais de quel courroux mon cœur alors épris Voulut en l’oubliant punir tous ses mépris.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 16, 'Je fis croire et je crus ma victoire certaine : Je pris tous mes transports pour des transports de haine : Détestant ses rigueurs, rabaissant ses attraits, Je défiais ses yeux de me troubler jamais.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 17, 'Voilà comme je crus étouffer ma tendresse. En ce calme trompeur j’arrivai dans la Grèce ; Et je trouvai d’abord ses princes rassemblés, Qu’un péril assez grand semblait avoir troublés. J’y courus.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 18, 'Je pensai que la guerre et la gloire De soins plus importants rempliraient ma mémoire ; Que mes sens reprenant leur première vigueur, L’amour achèverait de sortir de mon cœur.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 19, 'Mais admire avec moi le sort, dont la poursuite Me fait courir alors au piége que j’évite. J’entends de tous côtés qu’on menace Pyrrhus ;'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 20, 'Toute la Grèce éclate en murmures confus : On se plaint qu’oubliant son rang et sa promesse, Il élève en sa cour l’ennemi de la Grèce, Astyanax, d’Hector jeune et malheureux fils, Reste de tant de rois sous Troie ensevelis.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 21, 'J’apprends que pour ravir son enfance au supplice, Andromaque trompa l’ingénieux Ulysse, Tandis qu’un autre enfant, arraché de ses bras, Sous le nom de son fils fut conduit au trépas.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 22, 'On dit que, peu sensible aux charmes d’Hermione, Mon rival porte ailleurs son cœur et sa couronne. Ménélas, sans le croire, en paraît affligé, Et se plaint d’un hymen si longtemps négligé.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 23, 'Parmi les déplaisirs où son âme se noie, Il s’élève en la mienne une secrète joie : Je triomphe ; et pourtant je me flatte d’abord Que la seule vengeance excite ce transport.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 24, 'Mais l’ingrate en mon cœur reprit bientôt sa place : De mes feux mal éteints je reconnus la trace ; Je sentis que ma haine allait finir son cours ; Ou plutôt je sentis que je l’aimais toujours.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 25, 'Ainsi de tous les Grecs je brigue le suffrage. On m’envoie à Pyrrhus : j’entreprends ce voyage. Je viens voir si l’on peut arracher de ses bras Cet enfant dont la vie alarme tant d’États.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 26, 'Heureux si je pouvais, dans l’ardeur qui me presse, Au lieu d’Astyanax lui ravir ma princesse ! Car enfin n’attends pas que mes feux redoublés Des périls les plus grands puissent être troublés.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 27, 'Puisque après tant d’efforts ma résistance est vaine, Je me livre en aveugle au transport qui m’entraîne. J’aime : je viens chercher Hermione en ces lieux, La fléchir, l’enlever, ou mourir à ses yeux.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 28, 'Toi qui connais Pyrrhus, que penses-tu qu’il fasse ? Dans sa cour, dans son cœur, dis-moi ce qui se passe. Mon Hermione encor le tient-elle asservi ? Me rendra-t-il, Pylade, un bien qu’il m’a ravi ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 29, 'Je vous abuserais, si j’osais vous promettre Qu’entre vos mains, seigneur, il voulût la remettre : Non que de sa conquête il paraisse flatté. Pour la veuve d’Hector ses feux ont éclaté ;'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 30, 'Il l’aime : mais enfin cette veuve inhumaine N’a payé jusqu’ici son amour que de haine ; Et chaque jour encore on lui voit tout tenter Pour fléchir sa captive, ou pour l’épouvanter.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 31, 'De son fils qu’il lui cache il menace la tête, Et fait couler des pleurs qu’aussitôt il arrête.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 32, 'Hermione elle-même a vu plus de cent fois Cet amant irrité revenir sous ses lois, Et de ses vœux troublés lui rapportant l’hommage, Soupirer à ses pieds moins d’amour que de rage.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 33, 'Ainsi n’attendez pas que l’on puisse aujourd’hui Vous répondre d’un cœur si peu maître de lui : Il peut, seigneur, il peut, dans ce désordre extrême, Épouser ce qu’il hait, et perdre ce qu’il aime.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 34, 'Mais dis-moi de quel œil Hermione peut voir Son hymen différé, ses charmes sans pouvoir ?'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 35, 'Hermione, seigneur, au moins en apparence, Semble de son amant dédaigner l’inconstance, Et croit que, trop heureux de fléchir sa rigueur, Il la viendra presser de reprendre son cœur.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 36, 'Mais je l’ai vue enfin me confier ses larmes : Elle pleure en secret le mépris de ses charmes ; Toujours prête à partir, et demeurant toujours, Quelquefois elle appelle Oreste à son secours.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 37, 'Ah ! si je le croyais, j’irais bientôt, Pylade, Me jeter…'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 38, 'Me jeter… Achevez, seigneur, votre ambassade. Vous attendez le roi : parlez, et lui montrez Contre le fils d’Hector tous les Grecs conjurés.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '0cc05201-fb7c-4d0f-ad68-68c9ced9656b', 39, 'Loin de leur accorder ce fils de sa maîtresse, Leur haine ne fera qu’irriter sa tendresse. Plus on les veut brouiller, plus on va les unir. Pressez : demandez tout, pour ne rien obtenir. Il vient.'),
  ('fa8ee81d-9c5f-4040-a2f3-2c96a2fa47de', '06f859ea-ae83-4c68-b2d3-fee9e74aff32', 40, 'Il vient. Eh bien ! va donc disposer la cruelle À revoir un amant qui ne vient que pour elle.');

-- Acte I, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte I, Scène II', 'Acte I', 'acte-i-scene-ii', '{}', false);
insert into characters (id, scene_id, name) values ('83d77172-7f4e-4dc0-994e-269295eb064e', 'bf292c47-b408-4180-81f3-fc22d563a7a1', 'ORESTE');
insert into characters (id, scene_id, name) values ('4faf4063-c3d6-4d5a-876b-2126ea37606e', 'bf292c47-b408-4180-81f3-fc22d563a7a1', 'PYRRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 1, 'Avant que tous les Grecs vous parlent par ma voix, Souffrez que j’ose ici me flatter de leur choix, Et qu’à vos yeux, seigneur, je montre quelque joie De voir le fils d’Achille et le vainqueur de Troie.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 2, 'Oui, comme ses exploits nous admirons vos coups. Hector tomba sous lui, Troie expira sous vous ; Et vous avez montré, par une heureuse audace, Que le fils seul d’Achille a pu remplir sa place.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 3, 'Mais, ce qu’il n’eût point fait, la Grèce avec douleur Vous voit du sang troyen relever le malheur, Et vous laissant toucher d’une pitié funeste, D’une guerre si longue entretenir le reste.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 4, 'Ne vous souvient-il plus, seigneur, quel fut Hector ? Nos peuples affaiblis s’en souviennent encor. Son nom seul fait frémir nos veuves et nos filles ;'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 5, 'Et dans toute la Grèce il n’est point de familles Qui ne demandent compte à ce malheureux fils D’un père ou d’un époux qu’Hector leur a ravis. Et qui sait ce qu’un jour ce fils peut entreprendre ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 6, 'Peut-être dans nos ports nous le verrons descendre, Tel qu’on a vu son père, embraser nos vaisseaux Et la flamme à la main, les suivre sur les eaux. Oserai-je, seigneur, dire ce que je pense ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 7, 'Vous-même de vos soins craignez la récompense, Et que dans votre sein ce serpent élevé Ne vous punisse un jour de l’avoir conservé.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 8, 'Enfin de tous les Grecs satisfaites l’envie, Assurez leur vengeance, assurez votre vie : Perdez un ennemi d’autant plus dangereux, Qu’il s’essaiera sur vous à combattre contre eux.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 9, 'La Grèce en ma faveur est trop inquiétée : De soins plus importants je l’ai crue agitée, Seigneur ; et, sur le nom de son ambassadeur, J’avais dans ses projets conçu plus de grandeur.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 10, 'Qui croirait en effet qu’une telle entreprise Du fils d’Agamemnon méritât l’entremise ; Qu’un peuple tout entier, tant de fois triomphant, N’eût daigné conspirer que la mort d’un enfant ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 11, 'Mais à qui prétend-on que je le sacrifie ? La Grèce a-t-elle encor quelque droit sur sa vie ? Et, seul de tous les Grecs, ne m’est-il pas permis D’ordonner d’un captif que le sort m’a soumis ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 12, 'Oui, seigneur, lorsqu’au pied des murs fumants de Troie Les vainqueurs tout sanglants partagèrent leur proie, Le sort, dont les arrêts furent alors suivis, Fit tomber en mes mains Andromaque et son fils.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 13, 'Hécube près d’Ulysse acheva sa misère ; Cassandre dans Argos a suivi votre père. Sur eux, sur leurs captifs, ai-je étendu mes droits ? Ai-je enfin disposé du fruit de leurs exploits ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 14, 'On craint qu’avec Hector Troie un jour ne renaisse : Son fils peut me ravir le jour que je lui laisse. Seigneur, tant de prudence entraîne trop de soin : Je ne sais point prévoir les malheurs de si loin.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 15, 'Je songe quelle était autrefois cette ville Si superbe en remparts, en héros si fertile, Maîtresse de l’Asie ;'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 16, 'et je regarde enfin Quel fut le sort de Troie, et quel est son destin : Je ne vois que des tours que la cendre a couvertes, Un fleuve teint de sang, des campagnes désertes, Un enfant dans les fers ;'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 17, 'et je ne puis songer Que Troie en cet état aspire à se venger. Ah ! si du fils d’Hector la perte était jurée, Pourquoi d’un an entier l’avons-nous différée ? Dans le sein de Priam n’a-t-on pu l’immoler ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 18, 'Sous tant de morts, sous Troie, il fallait l’accabler. Tout était juste alors : la vieillesse et l’enfance En vain sur leur faiblesse appuyaient leur défense ;'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 19, 'La victoire et la nuit, plus cruelles que nous, Nous excitaient au meurtre, et confondaient nos coups. Mon courroux aux vaincus ne fut que trop sévère.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 20, 'Mais que ma cruauté survive à ma colère, Que, malgré la pitié dont je me sens saisir, Dans le sang d’un enfant je me baigne à loisir ? Non, seigneur : que les Grecs cherchent quelque autre proie ;'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 21, 'Qu’ils poursuivent ailleurs ce qui reste de Troie : De mes inimitiés le cours est achevé ; L’Épire sauvera ce que Troie a sauvé.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 22, 'Seigneur, vous savez trop avec quel artifice Un faux Astyanax fut offert au supplice Où le seul fils d’Hector devait être conduit. Ce n’est pas les Troyens, c’est Hector qu’on poursuit.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 23, 'Oui, les Grecs sur le fils persécutent le père, Il a par trop de sang acheté leur colère. Ce n’est que dans le sien qu’elle peut expirer ; Et jusque dans l’Épire il les peut attirer : Prévenez-les.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 24, 'Prévenez-les. Non, non. J’y consens avec joie ! Qu’ils cherchent dans l’Épire une seconde Troie, Qu’ils confondent leur haine, et ne distinguent plus Le sang qui les fit vaincre, et celui des vaincus.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 25, 'Aussi bien ce n’est pas la première injustice Dont la Grèce d’Achille a payé le service. Hector en profita, seigneur ; et quelque jour Son fils en pourrait bien profiter à son tour.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 26, 'Ainsi la Grèce en vous trouve un enfant rebelle ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 27, 'Et je n’ai donc vaincu que pour dépendre d’elle ?'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '83d77172-7f4e-4dc0-994e-269295eb064e', 28, 'Hermione, seigneur, arrêtera vos coups : Ses yeux s’opposeront entre son père et vous.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 29, 'Hermione, seigneur, peut m’être toujours chère ; Je puis l’aimer, sans être esclave de son père ; Et je saurai peut-être accorder quelque jour Les soins de ma grandeur et ceux de mon amour.'),
  ('bf292c47-b408-4180-81f3-fc22d563a7a1', '4faf4063-c3d6-4d5a-876b-2126ea37606e', 30, 'Vous pouvez cependant voir la fille d’Hélène : Du sang qui vous unit je sais l’étroite chaîne. Après cela, seigneur, je ne vous retiens plus, Et vous pourrez aux Grecs annoncer mon refus.');

-- Acte I, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte I, Scène III', 'Acte I', 'acte-i-scene-iii', '{}', false);
insert into characters (id, scene_id, name) values ('51ae61b1-a0b2-48ca-a2c3-09d0933d8ec1', '653bf874-5a5f-4ac5-804c-8078564f0688', 'PHŒNIX');
insert into characters (id, scene_id, name) values ('240dc27c-abab-4c55-90e7-bc0797849a85', '653bf874-5a5f-4ac5-804c-8078564f0688', 'PYRRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '51ae61b1-a0b2-48ca-a2c3-09d0933d8ec1', 1, 'Ainsi vous l’envoyez aux pieds de sa maîtresse !'),
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '240dc27c-abab-4c55-90e7-bc0797849a85', 2, 'On dit qu’il a longtemps brûlé pour la princesse.'),
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '51ae61b1-a0b2-48ca-a2c3-09d0933d8ec1', 3, 'Mais si ce feu, seigneur, vient à se rallumer, S’il lui rendait son cœur, s’il s’en faisait aimer ?'),
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '240dc27c-abab-4c55-90e7-bc0797849a85', 4, 'Ah ! qu’ils s’aiment, Phœnix ! J’y consens : qu’elle parte : Que, charmés l’un de l’autre, ils retournent à Sparte ; Tous nos ports sont ouverts et pour elle et pour lui. Qu’elle m’épargnerait de contrainte et d’ennui !'),
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '51ae61b1-a0b2-48ca-a2c3-09d0933d8ec1', 5, 'Seigneur…'),
  ('653bf874-5a5f-4ac5-804c-8078564f0688', '240dc27c-abab-4c55-90e7-bc0797849a85', 6, 'Seigneur… Une autre fois je t’ouvrirai mon âme ; Andromaque paraît.');

-- Acte I, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte I, Scène IV', 'Acte I', 'acte-i-scene-iv', '{}', false);
insert into characters (id, scene_id, name) values ('f286ed49-d7b9-4bcb-96bd-10ab248a8700', '166d06a7-f71d-42d4-9275-f09547bef9e9', 'PYRRHUS');
insert into characters (id, scene_id, name) values ('99416d14-f99e-4b2a-ab07-6fefaf5bec1e', '166d06a7-f71d-42d4-9275-f09547bef9e9', 'ANDROMAQUE');
insert into lines (scene_id, character_id, "order", text) values
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 1, 'Andromaque paraît. Me cherchiez-vous, madame ? Un espoir si charmant me serait-il permis ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 2, 'Je passais jusqu’aux lieux où l’on garde mon fils.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 3, 'Puisqu’une fois le jour vous souffrez que je voie Le seul bien qui me reste et d’Hector et de Troie, J’allais, seigneur, pleurer un moment avec lui : Je ne l’ai point encore embrassé d’aujourd’hui !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 4, 'Ah ! madame, les Grecs, si j’en crois leurs alarmes, Vous donneront bientôt d’autres sujets de larmes.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 5, 'Et quelle est cette peur dont leur cœur est frappé, Seigneur ? Quelque Troyen vous est-il échappé ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 6, 'Leur haine pour Hector n’est pas encore éteinte : Ils redoutent son fils.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 7, 'Ils redoutent son fils. Digne objet de leur crainte ! Un enfant malheureux, qui ne sait pas encor Que Pyrrhus est son maître, et qu’il est fils d’Hector !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 8, 'Tel qu’il est, tous les Grecs demandent qu’il périsse. Le fils d’Agamemnon vient hâter son supplice.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 9, 'Et vous prononcerez un arrêt si cruel ? Est-ce mon intérêt qui le rend criminel ? Hélas ! on ne craint point qu’il venge un jour son père ; On craint qu’il n’essuyât les larmes de sa mère.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 10, 'Il m’aurait tenu lieu d’un père et d’un époux ; Mais il me faut tout perdre, et toujours par vos coups.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 11, 'Madame, mes refus ont prévenu vos larmes. Tous les Grecs m’ont déjà menacé de leurs armes ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 12, 'Mais, dussent-ils encore, en repassant les eaux, Demander votre fils avec mille vaisseaux, Coûtât-il tout le sang qu’Hélène a fait répandre, Dussé-je après dix ans voir mon palais en cendre, Je ne balance point, je vole à son secours, Je défendrai sa vie aux dépens de mes jours.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 13, 'Mais, parmi ces périls où je cours pour vous plaire, Me refuserez-vous un regard moins sévère ? Haï de tous les Grecs, pressé de tous côtés, Me faudra-t-il combattre encor vos cruautés ? Je vous offre mon bras.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 14, 'Puis-je espérer encore Que vous accepterez un cœur qui vous adore ? En combattant pour vous, me sera-t-il permis De ne vous point compter parmi mes ennemis ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 15, 'Seigneur, que faites-vous, et que dira la Grèce ? Faut-il qu’un si grand cœur montre tant de faiblesse ? Voulez-vous qu’un dessein si beau, si généreux, Passe pour le transport d’un esprit amoureux ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 16, 'Captive, toujours triste, importune à moi-même, Pouvez-vous souhaiter qu’Andromaque vous aime ? Quels charmes ont pour vous des yeux infortunés Qu’à des pleurs éternels vous avez condamnés ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 17, 'Non, non : d’un ennemi respecter la misère, Sauver des malheureux, rendre un fils à sa mère, De cent peuples pour lui combattre la rigueur Sans me faire payer son salut de mon cœur, Malgré moi, s’il le faut, lui donner un asile ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 18, 'Seigneur, voilà des soins dignes du fils d’Achille.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 19, 'Eh quoi ! votre courroux n’a-t-il pas eu son cours ? Peut-on haïr sans cesse ? et punit-on toujours ? J’ai fait des malheureux, sans doute, et la Phrygie Cent fois de votre sang a vu ma main rougie ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 20, 'Mais que vos yeux sur moi se sont bien exercés ! Qu’ils m’ont vendu bien cher les pleurs qu’ils ont versés ! De combien de remords m’ont-ils rendu la proie !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 21, 'Je souffre tous les maux que j’ai faits devant Troie : Vaincu, chargé de fers, de regrets consumé, Brûlé de plus de feux que je n’en allumai, Tant de soins, tant de pleurs, tant d’ardeurs inquiètes… Hélas !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 22, 'fus-je jamais si cruel que vous l’êtes ? Mais enfin, tour à tour, c’est assez nous punir ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 23, 'Nos ennemis communs devraient nous réunir : Madame, dites-moi seulement que j’espère, Je vous rends votre fils, et je lui sers de père ; Je l’instruirai moi-même à venger les Troyens ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 24, 'J’irai punir les Grecs de vos maux et des miens. Animé d’un regard, je puis tout entreprendre : Votre Ilion encor peut sortir de sa cendre ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 25, 'Je puis, en moins de temps que les Grecs ne l’ont pris, Dans ses murs relevés couronner votre fils.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 26, 'Seigneur, tant de grandeurs ne nous touchent plus guère ; Je les lui promettais tant qu’a vécu son père. Non, vous n’espérez plus de nous revoir encor, Sacrés murs, que n’a pu conserver mon Hector !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 27, 'À de moindres faveurs des malheureux prétendent, Seigneur ; c’est un exil que mes pleurs vous demandent. Souffrez que loin des Grecs, et même loin de vous, J’aille cacher mon fils, et pleurer mon époux.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 28, 'Votre amour contre nous allume trop de haine : Retournez, retournez à la fille d’Hélène.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 29, 'Et le puis-je, madame ? Ah ! que vous me gênez ! Comment lui rendre un cœur que vous me retenez ? Je sais que de mes vœux on lui promit l’empire ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 30, 'Je sais que pour régner elle vint dans l’Épire : Le sort vous y voulut l’une et l’autre amener ; Vous, pour porter des fers, elle, pour en donner. Cependant ai-je pris quelque soin de lui plaire ?'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 31, 'Et ne dirait-on pas, en voyant au contraire Vos charmes tout-puissants, et les siens dédaignés, Qu’elle est ici captive, et que vous y régnez ? Ah !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 32, 'qu’un seul des soupirs que mon cœur vous envoie, S’il s’échappait vers elle, y porterait de joie !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 33, 'Et pourquoi vos soupirs seraient-ils repoussés ? Aurait-elle oublié vos services passés ? Troie, Hector, contre vous révoltent-ils son âme ? Aux cendres d’un époux doit-elle enfin sa flamme ? Et quel époux encore ! Ah !'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 34, 'souvenir cruel ! Sa mort seule a rendu votre père immortel : Il doit au sang d’Hector tout l’éclat de ses armes ; Et vous n’êtes tous deux connus que par mes larmes.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 35, 'Eh bien, madame, eh bien, il faut vous obéir : Il faut vous oublier, ou plutôt vous haïr. Oui, mes vœux ont trop loin poussé leur violence Pour ne plus s’arrêter que dans l’indifférence ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 36, 'Songez-y bien : il faut désormais que mon cœur, S’il n’aime avec transport, haïsse avec fureur. Je n’épargnerai rien dans ma juste colère : Le fils me répondra des mépris de la mère ; La Grèce le demande ;'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 37, 'et je ne prétends pas Mettre toujours ma gloire à sauver des ingrats.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 38, 'Hélas, il mourra donc ! Il n’a pour sa défense Que les pleurs de sa mère, et que son innocence… Et peut-être après tout, en l’état où je suis, Sa mort avancera la fin de mes ennuis.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', '99416d14-f99e-4b2a-ab07-6fefaf5bec1e', 39, 'Je prolongeais pour lui ma vie et ma misère ; Mais enfin sur ses pas j’irai revoir son père. Ainsi, tous trois, seigneur, par vos soins réunis, Nous vous…'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 40, 'Nous vous… Allez, madame, allez voir votre fils. Peut-être, en le voyant, votre amour plus timide Ne prendra pas toujours sa colère pour guide.'),
  ('166d06a7-f71d-42d4-9275-f09547bef9e9', 'f286ed49-d7b9-4bcb-96bd-10ab248a8700', 41, 'Pour savoir nos destins j’irai vous retrouver : Madame, en l’embrassant, songez à le sauver.');

-- Acte II, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte II, Scène première', 'Acte II', 'acte-ii-scene-premiere', '{}', false);
insert into characters (id, scene_id, name) values ('02fb0895-3374-451e-94e3-16bddaa2be79', '87c05f5d-c987-454e-b04f-74b30edc85d6', 'HERMIONE');
insert into characters (id, scene_id, name) values ('19362159-94a8-4e01-9001-76a70327d89b', '87c05f5d-c987-454e-b04f-74b30edc85d6', 'CLÉONE');
insert into lines (scene_id, character_id, "order", text) values
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 1, 'Je fais ce que tu veux ; je consens qu’il me voie ; Je lui veux bien encore accorder cette joie. Pylade va bientôt conduire ici ses pas ; Mais, si je m’en croyais, je ne le verrais pas.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 2, 'Et qu’est-ce que sa vue a pour vous de funeste ? Madame, n’est-ce pas toujours le même Oreste Dont vous avez cent fois souhaité le retour, Et dont vous regrettiez la constance et l’amour ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 3, 'C’est cet amour payé de trop d’ingratitude Qui me rend en ces lieux sa présence si rude. Quelle honte pour moi, quel triomphe pour lui De voir mon infortune égaler son ennui !'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 4, 'Est-ce là, dira-t-il, cette fière Hermione ? Elle me dédaignait : un autre l’abandonne : L’ingrate, qui mettait son cœur à si haut prix, Apprend donc à son tour à souffrir des mépris ! Ah, dieux !'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 5, 'Ah, dieux ! Ah ! dissipez ces indignes alarmes ; Il a trop bien senti le pouvoir de vos charmes. Vous croyez qu’un amant vienne vous insulter ? Il vous rapporte un cœur qu’il n’a pu vous ôter.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 6, 'Mais vous ne dites point ce que vous mande un père ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 7, 'Dans ses retardements si Pyrrhus persévère, À la mort du Troyen s’il ne veut consentir, Mon père avec les Grecs m’ordonne de partir.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 8, 'Eh bien, madame, eh bien, écoutez donc Oreste. Pyrrhus a commencé, faites au moins le reste. Pour bien faire il faudrait que vous le prévinssiez : Ne m’avez-vous pas dit que vous le haïssiez ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 9, 'Si je le hais, Cléone ! Il y va de ma gloire, Après tant de bontés dont il perd la mémoire ; Lui qui me fut si cher, et qui m’a pu trahir ! Ah, je l’ai trop aimé, pour ne le point haïr !'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 10, 'Fuyez-le donc, madame ; et puisqu’on vous adore…'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 11, 'Ah ! laisse à ma fureur le temps de croître encore ! Contre mon ennemi laisse-moi m’assurer ; Cléone, avec horreur je m’en veux séparer. Il n’y travaillera que trop bien, l’infidèle !'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 12, 'Quoi ! vous en attendez quelque injure nouvelle ? Aimer une captive, et l’aimer à vos yeux, Tout cela n’a donc pu vous le rendre odieux ? Après ce qu’il a fait, que saurait-il donc faire ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 13, 'Il vous aurait déplu, s’il pouvait vous déplaire.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 14, 'Pourquoi veux-tu, cruelle, irriter mes ennuis ? Je crains de me connaître en l’état où je suis. De tout ce que tu vois tâche de ne rien croire ; Crois que je n’aime plus, vante-moi ma victoire ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 15, 'Crois que dans son dépit mon cœur est endurci ; Hélas ! et s’il se peut, fais-le moi croire aussi. Tu veux que je le fuie ? Eh bien ! rien ne m’arrête : Allons, n’envions plus son indigne conquête ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 16, 'Que sur lui sa captive étende son pouvoir ; Fuyons… Mais si l’ingrat rentrait dans son devoir ; Si la foi dans son cœur retrouvait quelque place ; S’il venait à mes pieds me demander sa grâce ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 17, 'Si sous mes lois, Amour, tu pouvais l’engager ; S’il voulait… Mais l’ingrat ne veut que m’outrager. Demeurons toutefois pour troubler leur fortune ; Prenons quelque plaisir à leur être importune ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 18, 'Ou, le forçant de rompre un nœud si solennel, Aux yeux de tous les Grecs rendons-le criminel. J’ai déjà sur le fils attiré leur colère ; Je veux qu’on vienne encor lui demander la mère.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 19, 'Rendons-lui les tourments qu’elle me fait souffrir ; Qu’elle le perde, ou bien qu’il la fasse périr.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 20, 'Vous pensez que des yeux toujours ouverts aux larmes Se plaisent à troubler le pouvoir de vos charmes, Et qu’un cœur accablé de tant de déplaisirs De son persécuteur ait brigué les soupirs ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 21, 'Voyez si sa douleur en paraît soulagée : Pourquoi donc les chagrins où son âme est plongée ? Contre un amant qui plaît pourquoi tant de fierté ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 22, 'Hélas ! pour mon malheur, je l’ai trop écouté. Je n’ai point du silence affecté le mystère : Je croyais sans péril pouvoir être sincère ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 23, 'Et, sans armer mes yeux d’un moment de rigueur, Je n’ai pour lui parler consulté que mon cœur. Et qui ne se serait comme moi déclarée Sur la foi d’une amour si saintement jurée ?'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 24, 'Me voyait-il de l’œil qu’il me voit aujourd’hui ? Tu t’en souviens encor, tout conspirait pour lui : Ma famille vengée, et les Grecs dans la joie, Nos vaisseaux tout chargés des dépouilles de Troie ;'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 25, 'Les exploits de son père effacés par les siens, Ses feux que je croyais plus ardents que les miens, Mon cœur… toi-même enfin de sa gloire éblouie, Avant qu’il me trahît, vous m’avez tous trahie.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 26, 'Mais c’en est trop, Cléone, et quel que soit Pyrrhus, Hermione est sensible, Oreste a des vertus ; Il sait aimer du moins, et même sans qu’on l’aime ; Et peut-être il saura se faire aimer lui-même. Allons.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 27, 'Qu’il vienne enfin.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '19362159-94a8-4e01-9001-76a70327d89b', 28, 'Allons. Qu’il vienne enfin. Madame, le voici.'),
  ('87c05f5d-c987-454e-b04f-74b30edc85d6', '02fb0895-3374-451e-94e3-16bddaa2be79', 29, 'Ah ! je ne croyais pas qu’il fût si près d’ici.');

-- Acte II, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('89f5a385-0e02-4856-87af-7a8308258934', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte II, Scène II', 'Acte II', 'acte-ii-scene-ii', '{}', false);
insert into characters (id, scene_id, name) values ('1592d389-c1e7-4bbd-8729-3e95c8404b27', '89f5a385-0e02-4856-87af-7a8308258934', 'HERMIONE');
insert into characters (id, scene_id, name) values ('36514ce2-cd1e-4c42-bf82-bc02a800fe7c', '89f5a385-0e02-4856-87af-7a8308258934', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 1, 'Le croirai-je, seigneur, qu’un reste de tendresse Vous fasse ici chercher une triste princesse ? Ou ne dois-je imputer qu’à votre seul devoir L’heureux empressement qui vous porte à me voir ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 2, 'Tel est de mon amour l’aveuglement funeste, Vous le savez, madame ; et le destin d’Oreste Est de venir sans cesse adorer vos attraits, Et de jurer toujours qu’il n’y viendra jamais.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 3, 'Je sais que vos regards vont rouvrir mes blessures ; Que tous mes pas vers vous sont autant de parjures : Je le sais, j’en rougis.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 4, 'Mais j’atteste les dieux, Témoins de la fureur de mes derniers adieux, Que j’ai couru partout où ma perte certaine Dégageait mes serments et finissait ma peine.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 5, 'J’ai mendié la mort chez des peuples cruels Qui n’apaisaient leurs dieux que du sang des mortels : Ils m’ont fermé leurs temples ; et ces peuples barbares De mon sang prodigué sont devenus avares.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 6, 'Enfin je viens à vous, et je me vois réduit À chercher dans vos yeux une mort qui me fuit. Mon désespoir n’attend que leur indifférence : Ils n’ont qu’à m’interdire un reste d’espérance ;'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 7, 'Ils n’ont, pour avancer cette mort où je cours, Qu’à me dire une fois ce qu’ils m’ont dit toujours. Voilà, depuis un an, le seul soin qui m’anime.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 8, 'Madame, c’est à vous de prendre une victime Que les Scythes auraient dérobée à vos coups Si j’en avais trouvé d’aussi cruels que vous.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 9, 'Quittez, seigneur, quittez ce funeste langage ; À des soins plus pressants la Grèce vous engage. Que parlez-vous du Scythe et de mes cruautés ? Songez à tous ces rois que vous représentez.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 10, 'Faut-il que d’un transport leur vengeance dépende ? Est-ce le sang d’Oreste enfin qu’on vous demande ? Dégagez-vous des soins dont vous êtes chargé.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 11, 'Les refus de Pyrrhus m’ont assez dégagé, Madame : il me renvoie ; et quelque autre puissance Lui fait du fils d’Hector embrasser la défense.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 12, 'L’infidèle !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 13, 'L’infidèle ! Ainsi donc, tout prêt à le quitter, Sur mon propre destin je viens vous consulter. Déjà même je crois entendre la réponse Qu’en secret contre moi votre haine prononce.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 14, 'Eh quoi ! toujours injuste en vos tristes discours, De mon inimitié vous plaindrez-vous toujours ? Quelle est cette rigueur tant de fois alléguée ? J’ai passé dans l’Épire où j’étais reléguée ;'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 15, 'Mon père l’ordonnait : mais qui sait si depuis Je n’ai point en secret partagé vos ennuis ? Pensez-vous avoir seul éprouvé des alarmes ; Que l’Épire jamais n’ait vu couler mes larmes ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 16, 'Enfin, qui vous a dit que, malgré mon devoir, Je n’ai pas quelquefois souhaité de vous voir ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 17, 'Souhaité de me voir ! Ah ! divine princesse… Mais, de grâce, est-ce à moi que ce discours s’adresse ? Ouvrez vos yeux : songez qu’Oreste est devant vous, Oreste, si longtemps l’objet de leur courroux ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 18, 'Oui, c’est vous dont l’amour, naissant avec leurs charmes, Leur apprit le premier le pouvoir de leurs armes ; Vous que mille vertus me forçaient d’estimer ; Vous que j’ai plaint, enfin que je voudrais aimer.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 19, 'Je vous entends. Tel est mon partage funeste : Le cœur est pour Pyrrhus, et les vœux pour Oreste.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 20, 'Ah ! ne souhaitez pas le destin de Pyrrhus, Je vous haïrais trop.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 21, 'Je vous haïrais trop. Vous m’en aimeriez plus. Ah ! que vous me verriez d’un regard bien contraire ! Vous me voulez aimer, et je ne puis vous plaire ;'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 22, 'Et, l’amour seul alors se faisant obéir, Vous m’aimeriez, madame, en me voulant haïr. Ô dieux ! tant de respects, une amitié si tendre… Que de raisons pour moi, si vous pouviez m’entendre !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 23, 'Vous seule pour Pyrrhus disputez aujourd’hui, Peut-être malgré vous, sans doute malgré lui : Car enfin il vous hait ; son âme, ailleurs éprise, N’a plus…'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 24, 'N’a plus… Qui vous l’a dit, seigneur, qu’il me méprise ? Ses regards, ses discours vous l’ont-ils donc appris ? Jugez-vous que ma vue inspire des mépris, Qu’elle allume en un cœur des feux si peu durables ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 25, 'Peut-être d’autres yeux me sont plus favorables.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 26, 'Poursuivez : il est beau de m’insulter ainsi. Cruelle, c’est donc moi qui vous méprise ici ? Vos yeux n’ont pas assez éprouvé ma constance ? Je suis donc un témoin de leur peu de puissance ? Je les ai méprisés ! Ah !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 27, 'qu’ils voudraient bien voir Mon rival comme moi mépriser leur pouvoir !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 28, 'Que m’importe, seigneur, sa haine ou sa tendresse ? Allez contre un rebelle armer toute la Grèce ; Rapportez-lui le prix de sa rébellion ; Qu’on fasse de l’Épire un second Ilion : Allez.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 29, 'Après cela direz-vous que je l’aime ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 30, 'Madame, faites plus, et venez-y vous-même. Voulez-vous demeurer pour otage en ces lieux ? Venez dans tous les cœurs faire parler vos yeux. Faisons de notre haine une commune attaque.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 31, 'Mais, seigneur, cependant, s’il épouse Andromaque ?'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 32, 'Hé, madame !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 33, 'Hé, madame ! Songez quelle honte pour nous Si d’une Phrygienne il devenait l’époux !'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '36514ce2-cd1e-4c42-bf82-bc02a800fe7c', 34, 'Et vous le haïssez ! Avouez-le, madame, L’amour n’est pas un feu qu’on renferme en une âme : Tout nous trahit, la voix, le silence, les yeux ; Et les feux mal couverts n’en éclatent que mieux.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 35, 'Seigneur, je le vois bien, votre âme prévenue Répand sur mes discours le venin qui la tue, Toujours dans mes raisons cherche quelque détour, Et croit qu’en moi la haine est un effort d’amour.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 36, 'Il faut donc m’expliquer : vous agirez ensuite. Vous savez qu’en ces lieux mon devoir m’a conduite : Mon devoir m’y retient ; et je n’en puis partir Que mon père, ou Pyrrhus, ne m’en fasse sortir.'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 37, 'De la part de mon père allez lui faire entendre Que l’ennemi des Grecs ne peut être son gendre ; Du Troyen ou de moi faites-le décider ; Qu’il songe qui des deux il veut rendre ou garder ;'),
  ('89f5a385-0e02-4856-87af-7a8308258934', '1592d389-c1e7-4bbd-8729-3e95c8404b27', 38, 'Enfin, qu’il me renvoie, ou bien qu’il vous le livre. Adieu. S’il y consent, je suis prête à vous suivre.');

-- Acte II, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte II, Scène III', 'Acte II', 'acte-ii-scene-iii', '{}', false);
insert into characters (id, scene_id, name) values ('d51917d6-4bbd-4494-a17b-20303e6d1d31', '755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', 'd51917d6-4bbd-4494-a17b-20303e6d1d31', 1, 'Oui, oui, vous me suivrez, n’en doutez nullement Je vous réponds déjà de son consentement. Je ne crains pas enfin que Pyrrhus la retienne : Il n’a devant les yeux que sa chère Troyenne ; Tout autre objet le blesse ;'),
  ('755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', 'd51917d6-4bbd-4494-a17b-20303e6d1d31', 2, 'et peut-être aujourd’hui Il n’attend qu’un prétexte à l’éloigner de lui. Nous n’avons qu’à parler : c’en est fait. Quelle joie D’enlever à l’Épire une si belle proie !'),
  ('755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', 'd51917d6-4bbd-4494-a17b-20303e6d1d31', 3, 'Sauve tout ce qui reste et de Troie et d’Hector, Garde son fils, sa veuve, et mille autres encor, Épire : c’est assez qu’Hermione rendue Perde à jamais tes bords et ton prince de vue.'),
  ('755969ed-6f8c-4ba4-88b7-1fb7976eaf9e', 'd51917d6-4bbd-4494-a17b-20303e6d1d31', 4, 'Mais un heureux destin le conduit en ces lieux. Parlons. À tant d’attraits, Amour, ferme ses yeux ?');

-- Acte II, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte II, Scène IV', 'Acte II', 'acte-ii-scene-iv', '{}', false);
insert into characters (id, scene_id, name) values ('d38d38c2-432f-4189-a577-5662dda4b89a', '86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'PYRRHUS');
insert into characters (id, scene_id, name) values ('edcf0c41-b8e3-432c-8001-d1d068f642bb', '86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 1, 'Je vous cherchais, seigneur. Un peu de violence M’a fait de vos raisons combattre la puissance, Je l’avoue ; et depuis que je vous ai quitté, J’en ai senti la force et connu l’équité.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 2, 'J’ai songé, comme vous, qu’à la Grèce, à mon père, À moi-même, en un mot, je devenais contraire ; Que je relevais Troie, et rendais imparfait Tout ce qu’a fait Achille, et tout ce que j’ai fait.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 3, 'Je ne condamne plus un courroux légitime ; Et l’on vous va, seigneur, livrer votre victime.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'edcf0c41-b8e3-432c-8001-d1d068f642bb', 4, 'Seigneur, par ce conseil prudent et rigoureux, C’est acheter la paix du sang d’un malheureux.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 5, 'Oui : mais je veux, seigneur, l’assurer davantage : D’une éternelle paix Hermione est le gage ; Je l’épouse.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 6, 'Il semblait qu’un spectacle si doux N’attendît en ces lieux qu’un témoin tel que vous : Vous y représentez tous les Grecs et son père, Puisqu’en vous Ménélas voit revivre son frère. Voyez-la donc. Allez.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'd38d38c2-432f-4189-a577-5662dda4b89a', 7, 'Dites-lui que demain J’attends avec la paix son cœur de votre main.'),
  ('86d06b68-4d5d-4e5d-95a4-05957e1f299a', 'edcf0c41-b8e3-432c-8001-d1d068f642bb', 8, 'Ah dieux !');

-- Acte II, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte II, Scène V', 'Acte II', 'acte-ii-scene-v', '{}', false);
insert into characters (id, scene_id, name) values ('2eaf67d0-bd74-49a7-9e62-70c9894329f6', '854fbd66-f852-4726-b4a4-36d0378e2c7e', 'PYRRHUS');
insert into characters (id, scene_id, name) values ('9cced220-68b9-4b51-bebe-c6d3e8ab2976', '854fbd66-f852-4726-b4a4-36d0378e2c7e', 'PHŒNIX');
insert into lines (scene_id, character_id, "order", text) values
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 1, 'Ah dieux ! Eh bien, Phœnix, l’amour est-il le maître ? Tes yeux refusent-ils encor de me connaître !'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 2, 'Ah ! je vous reconnais ; et ce juste courroux, Ainsi qu’à tous les Grecs, seigneur, vous rend à vous.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 3, 'Ce n’est plus le jouet d’une flamme servile, C’est Pyrrhus, c’est le fils et le rival d’Achille, Que la gloire à la fin ramène sous ses lois, Qui triomphe de Troie une seconde fois.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 4, 'Dis plutôt qu’aujourd’hui commence ma victoire : D’aujourd’hui seulement je jouis de ma gloire ; Et mon cœur, aussi fier que tu l’as vu soumis, Croit avoir en l’amour vaincu mille ennemis.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 5, 'Considère, Phœnix, les troubles que j’évite, Quelle foule de maux l’amour traîne à sa suite, Que d’amis, de devoirs, j’allais sacrifier !'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 6, 'Quels périls… un regard m’eût tout fait oublier : Tous les Grecs conjurés fondaient sur un rebelle, Je trouvais du plaisir à me perdre pour elle.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 7, 'Oui, je bénis, seigneur, l’heureuse cruauté Qui vous rend…'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 8, 'Qui vous rend… Tu l’as vu, comme elle m’a traité. Je pensais, en voyant sa tendresse alarmée, Que son fils me la dût renvoyer désarmée : J’allais voir le succès de ses embrassements ;'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 9, 'Je n’ai trouvé que pleurs mêlés d’emportements. Sa misère l’aigrit ; et, toujours plus farouche, Cent fois le nom d’Hector est sorti de sa bouche. Vainement à son fils j’assurais mon secours ;'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 10, '« C’est Hector, disait-elle en l’embrassant toujours, « Voilà ses yeux, sa bouche, et déjà son audace ; « C’est lui-même, c’est toi, cher époux, que j’embrasse. » Hé ! quelle est sa pensée ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 11, 'attend-elle en ce jour Que je lui laisse un fils pour nourrir son amour ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 12, 'Sans doute, c’est le prix que vous gardait l’ingrate. Mais laissez-la, seigneur.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 13, 'Mais laissez-la, seigneur. Je vois ce qui la flatte : Sa beauté la rassure ; et malgré mon courroux, L’orgueilleuse m’attend encore à ses genoux. Je la verrais aux miens, Phœnix, d’un œil tranquille.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 14, 'Elle est veuve d’Hector, et je suis fils d’Achille : Trop de haine sépare Andromaque et Pyrrhus.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 15, 'Commencez donc, seigneur, à ne m’en parler plus. Allez voir Hermione ; et content de lui plaire, Oubliez à ses pieds jusqu’à votre colère.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 16, 'Vous-même à cet hymen venez la disposer : Est-ce sur un rival qu’il s’en faut reposer ? Il ne l’aime que trop.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 17, 'Il ne l’aime que trop. Crois-tu, si je l’épouse, Qu’Andromaque en son cœur n’en sera pas jalouse ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 18, 'Quoi ! toujours Andromaque occupe votre esprit ! Que vous importe, ô dieux, sa joie ou son dépit ? Quel charme, malgré vous, vers elle vous attire ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 19, 'Non, je n’ai pas bien dit tout ce qu’il lui faut dire : Ma colère à ses yeux n’a paru qu’à demi ; Elle ignore à quel point je suis son ennemi. Retournons-y.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 20, 'Je veux la braver à sa vue, Et donner à ma haine une libre étendue. Viens voir tous ses attraits, Phœnix, humiliés. Allons.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 21, 'Allons. Allez, seigneur, vous jeter à ses pieds : Allez, en lui jurant que votre âme l’adore, À de nouveaux mépris l’encourager encore.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 22, 'Je le vois bien, tu crois que prêt à l’excuser Mon cœur court après elle, et cherche à s’apaiser.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 23, 'Vous aimez : c’est assez.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 24, 'Vous aimez : c’est assez. Moi l’aimer ? une ingrate Qui me hait d’autant plus que mon amour la flatte ? Sans parents, sans amis, sans espoir que sur moi ! Je puis perdre son fils, peut-être je le doi ;'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 25, 'Étrangère… que dis-je ? esclave dans l’Épire, Je lui donne son fils, mon âme, mon empire ; Et je ne puis gagner dans son perfide cœur D’autre rang que celui de son persécuteur ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 26, 'Non, non, je l’ai juré, ma vengeance est certaine ; Il faut bien une fois justifier sa haine : J’abandonne son fils. Que de pleurs vont couler ! De quel nom sa douleur me va-t-elle appeler !'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 27, 'Quel spectacle pour elle aujourd’hui se dispose ! Elle en mourra, Phœnix, et j’en serai la cause : C’est lui mettre moi-même un poignard dans le sein.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 28, 'Et pourquoi donc en faire éclater le dessein ? Que ne consultiez-vous tantôt votre faiblesse ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 29, 'Je t’entends. Mais excuse un reste de tendresse. Crains-tu pour ma colère un si faible combat ! D’un amour qui s’éteint c’est le dernier éclat. Allons. À tes conseils, Phœnix, je m’abandonne.'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 30, 'Faut-il livrer son fils, faut-il voir Hermione ?'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '9cced220-68b9-4b51-bebe-c6d3e8ab2976', 31, 'Oui, voyez-la, seigneur ; et par des vœux soumis, Protestez-lui…'),
  ('854fbd66-f852-4726-b4a4-36d0378e2c7e', '2eaf67d0-bd74-49a7-9e62-70c9894329f6', 32, 'Protestez-lui… Faisons tout ce que j’ai promis.');

-- Acte III, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène première', 'Acte III', 'acte-iii-scene-premiere', '{}', false);
insert into characters (id, scene_id, name) values ('0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', '8f064a4d-bed6-4316-93b2-f870c57bb9ca', 'PYLADE');
insert into characters (id, scene_id, name) values ('4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', '8f064a4d-bed6-4316-93b2-f870c57bb9ca', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 1, 'Modérez donc, seigneur, cette fureur extrême : Je ne vous connais plus ; vous n’êtes plus vous-même. Souffrez…'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 2, 'Souffrez… Non, tes conseils ne sont plus de saison, Pylade ; je suis las d’écouter la raison. C’est traîner trop longtemps ma vie et mon supplice ; Il faut que je l’enlève, ou bien que je périsse.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 3, 'Le dessein en est pris ; je le veux achever. Oui, je le veux.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 4, 'Oui, je le veux. Eh bien, il la faut enlever ; J’y consens. Mais songez cependant où vous êtes. Que croira-t-on de vous, à voir ce que vous faites ? Dissimulez : calmez ce transport inquiet ;'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 5, 'Commandez à vos yeux de garder le secret. Ces gardes, cette cour, l’air qui vous environne, Tout dépend de Pyrrhus, et surtout Hermione. À ses regards surtout cachez votre courroux. Ô dieux !'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 6, 'en cet état pourquoi la cherchiez-vous ?'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 7, 'Que sais-je ? De moi-même étais-je alors le maître ? La fureur m’emportait, et je venais peut-être Menacer à la fois l’ingrate et son amant.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 8, 'Et quel était le fruit de cet emportement ?'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 9, 'Et quelle âme, dis-moi, ne serait éperdue Du coup dont ma raison vient d’être confondue ? Il épouse, dit-il, Hermione demain ; Il veut, pour m’honorer, la tenir de ma main. Ah ! plutôt cette main dans le sang du barbare…'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 10, 'Vous l’accusez, seigneur, de ce destin bizarre ; Cependant, tourmenté de ses propres desseins, Il est peut-être à plaindre autant que je vous plains.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 11, 'Non, non ; je le connais, mon désespoir le flatte ; Sans moi, sans mon amour, il dédaignait l’ingrate ; Ses charmes jusque-là n’avaient pu le toucher : Le cruel ne la prend que pour me l’arracher. Ah dieux !'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 12, 'c’en était fait : Hermione gagnée Pour jamais de sa vue allait être éloignée ; Son cœur, entre l’amour et le dépit confus, Pour se donner à moi n’attendait qu’un refus ; Ses yeux s’ouvraient, Pylade ;'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 13, 'elle écoutait Oreste, Lui parlait, le plaignait… Un mot eût fait le reste.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 14, 'Vous le croyez ?'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 15, 'Vous le croyez ? Eh quoi ! ce courroux enflammé Contre un ingrat…'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 16, 'Contre un ingrat… Jamais il ne fut plus aimé. Pensez-vous, quand Pyrrhus vous l’aurait accordée, Qu’un prétexte tout prêt ne l’eût pas retardée ? M’en croirez-vous ?'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 17, 'Lassé de ses trompeurs attraits, Au lieu de l’enlever, fuyez-la pour jamais. Quoi ! votre amour se veut charger d’une furie Qui vous détestera, qui, toute votre vie, Regrettant un hymen tout prêt à s’achever, Voudra…'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 18, 'Voudra… C’est pour cela que je veux l’enlever. Tout lui rirait, Pylade ; et moi, pour mon partage, Je n’emporterais donc qu’une inutile rage ? J’irais loin d’elle encor tâcher de l’oublier ? Non, non ;'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 19, 'à mes tourments je veux l’associer : C’est trop gémir tout seul. Je suis las qu’on me plaigne.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 20, 'Je prétends qu’à mon tour l’inhumaine me craigne, Et que ses yeux cruels, à pleurer condamnés, Me rendent tous les noms que je leur ai donnés.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 21, 'Voilà donc le succès qu’aura votre ambassade : Oreste ravisseur !'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 22, 'Oreste ravisseur ! Et qu’importe, Pylade ? Quand nos États vengés jouiront de mes soins, L’ingrate de mes pleurs jouira-t-elle moins ? Et que me servira que la Grèce m’admire, Tandis que je serai la fable de l’Épire ?'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 23, 'Que veux-tu ? Mais, s’il faut ne te rien déguiser, Mon innocence enfin commence à me peser. Je ne sais de tout temps quelle injuste puissance Laisse le crime en paix, et poursuit l’innocence.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 24, 'De quelque part sur moi que je tourne les yeux, Je ne vois que malheurs qui condamnent les dieux. Méritons leur courroux, justifions leur haine, Et que le fruit du crime en précède la peine.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 25, 'Mais toi, par quelle erreur veux-tu toujours sur toi Détourner un courroux qui ne cherche que moi ? Assez et trop longtemps mon amitié t’accable : Évite un malheureux, abandonne un coupable.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 26, 'Cher Pylade, crois-moi, ta pitié te séduit. Laisse-moi des périls dont j’attends tout le fruit. Porte aux Grecs cet enfant que Pyrrhus m’abandonne. Va-t’en.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 27, 'Va-t’en. Allons, seigneur, enlevons Hermione. Au travers des périls un grand cœur se fait jour. Que ne peut l’amitié conduite par l’amour !'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 28, 'Allons de tous vos Grecs encourager le zèle : Nos vaisseaux sont tout prêts, et le vent nous appelle. Je sais de ce palais tous les détours obscurs ; Vous voyez que la mer en vient battre les murs ;'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 29, 'Et cette nuit, sans peine, une secrète voie Jusqu’en votre vaisseau conduira votre proie.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 30, 'J’abuse, cher ami, de ton trop d’amitié ; Mais pardonne à des maux dont toi seul as pitié ; Excuse un malheureux qui perd tout ce qu’il aime, Que tout le monde hait, et qui se hait lui-même.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 31, 'Que ne puis-je à mon tour dans un sort plus heureux…'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '0f88c434-0c5b-47bf-a8e8-26e526c1d5b2', 32, 'Dissimulez, seigneur ; c’est tout ce que je veux. Gardez qu’avant le coup votre dessein n’éclate. Oubliez jusque-là qu’Hermione est ingrate ; Oubliez votre amour. Elle vient, je la voi.'),
  ('8f064a4d-bed6-4316-93b2-f870c57bb9ca', '4dcbb241-b6f2-4bb7-bb11-b38734ffdf08', 33, 'Va-t’en. Réponds-moi d’elle, et je réponds de moi.');

-- Acte III, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène II', 'Acte III', 'acte-iii-scene-ii', '{}', false);
insert into characters (id, scene_id, name) values ('3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 'a4b8034f-3d1f-4f16-8839-7acf4095541e', 'ORESTE');
insert into characters (id, scene_id, name) values ('a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 'a4b8034f-3d1f-4f16-8839-7acf4095541e', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 1, 'Eh bien ! mes soins vous ont rendu votre conquête : J’ai vu Pyrrhus, madame, et votre hymen s’apprête.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', 'a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 2, 'On le dit ; et de plus on vient de m’assurer Que vous ne me cherchiez que pour m’y préparer.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 3, 'Et votre âme à ses vœux ne sera point rebelle ?'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', 'a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 4, 'Qui l’eût cru que Pyrrhus ne fût pas infidèle ? Que sa flamme attendrait si tard pour éclater ? Qu’il reviendrait à moi, quand je l’allais quitter ? Je veux croire avec vous qu’il redoute la Grèce ;'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', 'a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 5, 'Qu’il suit son intérêt plutôt que sa tendresse ; Que mes yeux sur votre âme étaient plus absolus.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 6, 'Non, madame : il vous aime, et je n’en doute plus. Vos yeux ne font-ils pas tout ce qu’ils veulent faire ? Et vous ne vouliez pas, sans doute, lui déplaire.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', 'a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 7, 'Mais que puis-je, seigneur ? On a promis ma foi : Lui ravirai-je un bien qu’il ne tient pas de moi ? L’amour ne règle pas le sort d’une princesse : La gloire d’obéir est tout ce qu’on nous laisse. Cependant je partais ;'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', 'a83d6d5d-64b2-49a0-986e-dfb8177fb5cb', 8, 'et vous avez pu voir Combien je relâchais pour vous de mon devoir.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 9, 'Ah ! que vous saviez bien, cruelle… Mais, madame, Chacun peut à son choix disposer de son âme. La vôtre était à vous. J’espérais ; mais enfin Vous l’avez pu donner sans me faire un larcin.'),
  ('a4b8034f-3d1f-4f16-8839-7acf4095541e', '3d737a29-b8ae-4081-9ad7-c20f4d6a868a', 10, 'Je vous accuse aussi bien moins que la fortune. Et pourquoi vous lasser d’une plainte importune ? Tel est votre devoir, je l’avoue ; et le mien Est de vous épargner un si triste entretien.');

-- Acte III, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('25c693f3-20a8-416e-9804-a76288f66f80', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène III', 'Acte III', 'acte-iii-scene-iii', '{}', false);
insert into characters (id, scene_id, name) values ('f3c25753-8679-4ebb-b496-7752efa0b37e', '25c693f3-20a8-416e-9804-a76288f66f80', 'HERMIONE');
insert into characters (id, scene_id, name) values ('b830e00d-d825-4265-9cf8-3a869c50a951', '25c693f3-20a8-416e-9804-a76288f66f80', 'CLÉONE');
insert into lines (scene_id, character_id, "order", text) values
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 1, 'Attendais-tu, Cléone, un courroux si modeste ?'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'b830e00d-d825-4265-9cf8-3a869c50a951', 2, 'La douleur qui se tait n’en est que plus funeste. Je le plains d’autant plus qu’auteur de son ennui, Le coup qui l’a perdu n’est parti que de lui.'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'b830e00d-d825-4265-9cf8-3a869c50a951', 3, 'Comptez depuis quel temps votre hymen se prépare : Il a parlé, madame, et Pyrrhus se déclare.'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 4, 'Tu crois que Pyrrhus craint ? Et que craint-il encor ? Des peuples qui, dix ans, ont fui devant Hector ;'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 5, 'Qui cent fois, effrayés de l’absence d’Achille, Dans leurs vaisseaux brûlants ont cherché leur asile, Et qu’on verrait encor, sans l’appui de son fils, Redemander Hélène aux Troyens impunis ?'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 6, 'Non, Cléone, il n’est point ennemi de lui-même ; Il veut tout ce qu’il fait ; et, s’il m’épouse, il m’aime. Mais qu’Oreste à son gré m’impute ses douleurs ; N’avons-nous d’entretien que celui de ses pleurs ?'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 7, 'Pyrrhus revient à nous ! Eh bien ! chère Cléone, Conçois-tu les transports de l’heureuse Hermione ? Sais-tu quel est Pyrrhus ? T’es-tu fait raconter Le nombre des exploits… Mais qui les peut compter ?'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 8, 'Intrépide, et partout suivi de la victoire, Charmant, fidèle enfin : rien ne manque à sa gloire. Songe…'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'b830e00d-d825-4265-9cf8-3a869c50a951', 9, 'Songe… Dissimulez : votre rivale en pleurs Vient à vos pieds, sans doute, apporter ses douleurs.'),
  ('25c693f3-20a8-416e-9804-a76288f66f80', 'f3c25753-8679-4ebb-b496-7752efa0b37e', 10, 'Dieux ! ne puis-je à ma joie abandonner mon âme ! Sortons : que lui dirais-je ?');

-- Acte III, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène IV', 'Acte III', 'acte-iii-scene-iv', '{}', false);
insert into characters (id, scene_id, name) values ('7ef97a67-9e95-491d-880a-f86deb9c596d', '50d61e49-6fec-42c9-811b-b6b5f11b77bf', 'ANDROMAQUE');
insert into characters (id, scene_id, name) values ('43de3148-63c0-4dab-a421-418c908b48fc', '50d61e49-6fec-42c9-811b-b6b5f11b77bf', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 1, 'Sortons : que lui dirais-je ? Où fuyez-vous, madame ? N’est-ce pas à vos yeux un spectacle assez doux Que la veuve d’Hector pleurant à vos genoux ?'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 2, 'Je ne viens point ici, par de jalouses larmes, Vous envier un cœur qui se rend à vos charmes. Par une main cruelle, hélas !'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 3, 'j’ai vu percer Le seul où mes regards prétendaient s’adresser : Ma flamme par Hector fut jadis allumée ; Avec lui dans la tombe elle s’est enfermée. Mais il me reste un fils.'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 4, 'Vous saurez quelque jour, Madame, pour un fils jusqu’où va notre amour ;'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 5, 'Mais vous ne saurez pas, du moins je le souhaite, En quel trouble mortel son intérêt nous jette, Lorsque de tant de biens qui pouvaient nous flatter, C’est le seul qui nous reste, et qu’on veut nous l’ôter. Hélas !'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 6, 'lorsque, lassés de dix ans de misère, Les Troyens en courroux menaçaient votre mère, J’ai su de mon Hector lui procurer l’appui : Vous pouvez sur Pyrrhus ce que j’ai pu sur lui.'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '7ef97a67-9e95-491d-880a-f86deb9c596d', 7, 'Que craint-on d’un enfant qui survit à sa perte ? Laissez-moi le cacher en quelque île déserte : Sur les soins de sa mère on peut s’en assurer, Et mon fils avec moi n’apprendra qu’à pleurer.'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '43de3148-63c0-4dab-a421-418c908b48fc', 8, 'Je conçois vos douleurs ; mais un devoir austère, Quand mon père a parlé, m’ordonne de me taire. C’est lui qui de Pyrrhus fait agir le courroux. S’il faut fléchir Pyrrhus, qui le peut mieux que vous ?'),
  ('50d61e49-6fec-42c9-811b-b6b5f11b77bf', '43de3148-63c0-4dab-a421-418c908b48fc', 9, 'Vos yeux assez longtemps ont régné sur son âme, Faites-le prononcer : j’y souscrirai, madame.');

-- Acte III, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('780ebffa-bb9b-4850-9818-3f29b5dcc354', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène V', 'Acte III', 'acte-iii-scene-v', '{}', false);
insert into characters (id, scene_id, name) values ('4e60d3f3-dc2d-4b65-88ab-2e822e869b40', '780ebffa-bb9b-4850-9818-3f29b5dcc354', 'ANDROMAQUE');
insert into characters (id, scene_id, name) values ('af7586ea-0cc3-49ab-8c3a-e56f8368ac1a', '780ebffa-bb9b-4850-9818-3f29b5dcc354', 'CÉPHISE');
insert into lines (scene_id, character_id, "order", text) values
  ('780ebffa-bb9b-4850-9818-3f29b5dcc354', '4e60d3f3-dc2d-4b65-88ab-2e822e869b40', 1, 'Quel mépris la cruelle attache à ses refus !'),
  ('780ebffa-bb9b-4850-9818-3f29b5dcc354', 'af7586ea-0cc3-49ab-8c3a-e56f8368ac1a', 2, 'Je croirais ses conseils, et je verrais Pyrrhus. Un regard confondrait Hermione et la Grèce… Mais lui-même il vous cherche.');

-- Acte III, Scène VI
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène VI', 'Acte III', 'acte-iii-scene-vi', '{}', false);
insert into characters (id, scene_id, name) values ('a2467b6a-72d3-419f-86b2-7a09e98c5e3a', '77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'PYRRHUS');
insert into characters (id, scene_id, name) values ('b7044080-2ca7-435d-b98c-eaf52774bd86', '77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'PHŒNIX');
insert into characters (id, scene_id, name) values ('a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', '77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'ANDROMAQUE');
insert into characters (id, scene_id, name) values ('b150f6a6-9f78-4b82-bdd6-ba2c5bef79c7', '77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'CÉPHISE');
insert into lines (scene_id, character_id, "order", text) values
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 1, 'Mais lui-même il vous cherche. Où donc est la princesse ? Ne m’avais-tu pas dit qu’elle était en ces lieux ?'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'b7044080-2ca7-435d-b98c-eaf52774bd86', 2, 'Je le croyais.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 3, 'Je le croyais. Tu vois le pouvoir de mes yeux !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 4, 'Que dit-elle, Phœnix ?'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 5, 'Que dit-elle, Phœnix ? Hélas ! tout m’abandonne !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'b7044080-2ca7-435d-b98c-eaf52774bd86', 6, 'Allons, seigneur, marchons sur les pas d’Hermione.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'b150f6a6-9f78-4b82-bdd6-ba2c5bef79c7', 7, 'Qu’attendez-vous ? Rompez ce silence obstiné.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 8, 'Il a promis mon fils.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'b150f6a6-9f78-4b82-bdd6-ba2c5bef79c7', 9, 'Il a promis mon fils. Il ne l’a pas donné.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 10, 'Non, non, j’ai beau pleurer, sa mort est résolue.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 11, 'Daigne-t-elle sur nous tourner au moins la vue ? Quel orgueil ?'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 12, 'Quel orgueil ? Je ne fais que l’irriter encor, Sortons.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 13, 'Sortons. Allons aux Grecs livrer le fils d’Hector.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 14, 'Ah, seigneur ! arrêtez ! Que prétendez-vous faire ? Si vous livrez le fils, livrez-leur donc la mère ! Vos serments m’ont tantôt juré tant d’amitié ! Dieux ! ne pourrai-je au moins toucher votre pitié ?'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 15, 'Sans espoir de pardon m’avez-vous condamnée ?'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 16, 'Phœnix vous le dira, ma parole est donnée.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 17, 'Vous qui braviez pour moi tant de périls divers !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 18, 'J’étais aveugle alors ; mes yeux se sont ouverts. Sa grâce à vos désirs pouvait être accordée ; Mais vous ne l’avez pas seulement demandée : C’en est fait.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 19, 'C’en est fait. Ah ! seigneur ! vous entendiez assez Des soupirs qui craignaient de se voir repoussés. Pardonnez à l’éclat d’une illustre fortune Ce reste de fierté qui craint d’être importune.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 20, 'Vous ne l’ignorez pas : Andromaque, sans vous, N’aurait jamais d’un maître embrassé les genoux.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 21, 'Non, vous me haïssez ; et dans le fond de l’âme Vous craignez de devoir quelque chose à ma flamme. Ce fils même, ce fils, objet de tant de soins, Si je l’avais sauvé, vous l’en aimeriez moins.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 22, 'La haine, le mépris, contre moi tout s’assemble ; Vous me haïssez plus que tous les Grecs ensemble. Jouissez à loisir d’un si noble courroux. Allons, Phœnix.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 23, 'Allons, Phœnix. Allons rejoindre mon époux.'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'b150f6a6-9f78-4b82-bdd6-ba2c5bef79c7', 24, 'Madame…'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 25, 'Madame… Et que veux-tu que je lui dise encore ? Auteur de tous mes maux, crois-tu qu’il les ignore ? (à Pyrrhus) J’ai vu mon père mort, et nos murs embrasés ;'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 26, 'J’ai vu trancher les jours de ma famille entière, Et mon époux sanglant traîné sur la poussière, Son fils seul avec moi, réservé pour les fers. Mais que ne peut un fils ! Je respire, je sers. J’ai fait plus ;'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 27, 'je me suis quelquefois consolée Qu’ici, plutôt qu’ailleurs, le sort m’eût exilée ; Qu’heureux dans son malheur, le fils de tant de rois, Puisqu’il devait servir, fût tombé sous vos lois ;'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 28, 'J’ai cru que sa prison deviendrait son asile. Jadis Priam soumis fut respecté d’Achille : J’attendais de son fils encor plus de bonté. Pardonne, cher Hector, à ma crédulité !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 29, 'Je n’ai pu soupçonner ton ennemi d’un crime : Malgré lui-même enfin je l’ai cru magnanime. Ah !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a5ecfb7c-3bd8-4f60-a5b7-59ce0eee6a76', 30, 's’il l’était assez pour nous laisser du moins Au tombeau qu’à ta cendre ont élevé mes soins, Et que, finissant là sa haine et nos misères, Il ne séparât point des dépouilles si chères !'),
  ('77b7f96a-62a4-4bad-b44b-d6ff1f206abc', 'a2467b6a-72d3-419f-86b2-7a09e98c5e3a', 31, 'Va m’attendre, Phœnix.');

-- Acte III, Scène VII
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène VII', 'Acte III', 'acte-iii-scene-vii', '{}', false);
insert into characters (id, scene_id, name) values ('9a4d9597-42a2-425b-a83e-0646a92965d4', '5b9f3600-135a-4a94-805e-f10ea6faee0e', 'PYRRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 1, 'Va m’attendre, Phœnix. Madame, demeurez. On peut vous rendre encor ce fils que vous pleurez. Oui, je sens à regret qu’en excitant vos larmes, Je ne fais contre moi que vous donner des armes ;'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 2, 'Je croyais apporter plus de haine en ces lieux. Mais, madame, du moins, tournez vers moi les yeux : Voyez si mes regards sont d’un juge sévère, S’ils sont d’un ennemi qui cherche à vous déplaire.'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 3, 'Pourquoi me forcez-vous vous-même à vous trahir ? Au nom de votre fils, cessons de nous haïr. À le sauver enfin c’est moi qui vous convie. Faut-il que mes soupirs vous demandent sa vie ?'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 4, 'Faut-il qu’en sa faveur j’embrasse vos genoux ? Pour la dernière fois, sauvez-le, sauvez-vous. Je sais de quels serments je romps pour vous les chaînes ; Combien je vais sur moi faire éclater de haines.'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 5, 'Je renvoie Hermione, et je mets sur son front, Au lieu de ma couronne, un éternel affront ; Je vous conduis au temple où son hymen s’apprête ; Je vous ceins du bandeau préparé pour sa tête.'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 6, 'Mais ce n’est plus, madame, une offre à dédaigner ; Je vous le dis : il faut ou périr, ou régner. Mon cœur, désespéré d’un an d’ingratitude, Ne peut plus de son sort souffrir l’incertitude.'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 7, 'C’est craindre, menacer, et gémir trop longtemps. Je meurs si je vous perds ; mais je meurs si j’attends. Songez-y : je vous laisse, et je viendrai vous prendre Pour vous mener au temple où ce fils doit m’attendre ;'),
  ('5b9f3600-135a-4a94-805e-f10ea6faee0e', '9a4d9597-42a2-425b-a83e-0646a92965d4', 8, 'Et là vous me verrez, soumis ou furieux, Vous couronner, madame, ou le perdre à vos yeux.');

-- Acte III, Scène VIII
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte III, Scène VIII', 'Acte III', 'acte-iii-scene-viii', '{}', false);
insert into characters (id, scene_id, name) values ('e73b517b-dd0d-4385-b13c-3923b0bc469f', '3ae950c7-6060-4837-a3e4-c30d82faa104', 'CÉPHISE');
insert into characters (id, scene_id, name) values ('0f1e4470-2c36-4e2b-88e1-8014d12d6f50', '3ae950c7-6060-4837-a3e4-c30d82faa104', 'ANDROMAQUE');
insert into lines (scene_id, character_id, "order", text) values
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 1, 'Je vous l’avais prédit, qu’en dépit de la Grèce, De votre sort encor vous seriez la maîtresse.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 2, 'Hélas ! de quel effet tes discours sont suivis ! Il ne me restait plus qu’à condamner mon fils.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 3, 'Madame, à votre époux c’est être assez fidèle. Trop de vertu pourrait vous rendre criminelle. Lui-même il porterait votre âme à la douceur.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 4, 'Quoi ! je lui donnerais Pyrrhus pour successeur ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 5, 'Ainsi le veut son fils, que les Grecs vous ravissent. Pensez-vous qu’après tout ses mânes en rougissent ;'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 6, 'Qu’il méprisât, madame, un roi victorieux Qui vous fait remonter au rang de vos aïeux, Qui foule aux pieds pour vous vos vainqueurs en colère, Qui ne se souvient plus qu’Achille était son père, Qui dément ses exploits, et les rend superflus ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 7, 'Dois-je les oublier, s’il ne s’en souvient plus ? Dois-je oublier Hector privé de funérailles, Et traîné sans honneur autour de nos murailles ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 8, 'Dois-je oublier mon père à mes pieds renversé, Ensanglantant l’autel qu’il tenait embrassé ? Songe, songe, Céphise, à cette nuit cruelle Qui fut pour tout un peuple une nuit éternelle ;'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 9, 'Figure-toi Pyrrhus, les yeux étincelants, Entrant à la lueur de nos palais brûlants, Sur tous mes frères morts se faisant un passage, Et de sang tout couvert, échauffant le carnage ;'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 10, 'Songe aux cris des vainqueurs, songe aux cris des mourants Dans la flamme étouffés, sous le fer expirants ;'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 11, 'Peins-toi dans ces horreurs Andromaque éperdue : Voilà comme Pyrrhus vint s’offrir à ma vue, Voilà par quels exploits il sut se couronner ; Enfin, voilà l’époux que tu me veux donner.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 12, 'Non, je ne serai point complice de ses crimes ; Qu’il nous prenne, s’il veut, pour dernières victimes. Tous mes ressentiments lui seraient asservis !'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 13, 'Eh bien ! allons donc voir expirer votre fils : On n’attend plus que vous… Vous frémissez, madame !'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 14, 'Ah ! de quel souvenir viens-tu frapper mon âme ! Quoi ! Céphise, j’irai voir expirer encor Ce fils, ma seule joie, et l’image d’Hector ; Ce fils, que de sa flamme il me laissa pour gage ! Hélas !'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 15, 'je m’en souviens, le jour que son courage Lui fit chercher Achille, ou plutôt le trépas, Il demanda son fils, et le prit dans ses bras : « Chère épouse, dit-il en essuyant mes larmes, « J’ignore quel succès le sort garde à mes armes ;'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 16, '« Je te laisse mon fils pour gage de ma foi : « S’il me perd, je prétends qu’il me retrouve en toi. « Si d’un heureux hymen la mémoire t’est chère, « Montre au fils à quel point tu chérissais le père.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 17, '» Et je puis voir répandre un sang si précieux ! Et je laisse avec lui périr tous ses aïeux ! Roi barbare, faut-il que mon crime l’entraîne ? Si je te hais, est-il coupable de ma haine ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 18, 'T’a-t-il de tous les siens reproché le trépas ? S’est-il plaint à tes yeux des maux qu’il ne sent pas ? Mais cependant, mon fils, tu meurs si je n’arrête Le fer que le cruel tient levé sur ta tête.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 19, 'Je l’en puis détourner, et je t’y vais offrir !… Non, tu ne mourras point, je ne le puis souffrir. Allons trouver Pyrrhus. Mais non, chère Céphise, Va le trouver pour moi.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 20, 'Va le trouver pour moi. Que faut-il que je dise ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 21, 'Dis-lui que de mon fils l’amour est assez fort… Crois-tu que dans son cœur il ait juré sa mort ? L’amour peut-il si loin pousser sa barbarie ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 22, 'Madame, il va bientôt revenir en furie.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 23, 'Eh bien ! va l’assurer…'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 24, 'Eh bien ! va l’assurer… De quoi ? de votre foi ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 25, 'Hélas ! pour la promettre est-elle encore à moi ? Ô cendres d’un époux ! ô Troyens ! ô mon père ! Ô mon fils ! que tes jours coûtent cher à ta mère ! Allons.'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', 'e73b517b-dd0d-4385-b13c-3923b0bc469f', 26, 'Allons. Où donc, madame ? et que résolvez-vous ?'),
  ('3ae950c7-6060-4837-a3e4-c30d82faa104', '0f1e4470-2c36-4e2b-88e1-8014d12d6f50', 27, 'Allons sur son tombeau consulter mon époux.');

-- Acte IV, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('96e02368-ebcd-4662-844f-44db970789ea', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène première', 'Acte IV', 'acte-iv-scene-premiere', '{}', false);
insert into characters (id, scene_id, name) values ('ce2a1138-a52f-4870-a8ad-87baf00ecd65', '96e02368-ebcd-4662-844f-44db970789ea', 'CÉPHISE');
insert into characters (id, scene_id, name) values ('bd6e424c-c0a7-4afe-948a-b79c5104d4e1', '96e02368-ebcd-4662-844f-44db970789ea', 'ANDROMAQUE');
insert into lines (scene_id, character_id, "order", text) values
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 1, 'Ah ! je n’en doute point : c’est votre époux, madame, C’est Hector qui produit ce miracle en votre âme ! Il veut que Troie encor se puisse relever Avec cet heureux fils qu’il vous fait conserver.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 2, 'Pyrrhus vous l’a promis, vous venez de l’entendre, Madame : il n’attendait qu’un mot pour vous le rendre. Croyez-en ses transports : père, sceptre, alliés, Content de votre cœur, il met tout à vos pieds ;'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 3, 'Sur lui, sur tout son peuple il vous rend souveraine. Est-ce là ce vainqueur digne de tant de haine ?'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 4, 'Déjà, contre les Grecs plein d’un noble courroux, Le soin de votre fils le touche autant que vous : Il prévient leur fureur ; il lui laisse sa garde, Pour ne pas l’exposer, lui-même il se hasarde.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 5, 'Mais tout s’apprête au temple, et vous avez promis.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 6, 'Oui, je m’y trouverai. Mais allons voir mon fils.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 7, 'Madame, qui vous presse ? Il suffit que sa vue Désormais à vos yeux ne soit plus défendue. Vous lui pourrez bientôt prodiguer vos bontés, Et vos embrassements ne seront plus comptés.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 8, 'Quel plaisir d’élever un enfant qu’on voit croître, Non plus comme un esclave élevé pour son maître, Mais pour voir avec lui renaître tant de rois !'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 9, 'Céphise, allons le voir pour la dernière fois.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 10, 'Que dites-vous ? Ô dieux !'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 11, 'Que dites-vous ? Ô dieux ! Ô ma chère Céphise ! Ce n’est point avec toi que mon cœur se déguise : Ta foi, dans mon malheur, s’est montrée à mes yeux ; Mais j’ai cru qu’à mon tour tu me connaissais mieux. Quoi donc !'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 12, 'as-tu pensé qu’Andromaque infidèle Pût trahir un époux qui croit revivre en elle ; Et que, de tant de morts réveillant la douleur, Le soin de mon repos me fît troubler le leur ?'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 13, 'Est-ce là cette ardeur tant promise à sa cendre ? Mais son fils périssait, il l’a fallu défendre. Pyrrhus en m’épousant s’en déclare l’appui ; Il suffit : je veux bien m’en reposer sur lui.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 14, 'Je sais quel est Pyrrhus : violent mais sincère, Céphise, il fera plus qu’il n’a promis de faire.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 15, 'Sur le courroux des Grecs je m’en repose encor : Leur haine va donner un père au fils d’Hector, Je vais donc, puisqu’il faut que je me sacrifie, Assurer à Pyrrhus le reste de ma vie ;'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 16, 'Je vais, en recevant sa foi sur les autels, L’engager à mon fils par des nœuds immortels. Mais aussitôt ma main, à moi seule funeste, D’une infidèle vie abrégera le reste ;'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 17, 'Et, sauvant ma vertu, rendra ce que je doi À Pyrrhus, à mon fils, à mon époux, à moi. Voilà de mon amour l’innocent stratagème : Voilà ce qu’un époux m’a commandé lui-même. J’irai seule rejoindre Hector et mes aïeux.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 18, 'Céphise, c’est à toi de me fermer les yeux.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 19, 'Ah ! ne prétendez pas que je puisse survivre…'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 20, 'Non, non, je te défends, Céphise, de me suivre. Je confie à tes soins mon unique trésor : Si tu vivais pour moi, vis pour le fils d’Hector.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 21, 'De l’espoir des Troyens seule dépositaire, Songe à combien de rois tu deviens nécessaire. Veille auprès de Pyrrhus ; fais-lui garder sa foi : S’il le faut, je consens qu’on lui parle de moi.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 22, 'Fais-lui valoir l’hymen où je me suis rangée : Dis-lui qu’avant ma mort je lui fus engagée ; Que ses ressentiments doivent être effacés ; Qu’en lui laissant mon fils c’est l’estimer assez.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 23, 'Fais connaître à mon fils les héros de sa race ; Autant que tu pourras, conduis-le sur leur trace : Dis-lui par quels exploits leurs noms ont éclaté, Plutôt ce qu’ils ont fait que ce qu’ils ont été ;'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 24, 'Parle-lui tous les jours des vertus de son père ; Et quelquefois aussi parle-lui de sa mère. Mais qu’il ne songe plus, Céphise, à nous venger : Nous lui laissons un maître, il le doit ménager.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 25, 'Qu’il ait de ses aïeux un souvenir modeste : Il est du sang d’Hector, mais il en est le reste ; Et pour ce reste enfin j’ai moi-même, en un jour, Sacrifié mon sang, ma haine et mon amour.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'ce2a1138-a52f-4870-a8ad-87baf00ecd65', 26, 'Hélas !'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 27, 'Hélas ! Ne me suis point, si ton cœur en alarmes Prévoit qu’il ne pourra commander à tes larmes. On vient. Cache tes pleurs, Céphise ; et souviens-toi Que le sort d’Andromaque est commis à ta foi. C’est Hermione.'),
  ('96e02368-ebcd-4662-844f-44db970789ea', 'bd6e424c-c0a7-4afe-948a-b79c5104d4e1', 28, 'Allons, fuyons sa violence.');

-- Acte IV, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène II', 'Acte IV', 'acte-iv-scene-ii', '{}', false);
insert into characters (id, scene_id, name) values ('01c613b4-464f-48ca-8cb5-566d45d49dbe', 'c28a8dfe-620a-4057-94a5-ca183c0608ef', 'CLÉONE');
insert into characters (id, scene_id, name) values ('e622fdc0-5bd8-4e09-9426-ba73e75f721e', 'c28a8dfe-620a-4057-94a5-ca183c0608ef', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '01c613b4-464f-48ca-8cb5-566d45d49dbe', 1, 'Non, je ne puis assez admirer ce silence. Vous vous taisez, madame ; et ce cruel mépris N’a pas du moindre trouble agité vos esprits !'),
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '01c613b4-464f-48ca-8cb5-566d45d49dbe', 2, 'Vous soutenez en paix une si rude attaque, Vous qu’on voyait frémir au seul nom d’Andromaque ! Vous qui sans désespoir ne pouviez endurer Que Pyrrhus d’un regard la voulût honorer ! Il l’épouse ;'),
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '01c613b4-464f-48ca-8cb5-566d45d49dbe', 3, 'il lui donne, avec son diadème, La foi que vous venez de recevoir vous-même ; Et votre bouche encor, muette à tant d’ennui, N’a pas daigné s’ouvrir pour se plaindre de lui ! Ah !'),
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '01c613b4-464f-48ca-8cb5-566d45d49dbe', 4, 'que je crains, madame, un calme si funeste ! Et qu’il vaudrait bien mieux…'),
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', 'e622fdc0-5bd8-4e09-9426-ba73e75f721e', 5, 'Et qu’il vaudrait bien mieux… Fais-tu venir Oreste ?'),
  ('c28a8dfe-620a-4057-94a5-ca183c0608ef', '01c613b4-464f-48ca-8cb5-566d45d49dbe', 6, 'Il vient, madame, il vient ; et vous pouvez juger Que bientôt à vos pieds il allait se ranger, Prêt à servir toujours sans espoir de salaire : Vos yeux ne sont que trop assurés de lui plaire. Mais il entre.');

-- Acte IV, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('a797af55-2a94-498f-8323-9ff92818cd37', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène III', 'Acte IV', 'acte-iv-scene-iii', '{}', false);
insert into characters (id, scene_id, name) values ('f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 'a797af55-2a94-498f-8323-9ff92818cd37', 'ORESTE');
insert into characters (id, scene_id, name) values ('0d8a5d72-aee8-497e-a107-de1ede6662f6', 'a797af55-2a94-498f-8323-9ff92818cd37', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 1, 'Mais il entre. Ah, madame ! est-il vrai qu’une fois Oreste en vous cherchant obéisse à vos lois ? Ne m’a-t-on point flatté d’une fausse espérance ? Avez-vous en effet souhaité ma présence ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 2, 'Croirai-je que vos yeux, à la fin désarmés, Veulent…'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 3, 'Veulent… Je veux savoir, seigneur, si vous m’aimez.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 4, 'Si je vous aime ! ô dieux ! Mes serments, mes parjures, Ma fuite, mon retour, mes respects, mes injures, Mon désespoir, mes yeux de pleurs toujours noyés ; Quels témoins croirez-vous, si vous ne les croyez ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 5, 'Vengez-moi, je crois tout.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 6, 'Vengez-moi, je crois tout. Eh bien ! allons, madame : Mettons encore un coup toute la Grèce en flamme ; Prenons, en signalant mon bras et votre nom, Vous, la place d’Hélène, et moi, d’Agamemnon ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 7, 'De Troie en ce pays réveillons les misères ; Et qu’on parle de nous ainsi que de nos pères. Partons, je suis tout prêt.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 8, 'Partons, je suis tout prêt. Non, seigneur, demeurons ; Je ne veux point si loin porter de tels affronts. Quoi ! de mes ennemis couronnant l’insolence, J’irais attendre ailleurs une lente vengeance ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 9, 'Et je m’en remettrais au destin des combats, Qui peut-être à la fin ne me vengerait pas ? Je veux qu’à mon départ toute l’Épire pleure. Mais si vous me vengez, vengez-moi dans une heure.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 10, 'Tous vos retardements sont pour moi des refus. Courez au temple. Il faut immoler…'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 11, 'Courez au temple. Il faut immoler… Qui ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 12, 'Courez au temple. Il faut immoler… Qui ? Pyrrhus.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 13, 'Pyrrhus, madame !'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 14, 'Pyrrhus, Madame ! Eh quoi ! votre haine chancelle ? Ah ! courez, et craignez que je ne vous rappelle. N’alléguez point des droits que je veux oublier ; Et ce n’est pas à vous à le justifier.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 15, 'Moi, je l’excuserais ! Ah ! vos bontés, madame, Ont gravé trop avant ses crimes dans mon âme. Vengeons-nous, j’y consens, mais par d’autres chemins. Soyons ses ennemis, et non ses assassins ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 16, 'Faisons de sa ruine une juste conquête. Quoi ! pour réponse aux Grecs porterai-je sa tête ? Et n’ai-je pris sur moi le soin de tout l’État, Que pour m’en acquitter par un assassinat ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 17, 'Souffrez, au nom des dieux, que la Grèce s’explique, Et qu’il meure chargé de la haine publique. Souvenez-vous qu’il règne, et qu’un front couronné…'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 18, 'Ne vous suffit-il pas que je l’ai condamné ? Ne vous suffit-il pas que ma gloire offensée Demande une victime à moi seule adressée ; Qu’Hermione est le prix d’un tyran opprimé ; Que je le hais ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 19, 'enfin, seigneur, que je l’aimai ? Je ne m’en cache point : l’ingrat m’avait su plaire, Soit qu’ainsi l’ordonnât mon amour ou mon père, N’importe ; mais enfin réglez-vous là-dessus.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 20, 'Malgré mes vœux, seigneur, honteusement déçus, Malgré la juste horreur que son crime me donne, Tant qu’il vivra, craignez que je ne lui pardonne.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 21, 'Doutez jusqu’à sa mort d’un courroux incertain : S’il ne meurt aujourd’hui, je puis l’aimer demain.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 22, 'Eh bien ! il faut le perdre, et prévenir sa grâce ; Il faut… Mais cependant que faut-il que je fasse ? Comment puis-je sitôt servir votre courroux ? Quel chemin jusqu’à lui peut conduire mes coups ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 23, 'À peine suis-je encore arrivé dans l’Épire, Vous voulez par mes mains renverser un empire ; Vous voulez qu’un roi meure ; et pour son châtiment Vous ne donnez qu’un jour, qu’une heure, qu’un moment ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 24, 'Aux yeux de tout son peuple il faut que je l’opprime. Laissez-moi vers l’autel conduire ma victime, Je ne m’en défends plus ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 25, 'et je ne veux qu’aller Reconnaître la place où je dois l’immoler : Cette nuit je vous sers, cette nuit je l’attaque.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 26, 'Mais cependant, ce jour, il épouse Andromaque ; Dans le temple déjà le trône est élevé, Ma honte est confirmée, et son crime achevé. Enfin qu’attendez-vous ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 27, 'Il vous offre sa tête : Sans gardes, sans défense, il marche à cette fête ; Autour du fils d’Hector il les fait tous ranger ; Il s’abandonne au bras qui me voudra venger. Voulez-vous malgré lui prendre soin de sa vie ?'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 28, 'Armez, avec vos Grecs, tous ceux qui m’ont suivie ; Soulevez vos amis ; tous les miens sont à vous : Il me trahit, vous trompe, et nous méprise tous. Mais quoi !'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 29, 'déjà leur haine est égale à la mienne : Elle épargne à regret l’époux d’une Troyenne. Parlez : mon ennemi ne vous peut échapper, Ou plutôt il ne faut que les laisser frapper. Conduisez ou suivez une fureur si belle ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 30, 'Revenez tout couvert du sang de l’infidèle ; Allez : en cet état soyez sûr de mon cœur.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 31, 'Mais, madame, songez…'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 32, 'Mais, madame, songez… Ah ! c’en est trop, seigneur. Tant de raisonnements offensent ma colère. J’ai voulu vous donner les moyens de me plaire, Rendre Oreste content ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 33, 'mais enfin je vois bien Qu’il veut toujours se plaindre, et ne mériter rien. Partez : allez ailleurs vanter votre constance, Et me laissez ici le soin de ma vengeance. De mes lâches bontés mon courage est confus ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 34, 'Et c’est trop en un jour essuyer de refus. Je m’en vais seule au temple où leur hymen s’apprête, Où vous n’osez aller mériter ma conquête : Là, de mon ennemi je saurai m’approcher ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 35, 'Je percerai le cœur que je n’ai pu toucher ; Et mes sanglantes mains, sur moi-même tournées, Aussitôt, malgré lui, joindront nos destinées ;'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 36, 'Et tout ingrat qu’il est, il me sera plus doux De mourir avec lui que de vivre avec vous.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', 'f0ebeb66-6b28-4282-91fd-ea3d9625c68a', 37, 'Non, je vous priverai de ce plaisir funeste, Madame : il ne mourra que de la main d’Oreste. Vos ennemis par moi vont vous être immolés, Et vous reconnaîtrez mes soins, si vous voulez.'),
  ('a797af55-2a94-498f-8323-9ff92818cd37', '0d8a5d72-aee8-497e-a107-de1ede6662f6', 38, 'Allez. De votre sort laissez-moi la conduite, Et que tous vos vaisseaux soient prêts pour notre fuite.');

-- Acte IV, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène IV', 'Acte IV', 'acte-iv-scene-iv', '{}', false);
insert into characters (id, scene_id, name) values ('7d0f0aa7-e93e-473f-a7ba-4759d6cfbe4c', 'c1851e38-96e4-4ba9-852b-e56e76914e71', 'CLÉONE');
insert into characters (id, scene_id, name) values ('60ba7935-5721-44ab-a13e-b0b35dcbce29', 'c1851e38-96e4-4ba9-852b-e56e76914e71', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '7d0f0aa7-e93e-473f-a7ba-4759d6cfbe4c', 1, 'Vous vous perdez, madame ; et vous devez songer…'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 2, 'Que je me perde ou non, je songe à me venger.'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 3, 'Je ne sais même encor, quoi qu’il m’ait pu promettre, Sur d’autres que sur moi si je dois m’en remettre : Pyrrhus n’est pas coupable à ses yeux comme aux miens, Et je tiendrais mes coups bien plus sûrs que les siens.'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 4, 'Quel plaisir de venger moi-même mon injure, De retirer mon bras teint du sang du parjure ; Et pour rendre sa peine et mes plaisirs plus grands, De cacher ma rivale à ses regards mourants ! Ah !'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 5, 'si du moins Oreste, en punissant son crime, Lui laissait le regret de mourir ma victime ! Va le trouver : dis-lui qu’il apprenne à l’ingrat Qu’on l’immole à ma haine, et non pas à l’État.'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 6, 'Chère Cléone, cours : ma vengeance est perdue S’il ignore en mourant que c’est moi qui le tue.'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '7d0f0aa7-e93e-473f-a7ba-4759d6cfbe4c', 7, 'Je vous obéirai. Mais qu’est-ce que je voi ? Ô dieux ! qui l’aurait cru, madame ? c’est le roi !'),
  ('c1851e38-96e4-4ba9-852b-e56e76914e71', '60ba7935-5721-44ab-a13e-b0b35dcbce29', 8, 'Ah ! cours après Oreste ; et dis-lui, ma Cléone, Qu’il n’entreprenne rien sans revoir Hermione !');

-- Acte IV, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène V', 'Acte IV', 'acte-iv-scene-v', '{}', false);
insert into characters (id, scene_id, name) values ('92c22d3a-cf94-4d51-82a1-6e138397c5ee', 'a6407d2f-1758-4113-aae9-2b7f4ee90668', 'PYRRHUS');
insert into characters (id, scene_id, name) values ('9e44e361-fdfc-47c3-86b2-83a7a64bea72', 'a6407d2f-1758-4113-aae9-2b7f4ee90668', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 1, 'Vous ne m’attendiez pas, madame, et je vois bien Que mon abord ici trouble votre entretien.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 2, 'Je ne viens point, armé d’un indigne artifice, D’un voile d’équité couvrir mon injustice : Il suffit que mon cœur me condamne tout bas ; Et je soutiendrais mal ce que je ne crois pas. J’épouse une Troyenne.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 3, 'Oui, madame, et j’avoue Que je vous ai promis la foi que je lui voue.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 4, 'Un autre vous dirait que dans les champs troyens Nos deux pères sans nous formèrent ces liens, Et que, sans consulter ni mon choix ni le vôtre, Nous fûmes sans amour attachés l’un à l’autre ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 5, 'Mais c’est assez pour moi que je me sois soumis. Par mes ambassadeurs mon cœur vous fut promis ; Loin de les révoquer, je voulus y souscrire : Je vous vis avec eux arriver en Épire ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 6, 'Et quoique d’un autre œil l’éclat victorieux Eût déjà prévenu le pouvoir de vos yeux, Je ne m’arrêtai point à cette ardeur nouvelle, Je voulus m’obstiner à vous être fidèle ; Je vous reçus en reine ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 7, 'et jusques à ce jour J’ai cru que mes serments me tiendraient lieu d’amour. Mais cet amour l’emporte ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 8, 'et par un coup funeste, Andromaque m’arrache un cœur qu’elle déteste : L’un par l’autre entraînés, nous courons à l’autel Nous jurer malgré nous un amour immortel.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 9, 'Après cela, madame, éclatez contre un traître, Qui l’est avec douleur, et qui pourtant veut l’être. Pour moi, loin de contraindre un si juste courroux, Il me soulagera peut-être autant que vous.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 10, 'Donnez-moi tous les noms destinés aux parjures : Je crains votre silence, et non pas vos injures ; Et mon cœur, soulevant mille secrets témoins, M’en dira d’autant plus que vous m’en direz moins.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 11, 'Seigneur, dans cet aveu dépouillé d’artifice, J’aime à voir que du moins vous vous rendiez justice Et que, voulant bien rompre un nœud si solennel, Vous vous abandonniez au crime en criminel.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 12, 'Est-il juste, après tout, qu’un conquérant s’abaisse Sous la servile loi de garder sa promesse ? Non, non, la perfidie a de quoi vous tenter ; Et vous ne me cherchez que pour vous en vanter. Quoi !'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 13, 'sans que ni serment ni devoir vous retienne, Rechercher une Grecque, amant d’une Troyenne ; Me quitter, me reprendre, et retourner encor De la fille d’Hélène à la veuve d’Hector ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 14, 'Couronner tour à tour l’esclave et la princesse ; Immoler Troie aux Grecs, au fils d’Hector la Grèce ! Tout cela part d’un cœur toujours maître de soi, D’un héros qui n’est point esclave de sa foi.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 15, 'Pour plaire à votre épouse, il vous faudrait peut-être Prodiguer les doux noms de parjure et de traître. Vous veniez de mon front observer la pâleur, Pour aller dans ses bras rire de ma douleur.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 16, 'Pleurante après son char vous voulez qu’on me voie ; Mais, seigneur, en un jour ce serait trop de joie ; Et sans chercher ailleurs des titres empruntés, Ne vous suffit-il pas de ceux que vous portez ?'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 17, 'Du vieux père d’Hector la valeur abattue Aux pieds de sa famille expirante à sa vue, Tandis que dans son sein votre bras enfoncé Cherche un reste de sang que l’âge avait glacé ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 18, 'Dans des ruisseaux de sang Troie ardente plongée ; De votre propre main Polyxène égorgée Aux yeux de tous les Grecs indignés contre vous : Que peut-on refuser à ces généreux coups ?'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 19, 'Madame, je sais trop à quel excès de rage La vengeance d’Hélène emporta mon courage : Je puis me plaindre à vous du sang que j’ai versé ; Mais enfin je consens d’oublier le passé.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 20, 'Je rends grâces au ciel que votre indifférence De mes heureux soupirs m’apprenne l’innocence. Mon cœur, je le vois bien, trop prompt à se gêner, Devait mieux vous connaître et mieux s’examiner.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 21, 'Mes remords vous faisaient une injure mortelle ; Il faut se croire aimé pour se croire infidèle. Vous ne prétendiez point m’arrêter dans vos fers : Je crains de vous trahir, peut-être je vous sers.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '92c22d3a-cf94-4d51-82a1-6e138397c5ee', 22, 'Nos cœurs n’étaient point faits dépendants l’un de l’autre : Je suivais mon devoir, et vous cédiez au vôtre : Rien ne vous engageait à m’aimer en effet.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 23, 'Je ne t’ai point aimé, cruel ! Qu’ai-je donc fait ? J’ai dédaigné pour toi les vœux de tous nos princes ; Je t’ai cherché moi-même au fond de tes provinces ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 24, 'J’y suis encor, malgré tes infidélités, Et malgré tous mes Grecs honteux de mes bontés. Je leur ai commandé de cacher mon injure ; J’attendais en secret le retour d’un parjure ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 25, 'J’ai cru que tôt ou tard, à ton devoir rendu, Tu me rapporterais un cœur qui m’était dû. Je t’aimais inconstant, qu’aurais-je fait fidèle ?'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 26, 'Et même en ce moment où ta bouche cruelle Vient si tranquillement m’annoncer le trépas, Ingrat, je doute encor si je ne t’aime pas.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 27, 'Mais, seigneur, s’il le faut, si le ciel en colère Réserve à d’autres yeux la gloire de vous plaire, Achevez votre hymen, j’y consens ; mais du moins Ne forcez pas mes yeux d’en être les témoins.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 28, 'Pour la dernière fois je vous parle peut-être. Différez-le d’un jour, demain vous serez maître… Vous ne répondez point ! Perfide, je le voi, Tu comptes les moments que tu perds avec moi !'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 29, 'Ton cœur, impatient de revoir ta Troyenne, Ne souffre qu’à regret qu’un autre t’entretienne. Tu lui parles du cœur, tu la cherches des yeux. Je ne te retiens plus, sauve-toi de ces lieux ;'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 30, 'Va lui jurer la foi que tu m’avais jurée ; Va profaner des dieux la majesté sacrée : Ces dieux, ces justes dieux n’auront pas oublié Que les mêmes serments avec moi t’ont lié.'),
  ('a6407d2f-1758-4113-aae9-2b7f4ee90668', '9e44e361-fdfc-47c3-86b2-83a7a64bea72', 31, 'Porte aux pieds des autels ce cœur qui m’abandonne ; Va, cours ; mais crains encor d’y trouver Hermione.');

-- Acte IV, Scène VI
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('8d0ea36a-5a49-41f5-8c8f-1af2364172a5', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte IV, Scène VI', 'Acte IV', 'acte-iv-scene-vi', '{}', false);
insert into characters (id, scene_id, name) values ('9bca5e7a-7ab8-4b59-9066-1ab5458e079e', '8d0ea36a-5a49-41f5-8c8f-1af2364172a5', 'PHŒNIX');
insert into characters (id, scene_id, name) values ('05b894d8-74e8-44b0-98bf-40514bde63f3', '8d0ea36a-5a49-41f5-8c8f-1af2364172a5', 'PYRRHUS');
insert into lines (scene_id, character_id, "order", text) values
  ('8d0ea36a-5a49-41f5-8c8f-1af2364172a5', '9bca5e7a-7ab8-4b59-9066-1ab5458e079e', 1, 'Seigneur, vous entendez : gardez de négliger Une amante en fureur qui cherche à se venger. Elle n’est en ces lieux que trop bien appuyée ; La querelle des Grecs à la sienne est liée ; Oreste l’aime encore ;'),
  ('8d0ea36a-5a49-41f5-8c8f-1af2364172a5', '9bca5e7a-7ab8-4b59-9066-1ab5458e079e', 2, 'et peut-être à ce prix…'),
  ('8d0ea36a-5a49-41f5-8c8f-1af2364172a5', '05b894d8-74e8-44b0-98bf-40514bde63f3', 3, 'Andromaque m’attend. Phœnix, garde son fils.');

-- Acte V, Scène première
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte V, Scène première', 'Acte V', 'acte-v-scene-premiere', '{}', false);
insert into characters (id, scene_id, name) values ('00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 'f68dfb84-ee97-4836-ad3e-dc034819a0d3', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 1, 'Où suis-je ? Qu’ai-je fait ? Que dois-je faire encore ? Quel transport me saisit ? Quel chagrin me dévore ? Errante et sans dessein, je cours dans ce palais. Ah ! ne puis-je savoir si j’aime ou si je hais ? Le cruel !'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 2, 'de quel œil il m’a congédiée : Sans pitié, sans douleur au moins étudiée ! L’ai-je vu s’attendrir, se troubler un moment ? En ai-je pu tirer un seul gémissement ?'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 3, 'Muet à mes soupirs, tranquille à mes alarmes, Semblait-il seulement qu’il eût part à mes larmes ? Et je le plains encore ! Et pour comble d’ennui, Mon cœur, mon lâche cœur s’intéresse pour lui !'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 4, 'Je tremble au seul penser du coup qui le menace ! Et prête à me venger je lui fais déjà grâce ! Non, ne révoquons point l’arrêt de mon courroux. Qu’il périsse ! aussi bien il ne vit plus pour nous.'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 5, 'Le perfide triomphe, et se rit de ma rage : Il pense voir en pleurs dissiper cet orage ; Il croit que, toujours faible, et d’un cœur incertain, Je parerai d’un bras les coups de l’autre main.'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 6, 'Il juge encor de moi par mes bontés passées. Mais plutôt le perfide a bien d’autres pensées : Triomphant dans le temple, il ne s’informe pas Si l’on souhaite ailleurs sa vie ou son trépas.'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 7, 'Il me laisse, l’ingrat, cet embarras funeste. Non, non, encore un coup, laissons agir Oreste. Qu’il meure, puisque enfin il a dû le prévoir, Et puisqu’il m’a forcée enfin à le vouloir… À le vouloir ? Eh quoi !'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 8, 'c’est donc moi qui l’ordonne ? Sa mort sera l’effet de l’amour d’Hermione ? Ce prince, dont mon cœur se faisait autrefois Avec tant de plaisir redire les exploits ;'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 9, 'À qui même en secret je m’étais destinée Avant qu’on eût conclu ce fatal hyménée ! Je n’ai donc traversé tant de mers, tant d’États, Que pour venir si loin préparer son trépas, L’assassiner, le perdre ? Ah !'),
  ('f68dfb84-ee97-4836-ad3e-dc034819a0d3', '00a81c9e-fda2-4d09-b9d4-79057c9f7c91', 10, 'devant qu’il expire…');

-- Acte V, Scène II
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte V, Scène II', 'Acte V', 'acte-v-scene-ii', '{}', false);
insert into characters (id, scene_id, name) values ('045a0943-8b70-42d5-b22b-788be51705a8', '5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'HERMIONE');
insert into characters (id, scene_id, name) values ('b3781726-2ec8-4a59-a05e-3530c4bf1501', '5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'CLÉONE');
insert into lines (scene_id, character_id, "order", text) values
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 1, 'Ah ! qu’ai-je fait, Cléone ? et que viens-tu me dire ? Que fait Pyrrhus ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 2, 'Que fait Pyrrhus ? Il est au comble de ses vœux, Le plus fier des mortels, et le plus amoureux. Je l’ai vu vers le temple, où son hymen s’apprête, Mener en conquérant sa nouvelle conquête ;'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 3, 'Et d’un œil où brillaient sa joie et son espoir, S’enivrer en marchant du plaisir de la voir. Andromaque, au travers de mille cris de joie, Porte jusqu’aux autels le souvenir de Troie ;'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 4, 'Incapable toujours d’aimer et de haïr, Sans joie et sans murmure elle semble obéir.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 5, 'Et l’ingrat ? jusqu’au bout il a poussé l’outrage ? Mais as-tu bien, Cléone, observé son visage ? Goûte-t-il des plaisirs tranquilles et parfaits ? N’a-t-il point détourné ses yeux vers le palais ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 6, 'Dis-moi, ne t’es-tu point présentée à sa vue ? L’ingrat a-t-il rougi lorsqu’il t’a reconnue ? Son trouble avouait-il son infidélité ? A-t-il jusqu’à la fin soutenu sa fierté ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 7, 'Madame, il ne voit rien : son salut et sa gloire Semblent être avec vous sortis de sa mémoire. Sans songer qui le suit, ennemis ou sujets, Il poursuit seulement ses amoureux projets.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 8, 'Autour du fils d’Hector il a rangé sa garde, Et croit que c’est lui seul que le péril regarde. Phœnix même en répond, qui l’a conduit exprès Dans un fort éloigné du temple et du palais.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 9, 'Voilà dans ses transports le seul soin qui lui reste.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 10, 'Le perfide ! Il mourra. Mais que t’a dit Oreste ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 11, 'Oreste avec ses Grecs dans le temple est entré.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 12, 'Eh bien ! à me venger n’est-il pas préparé ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 13, 'Je ne sais.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 14, 'Je ne sais. Tu ne sais ! Quoi donc ! Oreste encore, Oreste me trahit ?'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 15, 'Oreste me trahit ? Oreste vous adore ; Mais de mille remords son esprit combattu Croit tantôt son amour et tantôt sa vertu. Il respecte en Pyrrhus l’honneur du diadème ; Il respecte en Pyrrhus Achille et Pyrrhus même ;'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 16, 'Il craint les Grecs, il craint l’univers en courroux ; Mais il se craint, dit-il, soi-même plus que tous. Il voudrait en vainqueur vous apporter sa tête : Le seul nom d’assassin l’épouvante et l’arrête.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', 'b3781726-2ec8-4a59-a05e-3530c4bf1501', 17, 'Enfin il est entré, sans savoir dans son cœur S’il en devait sortir coupable ou spectateur.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 18, 'Non, non, il les verra triompher sans obstacle ; Il se gardera bien de troubler ce spectacle. Je sais de quels remords son courage est atteint : Le lâche craint la mort, et c’est tout ce qu’il craint. Quoi !'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 19, 'sans qu’elle employât une seule prière, Ma mère en sa faveur arma la Grèce entière ; Ses yeux pour leur querelle, en dix ans de combats, Virent périr vingt rois qu’ils ne connaissaient pas ;'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 20, 'Et moi, je ne prétends que la mort d’un parjure, Et je charge un amant du soin de mon injure ; Il peut me conquérir à ce prix, sans danger ; Je me livre moi-même, et ne puis me venger !'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 21, 'Allons : c’est à moi seule à me rendre justice. Que de cris de douleur le temple retentisse ; De leur hymen fatal troublons l’événement ; Et qu’ils ne soient unis, s’il se peut, qu’un moment.'),
  ('5dd3709c-b42b-46c5-a419-39c1b6b358f7', '045a0943-8b70-42d5-b22b-788be51705a8', 22, 'Je ne choisirai point dans ce désordre extrême ; Tout me sera Pyrrhus, fût-ce Oreste lui-même. Je mourrai ; mais au moins ma mort me vengera : Je ne mourrai pas seule, et quelqu’un me suivra.');

-- Acte V, Scène III
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte V, Scène III', 'Acte V', 'acte-v-scene-iii', array['acte-iv-scene-5']::text[], false);
insert into characters (id, scene_id, name) values ('b0a5e3ee-ca95-4465-b51e-36c5929b8428', '8a168b01-551f-453f-b958-aa13fb2e4987', 'ORESTE');
insert into characters (id, scene_id, name) values ('5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', '8a168b01-551f-453f-b958-aa13fb2e4987', 'HERMIONE');
insert into lines (scene_id, character_id, "order", text) values
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 1, 'Madame, c’en est fait, et vous êtes servie : Pyrrhus rend à l’autel son infidèle vie.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 2, 'Il est mort !'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 3, 'Il est mort ! Il expire ; et nos Grecs irrités Ont lavé dans son sang ses infidélités. Je vous l’avais promis ;'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 4, 'et quoique mon courage Se fît de ce complot une funeste image, J’ai couru vers le temple, où nos Grecs dispersés Se sont jusqu’à l’autel dans la foule glissés.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 5, 'Pyrrhus m’a reconnu, mais sans changer de face : Il semblait que ma vue excitât son audace ; Que tous les Grecs, bravés en leur ambassadeur, Dussent de son hymen relever la splendeur.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 6, 'Enfin, avec transport prenant son diadème, Sur le front d’Andromaque il l’a posé lui-même : « Je vous donne, a-t-il dit, ma couronne et ma foi ! « Andromaque ; régnez sur l’Épire et sur moi.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 7, '« Je voue à votre fils une amitié de père ; « J’en atteste les dieux, je le jure à sa mère : « Pour tous mes ennemis je déclare les siens, « Et je le reconnais pour le roi des Troyens.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 8, '» À ces mots, qui du peuple attiraient le suffrage, Nos Grecs n’ont répondu que par un cri de rage ;'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 9, 'L’infidèle s’est vu partout envelopper, Et je n’ai pu trouver de place pour frapper : Chacun se disputait la gloire de l’abattre.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 10, 'Je l’ai vu dans leurs mains quelque temps se débattre, Tout sanglant à leurs coups vouloir se dérober ; Mais enfin à l’autel il est allé tomber.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 11, 'Du peuple épouvanté j’ai traversé la presse Pour venir de ces lieux enlever ma princesse, Et regagner le port, où bientôt nos amis Viendront couverts du sang que je vous ai promis.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 12, 'Qu’ont-ils fait !'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 13, 'Qu’ont-ils fait ! Pardonnez à leur impatience : Ils ont, je le vois bien, trahi votre vengeance ; Vous vouliez que ma main portât les premiers coups, Qu’il sentît en mourant qu’il expirait pour vous ;'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 14, 'Mais c’est moi dont l’ardeur leur a servi d’exemple : Je les ai pour vous seule entraînés dans le temple, Madame ; et vous pouvez justement vous flatter D’une mort que leurs bras n’ont fait qu’exécuter.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 15, 'Vous seule avez poussé les coups…'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 16, 'Vous seule avez poussé les coups… Tais-toi, perfide, Et n’impute qu’à toi ton lâche parricide. Va faire chez tes Grecs admirer ta fureur. Va : je la désavoue, et tu me fais horreur. Barbare, qu’as-tu fait ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 17, 'Avec quelle furie As-tu tranché le cours d’une si belle vie ? Avez-vous pu, cruels, l’immoler aujourd’hui, Sans que tout votre sang se soulevât pour lui ? Mais parle : de son sort qui t’a rendu l’arbitre ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 18, 'Pourquoi l’assassiner ? Qu’a-t-il fait ? À quel titre ? Qui te l’a dit ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', 'b0a5e3ee-ca95-4465-b51e-36c5929b8428', 19, 'Qui te l’a dit ? Ô dieux ! Quoi ! ne m’avez-vous pas Vous même, ici, tantôt, ordonné son trépas ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 20, 'Ah ! fallait-il en croire une amante insensée ? Ne devais-tu pas lire au fond de ma pensée ? Et ne voyais-tu pas, dans mes emportements, Que mon cœur démentait ma bouche à tous moments ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 21, 'Quand je l’aurais voulu, fallait-il y souscrire ? N’as-tu pas dû cent fois te le faire redire ? Toi-même avant le coup me venir consulter, Y revenir encore, ou plutôt m’éviter ?'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 22, 'Que ne me laissais-tu le soin de ma vengeance ? Qui t’amène en des lieux où l’on fuit ta présence ? Voilà de ton amour le détestable fruit : Tu m’apportais, cruel, le malheur qui te suit.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 23, 'C’est toi dont l’ambassade, à tous les deux fatale, L’a fait pour son malheur pencher vers ma rivale. Nous le verrions encor nous partager ses soins ; Il m’aimerait peut-être, il le feindrait du moins. Adieu.'),
  ('8a168b01-551f-453f-b958-aa13fb2e4987', '5eaaafaa-f42a-4eb7-ae6e-f7fdbcaed92e', 24, 'Tu peux partir. Je demeure en Épire : Je renonce à la Grèce, à Sparte, à son empire, À toute ma famille ; et c’est assez pour moi, Traître, qu’elle ait produit un monstre tel que toi.');

-- Acte V, Scène IV
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte V, Scène IV', 'Acte V', 'acte-v-scene-iv', '{}', false);
insert into characters (id, scene_id, name) values ('aec445e7-d88d-455e-a51c-41c8b21c5ff3', 'aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'aec445e7-d88d-455e-a51c-41c8b21c5ff3', 1, 'Que vois-je ? Est-ce Hermione ? Et que viens-je d’entendre ? Pour qui coule le sang que je viens de répandre ? Je suis, si je l’en crois, un traître, un assassin. Est-ce Pyrrhus qui meurt ? Et suis-je Oreste enfin ?'),
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'aec445e7-d88d-455e-a51c-41c8b21c5ff3', 2, 'Quoi ! j’étouffe en mon cœur la raison qui m’éclaire, J’assassine à regret un roi que je révère ;'),
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'aec445e7-d88d-455e-a51c-41c8b21c5ff3', 3, 'Je viole en un jour les droits des souverains, Ceux des ambassadeurs, et tous ceux des humains, Ceux même des autels où ma fureur l’assiége ; Je deviens parricide, assassin, sacrilége ! Pour qui ?'),
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'aec445e7-d88d-455e-a51c-41c8b21c5ff3', 4, 'Pour une ingrate à qui je le promets, Qui même, s’il ne meurt, ne me verra jamais, Dont j’épouse la rage ! Et quand je l’ai servie, Elle me redemande et son sang et sa vie ! Elle l’aime ! et je suis un monstre furieux !'),
  ('aa4a7aa9-1f92-4735-9477-185fb0b490c7', 'aec445e7-d88d-455e-a51c-41c8b21c5ff3', 5, 'Je la vois pour jamais s’éloigner de mes yeux ! Et l’ingrate en fuyant me laisse pour salaire Tous les noms odieux que j’ai pris pour lui plaire !');

-- Acte V, Scène V
insert into scenes (id, work_id, author, title, chapter, slug, previous_slugs, is_private) values
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '8c090f49-81d4-499f-a3b7-cdaf9826dd02', 'Jean Racine', 'Acte V, Scène V', 'Acte V', 'acte-v-scene-v', '{}', false);
insert into characters (id, scene_id, name) values ('50a3f527-cb7a-4395-aa27-068503b5c6e7', '9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', 'PYLADE');
insert into characters (id, scene_id, name) values ('4bb354f2-6706-401e-8d9b-647b04c69c19', '9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', 'ORESTE');
insert into lines (scene_id, character_id, "order", text) values
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 1, 'Il faut partir, seigneur. Sortons de ce palais, Ou bien résolvons-nous de n’en sortir jamais. Nos Grecs, pour un moment, en défendent la porte : Tout le peuple assemblé nous poursuit à main-forte.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 2, 'Aux ordres d’Andromaque ici tout est soumis ; Ils la traitent en reine, et nous comme ennemis. Andromaque elle-même, à Pyrrhus si rebelle, Lui rend tous les devoirs d’une veuve fidèle, Commande qu’on le venge ;'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 3, 'et peut-être qu’encor Elle poursuit sur nous la vengeance d’Hector. Allons, n’attendons pas que l’on nous environne ; Nos Grecs nous rejoindront ;'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 4, 'et tandis qu’Hermione Tient encore le peuple autour d’elle arrêté, Voilà notre chemin, sortons en sûreté.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 5, 'Non, non, c’est Hermione, amis, que je veux suivre : À son dernier arrêt je ne puis plus survivre. Partez : j’ai fait le crime, et je vais l’expier.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 6, 'Hermione, seigneur ? Il la faut oublier. Quoi ! toujours l’instrument et l’objet de sa rage, Cherchez-vous chez les morts quelque nouvel outrage ? Et parce qu’elle meurt faut-il que vous mouriez ?'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 7, 'Elle meurt ! Dieux ! qu’entends-je !'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 8, 'Elle meurt ! Dieux ! qu’entends-je ! Eh quoi ! vous l’ignoriez ? En rentrant dans ces lieux nous l’avons rencontrée Qui courait vers le temple, inquiète, égarée.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 9, 'Elle a trouvé Pyrrhus porté sur des soldats Que son sang excitait à venger son trépas. Sans doute à cet objet sa rage s’est émue.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 10, 'Mais du haut de la porte enfin nous l’avons vue Un poignard à la main sur Pyrrhus se courber, Lever les yeux au ciel, se frapper, et tomber.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 11, 'Grâce aux dieux, mon malheur passe mon espérance ! Oui, je te loue, ô ciel, de ta persévérance ! Appliqué sans relâche au soin de me punir, Au comble des douleurs tu m’as fait parvenir ;'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 12, 'Ta haine a pris plaisir à former ma misère ; J’étais né pour servir d’exemple à ta colère, Pour être du malheur un modèle accompli. Eh bien ! je meurs content, et mon sort est rempli. Où sont ces deux amants ?'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 13, 'Pour couronner ma joie, Dans leur sang, dans le mien, il faut que je me noie ;'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 14, 'L’un et l’autre en mourant je les veux regarder : Réunissons trois cœurs qui n’ont pu s’accorder… Mais quelle épaisse nuit tout à coup m’environne ? De quel côté sortir ? D’où vient que je frissonne ?'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 15, 'Quelle horreur me saisit ? Grâce au ciel, j’entrevoi… Dieux ! quels ruisseaux de sang coulent autour de moi !'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 16, 'Ah, seigneur !'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 17, 'Ah, seigneur ! Quoi ! Pyrrhus, je te rencontre encore ! Trouverai-je partout un rival que j’abhorre ? Percé de tant de coups, comment t’es-tu sauvé ? Tiens, tiens, voilà le coup que je t’ai réservé. Mais que vois-je ?'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 18, 'À mes yeux Hermione l’embrasse ! Elle vient l’arracher au coup qui le menace ! Dieux ! quels affreux regards elle jette sur moi ! Quels démons ! quels serpents traîne-t-elle après soi ? Eh bien !'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 19, 'filles d’enfer, vos mains sont-elles prêtes ? Pour qui sont ces serpents qui sifflent sur vos têtes ? À qui destinez-vous l’appareil qui vous suit ? Venez-vous m’enlever dans l’éternelle nuit ?'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '4bb354f2-6706-401e-8d9b-647b04c69c19', 20, 'Venez, à vos fureurs Oreste s’abandonne. Mais non, retirez-vous, laissez faire Hermione : L’ingrate mieux que vous saura me déchirer ; Et je lui porte enfin mon cœur à dévorer.'),
  ('9a623ac7-40d3-45d5-a9cd-f5db5ba5812c', '50a3f527-cb7a-4395-aa27-068503b5c6e7', 21, 'Il perd le sentiment. Amis, le temps nous presse ; Ménageons les moments que ce transport nous laisse : Sauvons-le. Nos efforts deviendraient impuissants S’il reprenait ici sa rage avec ses sens.');

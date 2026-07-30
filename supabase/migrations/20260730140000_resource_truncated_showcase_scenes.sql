-- Scènes « vitrine » : remplacement des extraits tronqués par le texte complet.
--
-- Les scènes seedées en juin/juillet 2026 avec un slug éditorial (la tirade du nez,
-- les imprécations de Don Diègue…) ne contenaient qu'un fragment du texte, de 2,5 à
-- 22 fois plus court que l'original — alors que buildSceneMetadata annonce
-- « texte intégral » sur chacune. Ruy Blas III,2 allait plus loin : quatre fragments
-- de vers non contigus avaient été recousus en une réplique unique.
--
-- C'est d'abord un défaut produit : quelqu'un qui prépare la tirade du nez pour une
-- audition en recevait un tiers. Le contenu vient de Wikisource, édition par édition :
--   Cyrano              — Cyrano de Bergerac (Rostand)/Acte I
--   Le Cid              — Le Cid/Édition Marty-Laveaux/Acte I
--   Ruy Blas            — Ruy Blas/Acte 3
--   Le Mariage de Figaro— Le Mariage de Figaro/Acte V
--   L'Avare             — L'Avare (Molière)/Édition Louandre, 1910/Acte I
--   On ne badine pas…   — On ne badine pas avec l'amour (1884)/Acte III
--
-- Les lignes et personnages sont remplacés ; la scène elle-même (id, titre, chapter)
-- ne bouge pas, donc aucune URL ne change — sauf Le Mariage de Figaro, cf. plus bas.
--
-- Cas particulier Cyrano : la page est un extrait éditorial assumé (« la tirade du
-- nez »), pas la scène I,4 entière — 219 répliques et 36 personnages de scène de
-- foule, inutilisables pour apprendre une tirade. On y met donc la tirade COMPLÈTE :
-- le bloc CYRANO contigu, 15 cartes contre 6 « tons » servis jusqu'ici.
--
-- Cas particulier Le Cid : l'édition Marty-Laveaux colle les numéros de vers au texte
-- (« 240Que pour voir… »). Ils sont retirés ici sur toute l'œuvre, pas seulement sur
-- la scène re-sourcée — c'était visible sur les 12 scènes du Cid.


-- cyrano-de-bergerac/acte-i-scene-4-la-tirade-du-nez — tirade complète (15 cartes) au lieu de 6 « tons » sur la vingtaine de l'original
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'cyrano-de-bergerac' and s.slug = 'acte-i-scene-4-la-tirade-du-nez';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'CYRANO');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Ha ! C’est tout ?…Mais…Ah ! non ! c’est un peu court, jeune homme ! On pouvait dire… Oh ! Dieu !'),
    (v_scene, v_c0, 2, '… bien des choses en somme… En variant le ton, — par exemple, tenez : Agressif : « Moi, monsieur, si j’avais un tel nez, Il faudrait sur-le-champ que je me l’amputasse !'),
    (v_scene, v_c0, 3, '» Amical : « Mais il doit tremper dans votre tasse ! Pour boire, faites-vous fabriquer un hanap ! » Descriptif : « C’est un roc !… c’est un pic !… c’est un cap ! Que dis-je, c’est un cap ?… C’est une péninsule !'),
    (v_scene, v_c0, 4, '» Curieux : « De quoi sert cette oblongue capsule ? D’écritoire, monsieur, ou de boîte à ciseaux ?'),
    (v_scene, v_c0, 5, '» Gracieux : « Aimez-vous à ce point les oiseaux Que paternellement vous vous préoccupâtes De tendre ce perchoir à leurs petites pattes ?'),
    (v_scene, v_c0, 6, '» Truculent : « Çà, monsieur, lorsque vous pétunez, La vapeur du tabac vous sort-elle du nez Sans qu’un voisin ne crie au feu de cheminée ?'),
    (v_scene, v_c0, 7, '» Prévenant : « Gardez-vous, votre tête entraînée Par ce poids, de tomber en avant sur le sol ! » Tendre : « Faites-lui faire un petit parasol De peur que sa couleur au soleil ne se fane !'),
    (v_scene, v_c0, 8, '» Pédant : « L’animal seul, monsieur, qu’Aristophane Appelle Hippocampelephantocamélos Dut avoir sous le front tant de chair sur tant d’os ! » Cavalier : « Quoi, l’ami, ce croc est à la mode ?'),
    (v_scene, v_c0, 9, 'Pour pendre son chapeau, c’est vraiment très commode ! » Emphatique : « Aucun vent ne peut, nez magistral, T’enrhumer tout entier, excepté le mistral ! » Dramatique : « C’est la Mer Rouge quand il saigne !'),
    (v_scene, v_c0, 10, '» Admiratif : « Pour un parfumeur, quelle enseigne ! » Lyrique : « Est-ce une conque, êtes-vous un triton ? » Naïf : « Ce monument, quand le visite-t-on ?'),
    (v_scene, v_c0, 11, '» Respectueux : « Souffrez, monsieur, qu’on vous salue, C’est là ce qui s’appelle avoir pignon sur rue ! » Campagnard : « Hé, ardé ! C’est-y un nez ? Nanain ! C’est queuqu’navet géant ou ben queuqu’melon nain !'),
    (v_scene, v_c0, 12, '» Militaire : « Pointez contre cavalerie ! » Pratique : « Voulez-vous le mettre en loterie ? Assurément, monsieur, ce sera le gros lot !'),
    (v_scene, v_c0, 13, '» Enfin parodiant Pyrame en un sanglot : « Le voilà donc ce nez qui des traits de son maître A détruit l’harmonie ! Il en rougit, le traître !'),
    (v_scene, v_c0, 14, '» — Voilà ce qu’à peu près, mon cher, vous m’auriez dit Si vous aviez un peu de lettres et d’esprit : Mais d’esprit, ô le plus lamentable des êtres, Vous n’en eûtes jamais un atome, et de lettres Vous n’avez que les trois qui forment le mot : sot !'),
    (v_scene, v_c0, 15, 'Eussiez-vous eu, d’ailleurs, l’invention qu’il faut Pour pouvoir là, devant ces nobles galeries, Me servir toutes ces folles plaisanteries, Que vous n’en eussiez pas articulé le quart De la moitié du commencement d’une, car Je me les sers moi-même, avec assez de verve, Mais je ne permets pas qu’un autre me les serve.');
end $$;

-- le-cid/acte-i-scene-4-les-imprecations-de-don-diegue — monologue complet : s'arrêtait à « Œuvre de tant de jours en un jour effacée ! », soit 10 vers sur 24
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'le-cid' and s.slug = 'acte-i-scene-4-les-imprecations-de-don-diegue';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'DON DIÈGUE');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Ô rage ! ô désespoir ! ô vieillesse ennemie ! N’ai-je donc tant vécu que pour cette infamie ? Et ne suis-je blanchi dans les travaux guerriers Que pour voir en un jour flétrir tant de lauriers ?'),
    (v_scene, v_c0, 2, 'Mon bras, qu’avec respect toute l’Espagne admire, Mon bras, qui tant de fois a sauvé cet empire, Tant de fois affermi le trône de son roi, Trahit donc ma querelle, et ne fait rien pour moi ?'),
    (v_scene, v_c0, 3, 'Ô cruel souvenir de ma gloire passée ! Œuvre de tant de jours en un jour effacée ! Nouvelle dignité, fatale à mon bonheur ! Précipice élevé d’où tombe mon honneur !'),
    (v_scene, v_c0, 4, 'Faut-il de votre éclat voir triompher le Comte, Et mourir sans vengeance, ou vivre dans la honte ? Comte, sois de mon prince à présent gouverneur : Ce haut rang n’admet point un homme sans honneur ;'),
    (v_scene, v_c0, 5, 'Et ton jaloux orgueil, par cet affront insigne, Malgré le choix du roi, m’en a su rendre indigne.'),
    (v_scene, v_c0, 6, 'Et toi, de mes exploits glorieux instrument, Mais d’un corps tout de glace inutile ornement, Fer, jadis tant à craindre, et qui, dans cette offense, M’as servi de parade, et non pas de défense, Va, quitte désormais le dernier des humains, Passe, pour me venger, en de meilleures mains.');
end $$;

-- ruy-blas/acte-iii-scene-2 — scène complète : la version servie recousait 4 fragments de vers non contigus
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
  v_c2 uuid := gen_random_uuid();
  v_c3 uuid := gen_random_uuid();
  v_c4 uuid := gen_random_uuid();
  v_c5 uuid := gen_random_uuid();
  v_c6 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'ruy-blas' and s.slug = 'acte-iii-scene-2';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'RUY BLAS');
  insert into characters (id, scene_id, name) values (v_c1, v_scene, 'LE COMTE DE CAMPOREAL');
  insert into characters (id, scene_id, name) values (v_c2, v_scene, 'UBILLA');
  insert into characters (id, scene_id, name) values (v_c3, v_scene, 'DON MANUEL ARIAS');
  insert into characters (id, scene_id, name) values (v_c4, v_scene, 'COVADENGA');
  insert into characters (id, scene_id, name) values (v_c5, v_scene, 'L’HUISSIER');
  insert into characters (id, scene_id, name) values (v_c6, v_scene, 'LE PAGE');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Bon appétit ! messieurs ! — Bon appétit ! messieurs ! —Ô ministres intègres ! Conseillers vertueux ! voilà votre façon De servir, serviteurs qui pillez la maison !'),
    (v_scene, v_c0, 2, 'Donc vous n’avez pas honte et vous choisissez l’heure, L’heure sombre où l’Espagne agonisante pleure ! Donc vous n’avez ici pas d’autres intérêts Que d’emplir votre poche et vous enfuir après !'),
    (v_scene, v_c0, 3, 'Soyez flétris devant votre pays qui tombe, Fossoyeurs qui venez le voler dans sa tombe ! — Mais voyez, regardez, ayez quelque pudeur. L’Espagne et sa vertu, l’Espagne et sa grandeur, Tout s’en va.'),
    (v_scene, v_c0, 4, '— Nous avons, depuis Philippe-Quatre, Perdu le Portugal, le Brésil, sans combattre ; En Alsace Brisach, Steinfort en Luxembourg ; Et toute la Comté jusqu’au dernier faubourg ;'),
    (v_scene, v_c0, 5, 'Le Roussillon, Ormuz, Goa, cinq mille lieues De côte, et Fernambouc, et les Montagnes-Bleues ! Mais voyez. — Du ponant jusques à l’orient, L’Europe, qui vous hait, vous regarde en riant.'),
    (v_scene, v_c0, 6, 'Comme si votre roi n’était plus qu’un fantôme, La Hollande et l’Anglais partagent ce royaume ; Rome vous trompe ; il faut ne risquer qu’à demi Une armée en Piémont, quoique pays ami ;'),
    (v_scene, v_c0, 7, 'La Savoie et son duc sont pleins de précipices ; La France, pour vous prendre, attend des jours propices ; L’Autriche aussi vous guette. — Et l’infant bavarois Se meurt, vous le savez.'),
    (v_scene, v_c0, 8, '— Quant à vos vice-rois, Médina, fou d’amour, emplit Naples d’esclandres, Vaudémont vend Milan, Leganez perd les Flandres. Quel remède à cela ? — L’État est indigent ; L’État est épuisé de troupes et d’argent ;'),
    (v_scene, v_c0, 9, 'Nous avons sur la mer, où Dieu met ses colères, Perdu trois cents vaisseaux, sans compter les galères ! Et vous osez !… — Messieurs, en vingt ans, songez-y, Le peuple, — j’en ai fait le compte, et c’est ainsi !'),
    (v_scene, v_c0, 10, '— Portant sa charge énorme et sous laquelle il ploie, Pour vous, pour vos plaisirs, pour vos filles de joie, Le peuple misérable, et qu’on pressure encor, A sué quatre cent trente millions d’or ! Et ce n’est pas assez !'),
    (v_scene, v_c0, 11, 'et vous voulez, mes maîtres !… — Ah ! j’ai honte pour vous ! — Au dedans, routiers, reîtres, Vont battant le pays et brûlant la moisson. L’escopette est braquée au coin de tout buisson.'),
    (v_scene, v_c0, 12, 'Comme si c’était peu de la guerre des princes, Guerre entre les couvents, guerre entre les provinces, Tous voulant dévorer leur voisin éperdu, Morsures d’affamés sur un vaisseau perdu !'),
    (v_scene, v_c0, 13, 'Notre église en ruine est pleine de couleuvres ; L’herbe y croît. Quant aux grands, des aïeux, mais pas d’œuvres. Tout se fait par intrigue et rien par loyauté.'),
    (v_scene, v_c0, 14, 'L’Espagne est un égout où vient l’impureté De toute nation. — Tout seigneur à ses gages A cent coupe-jarrets qui parlent cent langages. Génois, Sardes, Flamands. Babel est dans Madrid.'),
    (v_scene, v_c0, 15, 'L’alguazil, dur au pauvre, au riche s’attendrit. La nuit, on assassine et chacun crie : à l’aide ! — Hier on m’a volé, moi, près du pont de Tolède ! — La moitié de Madrid pille l’autre moitié. Tous les juges vendus ;'),
    (v_scene, v_c0, 16, 'pas un soldat payé. Anciens vainqueurs du monde, Espagnols que nous sommes Quelle armée avons-nous ? À peine six mille hommes Qui vont pieds nus.'),
    (v_scene, v_c0, 17, 'Des gueux, des juifs, des montagnards, S’habillant d’une loque et s’armant de poignards. Aussi d’un régiment toute bande se double.'),
    (v_scene, v_c0, 18, 'Sitôt que la nuit tombe, il est une heure trouble Où le soldat douteux se transforme en larron. Matalobos a plus de troupes qu’un baron. Un voleur fait chez lui la guerre au roi d’Espagne. Hélas !'),
    (v_scene, v_c0, 19, 'les paysans qui sont dans la campagne Insultent en passant la voiture du roi ;'),
    (v_scene, v_c0, 20, 'Et lui, votre seigneur, plein de deuil et d’effroi, Seul, dans l’Escurial, avec les morts qu’il foule, Courbe son front pensif sur l’empire qui croule ! — Voilà ! — L’Europe, hélas !'),
    (v_scene, v_c0, 21, 'écrase du talon Ce pays qui fut pourpre et n’est plus que haillon ! L’État s’est ruiné dans ce siècle funeste, Et vous vous disputez à qui prendra le reste !'),
    (v_scene, v_c0, 22, 'Ce grand peuple espagnol aux membres énervés, Qui s’est couché dans l’ombre et sur qui vous vivez, Expire dans cet antre où son sort se termine, Triste comme un lion mangé par la vermine ! — Charles-Quint !'),
    (v_scene, v_c0, 23, 'dans ces temps d’opprobre et de terreur, Que fais-tu dans ta tombe, ô puissant empereur ? Oh ! lève-toi ! viens voir ! — Les bons font place aux pires.'),
    (v_scene, v_c0, 24, 'Ce royaume effrayant, fait d’un amas d’empires, Penche… Il nous faut ton bras ! au secours, Charles-Quint ! Car l’Espagne se meurt ! car l’Espagne s’éteint !'),
    (v_scene, v_c0, 25, 'Ton globe, qui brillait dans ta droite profonde, Soleil éblouissant qui faisait croire au monde Que le jour désormais se levait à Madrid, Maintenant, astre mort, dans l’ombre s’amoindrit, Lune aux trois quarts rongée et qui décroît encore, Et que d’un autre peuple effacera l’aurore !'),
    (v_scene, v_c0, 26, 'Hélas ! ton héritage est en proie aux vendeurs. Tes rayons, ils en font des piastres ! Tes splendeurs, On les souille ! — Ô géant ! se peut-il que tu dormes ? — On vend ton sceptre au poids !'),
    (v_scene, v_c0, 27, 'un tas de nains difformes Se taillent des pourpoints dans ton manteau de roi ;'),
    (v_scene, v_c0, 28, 'Et l’aigle impérial qui, jadis, sous ta loi, Couvrait le monde entier de tonnerre et de flamme, Cuit, pauvre oiseau plumé, dans leur marmite infâme !'),
    (v_scene, v_c1, 29, 'Monsieur le duc, — au nom de tous les deux, — voici Notre démission de notre emploi.'),
    (v_scene, v_c0, 30, 'Notre démission de notre emploi.Merci. Vous vous retirerez, avec votre famille, (À Priego.) Vous, en Andalousie, — (À Camporeal.) Vous, en Andalousie, —Et vous, comte, en Castille. Chacun dans vos États.'),
    (v_scene, v_c0, 31, 'Soyez partis demain. Quiconque ne veut pas marcher dans mon chemin Peut suivre ces messieurs.'),
    (v_scene, v_c2, 32, 'Peut suivre ces messieurs.Fils, nous avons un maître. Cet homme sera grand.'),
    (v_scene, v_c3, 33, 'Cet homme sera grand.Oui, s’il a le temps d’être.'),
    (v_scene, v_c4, 34, 'Et s’il ne se perd pas à tout voir de trop près.'),
    (v_scene, v_c2, 35, 'Il sera Richelieu !'),
    (v_scene, v_c3, 36, 'Il sera Richelieu !S’il n’est Olivarez !'),
    (v_scene, v_c0, 37, 'Un complot ! Qu’est ceci ? messieurs, que vous disais-je ? (Lisant.) — … « Duc d’Olmedo, veillez. Il se prépare un piège « Pour enlever quelqu’un de très-grand de Madrid. » (Examinant la lettre.) — On ne nomme pas qui.'),
    (v_scene, v_c0, 38, 'Je veillerai. — L’écrit Est anonyme. — (Entre un huissier de cour qui s’approche de Ruy Blas avec une profonde révérence.) Est anonyme. —Allons ! qu’est-ce !'),
    (v_scene, v_c5, 39, 'Est anonyme. — Allons ! qu’est-ce !À Votre Excellence J’annonce monseigneur l’ambassadeur de France.'),
    (v_scene, v_c0, 40, 'Ah ! d’Harcourt ! Je ne puis à présent.'),
    (v_scene, v_c5, 41, 'Ah ! d’Harcourt ! Je ne puis à présent.Monseigneur, Le nonce impérial dans la chambre d’honneur Attend Votre Excellence.'),
    (v_scene, v_c0, 42, 'Attend votre excellence.À cette heure ? impossible.'),
    (v_scene, v_c0, 43, 'Mon page ! je ne suis pour personne visible.'),
    (v_scene, v_c6, 44, 'Le comte Guritan, qui revient de Neubourg…'),
    (v_scene, v_c0, 45, 'Ah ! — page, enseigne-lui ma maison du faubourg. Qu’il m’y vienne trouver demain, si bon lui semble. Va. (Le page sort. Aux conseillers.) Va.Nous aurons tantôt à travailler ensemble. Dans deux heures.'),
    (v_scene, v_c0, 46, 'Messieurs, revenez. (Tous sortent en saluant profondément Ruy Blas.)');
end $$;

-- le-mariage-de-figaro/acte-v-scene-3-monologue-de-figaro-extrait — monologue complet (6 560 car. contre 647)
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'le-mariage-de-figaro' and s.slug = 'acte-v-scene-3-monologue-de-figaro-extrait';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'FIGARO');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Ô femme ! femme ! femme ! créature faible et décevante !… nul animal créé ne peut manquer à son instinct : le tien est-il donc de tromper ?… Après m’avoir obstinément refusé quand je l’en pressais devant sa maîtresse ;'),
    (v_scene, v_c0, 2, 'à l’instant qu’elle me donne sa parole ; au milieu même de la cérémonie… Il riait en lisant, le perfide ! et moi, comme un benêt… Non, monsieur le comte, vous ne l’aurez pas… vous ne l’aurez pas.'),
    (v_scene, v_c0, 3, 'Parce que vous êtes un grand seigneur, vous vous croyez un grand génie !… noblesse, fortune, un rang, des places, tout cela rend si fier ! Qu’avez-vous fait pour tant de biens ?'),
    (v_scene, v_c0, 4, 'vous vous êtes donné la peine de naître, et rien de plus : du reste, homme assez ordinaire !'),
    (v_scene, v_c0, 5, 'tandis que moi, morbleu, perdu dans la foule obscure, il m’a fallu déployer plus de science et de calculs pour subsister seulement, qu’on n’en a mis depuis cent ans à gouverner toutes les Espagnes ;'),
    (v_scene, v_c0, 6, 'et vous voulez jouter !… On vient… c’est elle… ce n’est personne. — La nuit est noire en diable, et me voilà faisant le sot métier de mari, quoique je ne le sois qu’à moitié ! (Il s’assied sur un banc.)'),
    (v_scene, v_c0, 7, 'Est-il rien de plus bizarre que ma destinée ! Fils de je ne sais pas qui ; volé par des bandits ; élevé dans leurs mœurs, je m’en dégoûte et veux courir une carrière honnête ; et partout je suis repoussé !'),
    (v_scene, v_c0, 8, 'J’apprends la chimie, la pharmacie, la chirurgie ; et tout le crédit d’un grand seigneur peut à peine me mettre à la main une lancette vétérinaire !'),
    (v_scene, v_c0, 9, '— Las d’attrister des bêtes malades, et pour faire un métier contraire, je me jette à corps perdu dans le théâtre : me fussé-je mis une pierre au cou ! Je broche une comédie dans les mœurs du sérail ;'),
    (v_scene, v_c0, 10, 'auteur espagnol, je crois pouvoir y fronder Mahomet sans scrupule : à l’instant un envoyé… de je ne sais où se plaint que j’offense dans mes vers la Sublime Porte, la Perse, une partie de la presqu’île de l’Inde, toute l’Égypte, les royaumes de Barca, de Tripoli, de Tunis, d’Alger et de Maroc ;'),
    (v_scene, v_c0, 11, 'et voilà ma comédie flambée, pour plaire aux princes mahométans, dont pas un, je crois, ne sait lire, et qui nous meurtrissent l’omoplate, en nous disant : Chiens de chrétiens !'),
    (v_scene, v_c0, 12, '— Ne pouvant avilir l’esprit, on se venge en le maltraitant. — Mes joues creusaient, mon terme était échu : je voyais de loin arriver l’affreux recors, la plume fichée dans sa perruque ; en frémissant je m’évertue.'),
    (v_scene, v_c0, 13, 'Il s’élève une question sur la nature des richesses ;'),
    (v_scene, v_c0, 14, 'et comme il n’est pas nécessaire de tenir les choses pour en raisonner, n’ayant pas un sou, j’écris sur la valeur de l’argent, et sur son produit net : aussitôt je vois, du fond d’un fiacre, baisser pour moi le pont d’un château-fort, à l’entrée duquel je laissai l’espérance et la liberté.'),
    (v_scene, v_c0, 15, '(Il se lève.) Que je voudrais bien tenir un de ces puissants de quatre jours, si légers sur le mal qu’ils ordonnent, quand une bonne disgrâce a cuvé son orgueil !'),
    (v_scene, v_c0, 16, 'Je lui dirais… que les sottises imprimées n’ont d’importance qu’aux lieux où l’on en gêne le cours ; que, sans la liberté de blâmer, il n’est point d’éloge flatteur ;'),
    (v_scene, v_c0, 17, 'et qu’il n’y a que les petits hommes qui redoutent les petits écrits. (Il se rassied.) Las de nourrir un obscur pensionnaire, on me met un jour dans la rue ;'),
    (v_scene, v_c0, 18, 'et comme il faut dîner, quoiqu’on ne soit plus en prison, je taille encore ma plume, et demande à chacun de quoi il est question : on me dit que, pendant ma retraite économique, il s’est établi dans Madrid un système de liberté sur la vente des productions, qui s’étend même à celles de la presse ;'),
    (v_scene, v_c0, 19, 'et que, pourvu que je ne parle en mes écrits ni de l’autorité, ni du culte, ni de la politique, ni de la morale, ni des gens en place, ni des corps en crédit, ni de l’Opéra, ni des autres spectacles, ni de personne qui tienne à quelque chose, je puis tout imprimer librement, sous l’inspection de deux ou trois censeurs.'),
    (v_scene, v_c0, 20, 'Pour profiter de cette douce liberté, j’annonce un écrit périodique, et, croyant n’aller sur les brisées d’aucun autre, je le nomme Journal inutile. Pou-ou !'),
    (v_scene, v_c0, 21, 'je vois s’élever contre moi mille pauvres diables à la feuille : on me supprime, et me voilà derechef sans emploi ! — Le désespoir m’allait saisir ;'),
    (v_scene, v_c0, 22, 'on pense à moi pour une place, mais par malheur j’y étais propre : il fallait un calculateur, ce fut un danseur qui l’obtint. Il ne me restait plus qu’à voler ; je me fais banquier de pharaon : alors, bonnes gens !'),
    (v_scene, v_c0, 23, 'je soupe en ville, et les personnes dites comme il faut m’ouvrent poliment leur maison, en retenant pour elles les trois quarts du profit. J’aurais bien pu me remonter ;'),
    (v_scene, v_c0, 24, 'je commençais même à comprendre que, pour gagner du bien, le savoir-faire vaut mieux que le savoir. Mais comme chacun pillait autour de moi, en exigeant que je fusse honnête, il fallut bien périr encore.'),
    (v_scene, v_c0, 25, 'Pour le coup je quittais le monde, et vingt brasses d’eau m’en allaient séparer lorsqu’un dieu bienfaisant m’appelle à mon premier état. Je reprends ma trousse et mon cuir anglais ;'),
    (v_scene, v_c0, 26, 'puis, laissant la fumée aux sots qui s’en nourrissent, et la honte au milieu du chemin, comme trop lourde à un piéton, je vais rasant de ville en ville, et je vis enfin sans souci. Un grand seigneur passe à Séville ;'),
    (v_scene, v_c0, 27, 'il me reconnaît, je le marie ; et pour prix d’avoir eu par mes soins son épouse, il veut intercepter la mienne ! Intrigue, orage à ce sujet.'),
    (v_scene, v_c0, 28, 'Prêt à tomber dans un abîme, au moment d’épouser ma mère, mes parents m’arrivent à la file. (Il se lève en s’échauffant.) On se débat : C’est vous, c’est lui, c’est moi, c’est toi ; non, ce n’est pas nous : eh !'),
    (v_scene, v_c0, 29, 'mais, qui donc ? (Il retombe assis.) Ô bizarre suite d’événements ! Comment cela m’est-il arrivé ? Pourquoi ces choses et non pas d’autres ? Qui les a fixées sur ma tête ?'),
    (v_scene, v_c0, 30, 'Forcé de parcourir la route où je suis entré sans le savoir, comme j’en sortirai sans le vouloir, je l’ai jonchée d’autant de fleurs que ma gaieté me l’a permis ;'),
    (v_scene, v_c0, 31, 'encore je dis ma gaieté, sans savoir si elle est à moi plus que le reste, ni même quel est ce moi dont je m’occupe : un assemblage informe de parties inconnues ;'),
    (v_scene, v_c0, 32, 'puis un chétif être imbécile, un petit animal folâtre, un jeune homme ardent au plaisir, ayant tous les goûts pour jouir, faisant tous les métiers pour vivre, maître ici, valet là, selon qu’il plaît à la fortune ;'),
    (v_scene, v_c0, 33, 'ambitieux par vanité, laborieux par nécessité, mais paresseux… avec délices ! orateur selon le danger, poète par délassement ; musicien par occasion, amoureux par folles bouffées, j’ai tout vu, tout fait, tout usé.'),
    (v_scene, v_c0, 34, 'Puis l’illusion s’est détruite, et, trop désabusé… Désabusé !… Suzon, Suzon, Suzon ! que tu me donnes de tourments !… J’entends marcher… on vient. Voici l’instant de la crise.'),
    (v_scene, v_c0, 35, '((Il se retire près de la première coulisse à sa droite.))');
end $$;

-- l-avare/acte-i-scene-3 — scène complète Harpagon / La Flèche
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'l-avare' and s.slug = 'acte-i-scene-3';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'HARPAGON');
  insert into characters (id, scene_id, name) values (v_c1, v_scene, 'LA FLÈCHE');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'Hors d’ici tout à l’heure, et qu’on ne réplique pas. Allons, que l’on détale de chez moi, maître juré filou, vrai gibier de potence !'),
    (v_scene, v_c1, 2, 'Je n’ai jamais rien vu de si méchant que ce maudit vieillard, et je pense, sauf correction, qu’il a le diable au corps.'),
    (v_scene, v_c0, 3, 'Tu murmures entre tes dents ?'),
    (v_scene, v_c1, 4, 'Pourquoi me chassez-vous ?'),
    (v_scene, v_c0, 5, 'C’est bien à toi, pendard, à me demander des raisons ! Sors vite, que je ne t’assomme.'),
    (v_scene, v_c1, 6, 'Qu’est-ce que je vous ai fait ?'),
    (v_scene, v_c0, 7, 'Tu m’as fait que je veux que tu sortes.'),
    (v_scene, v_c1, 8, 'Mon maître, votre fils, m’a donné ordre de l’attendre.'),
    (v_scene, v_c0, 9, 'Va-t’en l’attendre dans la rue, et ne sois point dans ma maison planté tout droit comme un piquet, à observer ce qui se passe et faire ton profit de tout.'),
    (v_scene, v_c0, 10, 'Je ne veux point avoir sans cesse devant moi un espion de mes affaires, un traître dont les yeux maudits assiègent toutes mes actions, dévorent ce que je possède, et furètent de tous côtés pour voir s’il n’y a rien à voler.'),
    (v_scene, v_c1, 11, 'Comment diantre voulez-vous qu’on fasse pour vous voler ? Êtes-vous un homme volable, quand vous renfermez toutes choses, et faites sentinelle jour et nuit ?'),
    (v_scene, v_c0, 12, 'Je veux renfermer ce que bon me semble, et faire sentinelle comme il me plaît. Ne voilà pas de mes mouchards, qui prennent garde à ce qu’on fait ? (Bas, à part.)'),
    (v_scene, v_c0, 13, 'Je tremble qu’il n’ait soupçonné quelque chose de mon argent. (Haut.) Ne serois-tu point homme à aller faire courir le bruit que j’ai chez moi de l’argent caché ?'),
    (v_scene, v_c1, 14, 'Vous avez de l’argent caché ?'),
    (v_scene, v_c0, 15, 'Non, coquin, je ne dis pas cela. (Bas.) J’enrage ! (Haut.) Je demande si, malicieusement, tu n’irois point faire courir le bruit que j’en ai.'),
    (v_scene, v_c1, 16, 'Hé ! que nous importe que vous en ayez, ou que vous n’en ayez pas, si c’est pour nous la même chose ?'),
    (v_scene, v_c0, 17, 'Tu fais le raisonneur ! Je te baillerai de ce raisonnement-ci par les oreilles. Sors d’ici, encore une fois.'),
    (v_scene, v_c1, 18, 'Eh bien ! je sors.'),
    (v_scene, v_c0, 19, 'Attends : ne m’emportes-tu rien ?'),
    (v_scene, v_c1, 20, 'Que vous emporterois-je ?'),
    (v_scene, v_c0, 21, 'Tiens, viens çà, que je voie. Montre-moi tes mains.'),
    (v_scene, v_c1, 22, 'Les voilà.'),
    (v_scene, v_c0, 23, 'Les autres.'),
    (v_scene, v_c1, 24, 'Les autres ?'),
    (v_scene, v_c1, 25, 'Les voilà.'),
    (v_scene, v_c0, 26, 'N’as-tu rien mis ici dedans ?'),
    (v_scene, v_c1, 27, 'Voyez vous-même.'),
    (v_scene, v_c0, 28, 'Ces grands hauts-de-chausses sont propres à devenir les recéleurs des choses qu’on dérobe ; et je voudrais qu’on en eût fait pendre quelqu’un.'),
    (v_scene, v_c1, 29, 'Ah ! qu’un homme comme cela mériterait bien ce qu’il craint ! Et que j’aurais de joie à le voler !'),
    (v_scene, v_c1, 30, 'Quoi ?'),
    (v_scene, v_c0, 31, 'Qu’est-ce que tu parles de voler ?'),
    (v_scene, v_c1, 32, 'Je vous dis que vous fouillez bien partout, pour voir si je vous ai volé.'),
    (v_scene, v_c0, 33, 'C’est ce que je veux faire. (Harpagon fouille dans les poches de La Flèche.)'),
    (v_scene, v_c1, 34, 'La peste soit de l’avarice et des avaricieux !'),
    (v_scene, v_c0, 35, 'Comment ? que dis-tu ?'),
    (v_scene, v_c1, 36, 'Ce que je dis ?'),
    (v_scene, v_c0, 37, 'Oui ; qu’est-ce que tu dis d’avarice et d’avaricieux ?'),
    (v_scene, v_c1, 38, 'Je dis que la peste soit de l’avarice et des avaricieux.'),
    (v_scene, v_c0, 39, 'De qui veux-tu parler ?'),
    (v_scene, v_c1, 40, 'Des avaricieux.'),
    (v_scene, v_c0, 41, 'Et qui sont-ils, ces avaricieux ?'),
    (v_scene, v_c1, 42, 'Des vilains et des ladres.'),
    (v_scene, v_c0, 43, 'Mais qui est-ce que tu entends par là ?'),
    (v_scene, v_c1, 44, 'De quoi vous mettez-vous en peine ?'),
    (v_scene, v_c0, 45, 'Je me mets en peine de ce qu’il faut.'),
    (v_scene, v_c1, 46, 'Est-ce que vous croyez que je veux parler de vous ?'),
    (v_scene, v_c0, 47, 'Je crois ce que je crois ; mais je veux que tu me dises à qui tu parles quand tu dis cela.'),
    (v_scene, v_c1, 48, 'Je parle… je parle à mon bonnet.'),
    (v_scene, v_c0, 49, 'Et moi, je pourrois bien parler à ta barrette.'),
    (v_scene, v_c1, 50, 'M’empêcherez-vous de maudire les avaricieux ?'),
    (v_scene, v_c0, 51, 'Non ; mais je t’empêcherai de jaser et d’être insolent. Tais-toi.'),
    (v_scene, v_c1, 52, 'Je ne nomme personne.'),
    (v_scene, v_c0, 53, 'Je te rosserai si tu parles.'),
    (v_scene, v_c1, 54, 'Qui se sent morveux, qu’il se mouche.'),
    (v_scene, v_c0, 55, 'Te tairas-tu ?'),
    (v_scene, v_c1, 56, 'Oui, malgré moi.'),
    (v_scene, v_c0, 57, 'Ah ! ah !'),
    (v_scene, v_c1, 58, 'Tenez, voilà encore une poche : êtes-vous satisfait ?'),
    (v_scene, v_c0, 59, 'Allons, rends-le-moi sans te fouiller.'),
    (v_scene, v_c1, 60, 'Quoi ?'),
    (v_scene, v_c0, 61, 'Ce que tu m’as pris.'),
    (v_scene, v_c1, 62, 'Je ne vous ai rien pris du tout.'),
    (v_scene, v_c0, 63, 'Assurément ?'),
    (v_scene, v_c1, 64, 'Assurément.'),
    (v_scene, v_c0, 65, 'Adieu. Va-t-en à tous les diables !'),
    (v_scene, v_c0, 66, 'Je te mets sur ta conscience, au moins.');
end $$;

-- on-ne-badine-pas-avec-l-amour/acte-iii-scene-8-tirade-de-perdican — scène complète, jusqu'à « Elle est morte. Adieu, Perdican ! »
do $$
declare
  v_scene uuid;
  v_c0 uuid := gen_random_uuid();
  v_c1 uuid := gen_random_uuid();
begin
  select s.id into strict v_scene
  from scenes s join works w on w.id = s.work_id
  where w.slug = 'on-ne-badine-pas-avec-l-amour' and s.slug = 'acte-iii-scene-8-tirade-de-perdican';

  delete from lines where scene_id = v_scene;
  delete from characters where scene_id = v_scene;

  insert into characters (id, scene_id, name) values (v_c0, v_scene, 'CAMILLE');
  insert into characters (id, scene_id, name) values (v_c1, v_scene, 'PERDICAN');

  insert into lines (scene_id, character_id, "order", text) values
    (v_scene, v_c0, 1, 'M’avez-vous abandonnée, ô mon Dieu ? Vous le savez, lorsque je suis venue, j’avais juré de vous être fidèle ;'),
    (v_scene, v_c0, 2, 'quand j’ai refusé de devenir l’épouse d’un autre que vous, j’ai cru parler sincèrement devant vous et ma conscience, vous le savez, mon père ; ne voulez-vous donc plus de moi ? Oh !'),
    (v_scene, v_c0, 3, 'pourquoi faites-vous mentir la vérité elle-même ? Pourquoi suis-je si faible ? Ah ! malheureuse, je ne puis plus prier ! ((Entre Perdican.))'),
    (v_scene, v_c1, 4, 'Orgueil, le plus fatal des conseillers humains, qu’es-tu venu faire entre cette fille et moi ? La voilà pâle et effrayée, qui presse sur les dalles insensibles son cœur et son visage.'),
    (v_scene, v_c1, 5, 'Elle aurait pu m’aimer, et nous étions nés l’un pour l’autre ; qu’es-tu venu faire sur nos lèvres, orgueil, lorsque nos mains allaient se joindre ?'),
    (v_scene, v_c0, 6, 'Qui m’a suivie ? Qui parle sous cette voûte ? Est-ce toi, Perdican ?'),
    (v_scene, v_c1, 7, 'Insensés que nous sommes ! nous nous aimons. Quel songe avons-nous fait, Camille ? Quelles vaines paroles, quelles misérables folies ont passé comme un vent funeste entre nous deux ?'),
    (v_scene, v_c1, 8, 'Lequel de nous a voulu tromper l’autre ? Hélas ! cette vie est elle-même un si pénible rêve ! pourquoi encore y mêler les nôtres ? Ô mon Dieu ! le bonheur est une perle si rare dans cet océan d’ici-bas !'),
    (v_scene, v_c1, 9, 'Tu nous l’avais donné, pêcheur céleste, tu l’avais tiré pour nous des profondeurs de l’abîme, cet inestimable joyau ; et nous, comme des enfants gâtés que nous sommes, nous en avons fait un jouet.'),
    (v_scene, v_c1, 10, 'Le vert sentier qui nous amenait l’un vers l’autre avait une pente si douce, il était entouré de buissons si fleuris, il se perdait dans un si tranquille horizon !'),
    (v_scene, v_c1, 11, 'Il a bien fallu que la vanité, le bavardage et la colère vinssent jeter leurs rochers informes sur cette route céleste, qui nous aurait conduits à toi dans un baiser !'),
    (v_scene, v_c1, 12, 'Il a bien fallu que nous nous fissions du mal, car nous sommes des hommes. Ô insensés ! nous nous aimons. ((Il la prend dans ses bras.))'),
    (v_scene, v_c0, 13, 'Oui, nous nous aimons, Perdican ; laisse-moi le sentir sur ton cœur. Ce Dieu qui nous regarde ne s’en offensera pas ; il veut bien que je t’aime ; il y a quinze ans qu’il le sait.'),
    (v_scene, v_c1, 14, 'Chère créature, tu es à moi ! ((Il l’embrasse ; on entend un grand cri derrière l’autel.))'),
    (v_scene, v_c0, 15, 'C’est la voix de ma sœur de lait.'),
    (v_scene, v_c1, 16, 'Comment est-elle ici ? je l’avais laissée dans l’escalier, lorsque tu m’as fait rappeler. Il faut donc qu’elle m’ait suivi sans que je m’en sois aperçu.'),
    (v_scene, v_c0, 17, 'Entrons dans cette galerie ; c’est là qu’on a crié.'),
    (v_scene, v_c1, 18, 'Je ne sais ce que j’éprouve ; il me semble que mes mains sont couvertes de sang.'),
    (v_scene, v_c0, 19, 'La pauvre enfant nous a sans doute épiés ; elle s’est encore évanouie ; viens, portons-lui secours ; hélas ! tout cela est cruel.'),
    (v_scene, v_c1, 20, 'Non, en vérité, je n’entrerai pas ; je sens un froid mortel qui me paralyse. Vas-y, Camille, et tâche de la ramener. (Camille sort.) Je vous en supplie, mon Dieu ! ne faites pas de moi un meurtrier !'),
    (v_scene, v_c1, 21, 'Vous voyez ce qui se passe ; nous sommes deux enfants insensés, et nous avons joué avec la vie et la mort ; mais notre cœur est pur ; ne tuez pas Rosette, Dieu juste !'),
    (v_scene, v_c1, 22, 'Je lui trouverai un mari, je réparerai ma faute, elle est jeune, elle sera heureuse ; ne faites pas cela, ô Dieu ! vous pouvez bénir encore quatre de vos enfants. Eh bien ! Camille, qu’y a-t-il ? ((Camille rentre.))'),
    (v_scene, v_c0, 23, 'Elle est morte. Adieu, Perdican !');
end $$;

-- Le Mariage de Figaro : fusion des deux entrées de l'acte V scène 3.
-- « -extrait » n'a plus lieu d'être dans le slug puisque le monologue est complet ;
-- les deux anciens slugs partent en previous_slugs et redirigent donc en 308.
do $$
declare
  v_keep uuid;
  v_drop uuid;
begin
  select s.id into strict v_keep from scenes s join works w on w.id = s.work_id
   where w.slug = 'le-mariage-de-figaro' and s.slug = 'acte-v-scene-3-monologue-de-figaro-extrait';
  select s.id into v_drop from scenes s join works w on w.id = s.work_id
   where w.slug = 'le-mariage-de-figaro' and s.slug = 'acte-v-scene-3';

  if v_drop is not null then
    delete from scenes where id = v_drop;
  end if;

  update scenes
     set slug = 'acte-v-scene-3-monologue-de-figaro',
         previous_slugs = array['acte-v-scene-3-monologue-de-figaro-extrait', 'acte-v-scene-3']::text[]
   where id = v_keep;
end $$;

-- Le Cid : numéros de vers de l'édition Marty-Laveaux collés au texte, sur toute l'œuvre.
update lines l
   set text = btrim(regexp_replace(l.text, '([0-9]{1,4})(?=[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ«])', '', 'g'))
  from scenes s join works w on w.id = s.work_id
 where l.scene_id = s.id and w.slug = 'le-cid'
   and l.text ~ '[0-9]{1,4}[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ«]';


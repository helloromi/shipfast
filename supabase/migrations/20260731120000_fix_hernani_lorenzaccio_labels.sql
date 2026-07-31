-- Deux scènes servies sous un acte et un numéro faux.
--
-- Même famille que andromaque/acte-iv-scene-5, corrigée le 30/07 : le texte est bon,
-- c'est l'étiquette qui ment. Aucune session d'apprentissage, aucun feedback, aucune
-- scène de classe ne pointe sur ces trois lignes (relevé le 31/07/2026).
--
-- HERNANI — « acte-iv-scene-1 » est en réalité l'acte III, scène 4.
-- Collationné contre l'édition Hetzel 1889 : la scène de l'écrin nuptial
-- (« Je vous fais compliment ! Plus que je ne puis dire ») est l'acte III scène IV.
-- L'acte IV de Hugo se passe à Aix-la-Chapelle, devant le tombeau de Charlemagne,
-- et n'a ni Hernani ni Doña Sol en scène. Le texte en base est conservé : il est plus
-- complet que ce que rend Wikisource (51 répliques contre 44) et surtout mieux
-- attribué — la version Wikisource perd Doña Sol et met tout au compte d'Hernani.
--
-- LORENZACCIO — « acte-i-scene-1-une-rue » est l'acte III, scène 3.
-- Ce n'était pas une concaténation de plusieurs scènes, comme on l'avait d'abord cru :
-- c'est bien une seule scène de Musset, l'une des plus longues du répertoire, qui part
-- de l'arrestation de Thomas Strozzi par l'officier et va jusqu'au dialogue
-- Lorenzo/Philippe. Le « (Une rue) » du titre était juste, l'acte et le numéro faux.
--
-- Conséquence : l'œuvre portait DEUX fois cette scène — complète sous le faux titre
-- (166 répliques), et en fragment de 7 répliques sous le bon titre. On supprime le
-- fragment et on rend son slug à la scène complète, qui le mérite. L'URL
-- /lorenzaccio/acte-iii-scene-3 continue donc de répondre 200, avec un contenu
-- vingt fois plus fourni.

-- Hernani : acte IV → acte III, scène 4. L'ancien slug part en previous_slugs et
-- redirigera en 308 (résolution par fetchSceneByPreviousSlug).
update scenes
   set title = 'Acte III, scène 4',
       chapter = 'Acte III',
       slug = 'acte-iii-scene-4',
       previous_slugs = array['acte-iv-scene-1']::text[]
 where id = '8e451dfe-9b89-4a5c-90d7-ef2f33e8c40d';

-- Lorenzaccio : suppression du fragment, ce qui libère le slug acte-iii-scene-3.
delete from scenes where id = 'a8f0a78f-d452-46e6-a79c-89d9df272a65';

-- Lorenzaccio : la scène complète reprend le titre, l'acte et le slug corrects.
update scenes
   set title = 'Acte III, scène 3 (Une rue)',
       chapter = 'Acte III',
       slug = 'acte-iii-scene-3',
       previous_slugs = array['acte-i-scene-1-une-rue']::text[]
 where id = '90da6645-3e41-49f9-a43c-3853a9b856d5';

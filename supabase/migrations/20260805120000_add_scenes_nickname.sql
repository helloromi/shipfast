-- Nom d'usage d'une scène célèbre (« la tirade du nez », « le récit de Rodrigue »).
--
-- Pourquoi. Les titres du catalogue sont des coordonnées : « Acte IV, Scène III ». Elles
-- sont exactes et personne ne les tape. Search Console sur 3 mois au 03/08/2026 montre
-- que les gens cherchent le NOM de la tirade ou le vers :
--   tirade de perdican ............................ position 6,7
--   c'est un roc c'est un pic c'est un cap ........ position 10
--   monologue figaro .............................. position 11
--   nous partimes 500 ............................. position 50
--   monologue hermione acte 5 scène 1 ............. position 55,7
--
-- Deux effets mesurés du titre-coordonnée :
--
-- 1. CTR. Les pages scènes font 0,8 % de clics à la position 10, contre 11 % pour les
--    guides /ressources. Elles sont vues et pas cliquées : le snippet ne dit pas au
--    lecteur qu'il a trouvé ce qu'il cherchait.
-- 2. Appariement. Sur « monologue hermione acte 5 scène 1 », Google a servi
--    andromaque/acte-v-scene-iv (position 55) alors que acte-v-scene-premiere contient
--    bien le monologue : rien dans le titre ne lui disait laquelle des deux.
--
-- Preuve par l'exemple, déjà dans les données : la seule scène dont le slug porte un nom
-- de tirade, on-ne-badine.../acte-iii-scene-8-tirade-de-perdican, fait 15 impressions à
-- la position 7,9 — le 4e volume du site.
--
-- La colonne est volontairement NULLable et éparse : elle ne concerne que les scènes qui
-- ont réellement un nom d'usage établi. Inventer un surnom pour les 340 autres produirait
-- exactement le bruit qu'on cherche à supprimer.
--
-- Les URLs ne bougent PAS. Le slug reste la coordonnée (acte-iv-scene-iii) : re-sluguer
-- 20 pages qui viennent d'être indexées coûterait plus que ça ne rapporte, et le
-- mécanisme previous_slugs existe pour les cas où on le voudrait vraiment.

alter table public.scenes
  add column if not exists nickname text;

comment on column public.scenes.nickname is
  'Nom d''usage d''une scène célèbre (« la tirade du nez »). NULL pour la grande majorité des scènes. Alimente le <title>, le H1 et alternateName du JSON-LD. Source : supabase/seed/scene-nicknames.json.';

-- Un nom d'usage vide n'a pas de sens : soit la scène en a un, soit la colonne est NULL.
-- Sans cette contrainte, une chaîne vide passerait tous les tests de présence côté app.
alter table public.scenes
  drop constraint if exists scenes_nickname_not_blank;

alter table public.scenes
  add constraint scenes_nickname_not_blank
  check (nickname is null or length(btrim(nickname)) > 0);

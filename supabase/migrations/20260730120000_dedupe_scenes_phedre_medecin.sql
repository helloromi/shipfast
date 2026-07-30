-- Déduplication du catalogue public — 30/07/2026
--
-- Trace de l'exécution de `supabase/seed/dedupe-scenes.ts -- --apply`. Le script a
-- déjà supprimé ces lignes en base via le client service-role ; cette migration
-- existe pour laisser l'opération dans l'historique et la rendre rejouable sur un
-- environnement reconstruit depuis les migrations. Les `delete` sont idempotents.
--
-- Contexte : deux générations de seed se chevauchaient, l'une titrant les scènes en
-- chiffres arabes (« Acte I, scène 3 »), l'autre en chiffres romains (« Acte I,
-- Scène III »). Le même texte se retrouvait donc publié sous deux slugs, donc sous
-- deux URLs indexables — l'audit SEO du 30/07/2026 (audit-seo-2026-07-30.md,
-- section G) l'a mesuré sur Phèdre et Le Médecin malgré lui.
--
-- Vérifié avant suppression (dry-run du script) : aucune des 5 scènes ne portait de
-- session d'apprentissage, de feedback de ligne ni de copie perso — tout à 0. Les
-- lignes et personnages partent en CASCADE, le script les a aussi supprimés
-- explicitement (0 résiduel constaté après coup).
--
-- Côté routes :
--   * les URLs slug retirées sont redirigées en 308 vers la scène conservée
--     (src/lib/seo/legacy-scene-redirects.ts) ;
--   * les URLs UUID répondent 410 (src/lib/seo/gone-scenes.ts + src/proxy.ts).

-- ── 1. Phèdre, acte I scène 3 ────────────────────────────────────────────────
-- Retirée : « Acte I, scène 3 » (slug acte-i-scene-3, 63 répliques).
-- Conservée : « Acte I, Scène III » (slug acte-i-scene-iii, 65 répliques),
-- au découpage de répliques plus fin et à l'orthographe moderne.
delete from lines where scene_id = '160f68d5-2560-4549-8627-172caf172bcc';
delete from characters where scene_id = '160f68d5-2560-4549-8627-172caf172bcc';
delete from scenes where id = '160f68d5-2560-4549-8627-172caf172bcc';

-- ── 2. Le Médecin malgré lui, acte I scène 1 ─────────────────────────────────
-- Retirée : « Acte I, scène 1 » (slug acte-i-scene-1) — un extrait de 12 répliques.
-- Conservée : « Acte I, Scène I » (slug acte-i-scene-i) — la scène entière, 51 répliques.
delete from lines where scene_id = '93441a8d-ce64-40f1-9f16-3690f0e4fd30';
delete from characters where scene_id = '93441a8d-ce64-40f1-9f16-3690f0e4fd30';
delete from scenes where id = '93441a8d-ce64-40f1-9f16-3690f0e4fd30';

-- ── 3. Trois scènes orphelines (work_id nul) ─────────────────────────────────
-- Même texte que Le Médecin malgré lui acte I scène 1, mais sans œuvre rattachée,
-- donc sans slug : leur seule URL était l'UUID, servie en 200 avec un canonical
-- auto-référent. Elles échappaient au sitemap comme à la liste des pierres tombales
-- (dont la requête de génération filtre sur works.is_public_domain = false, ce qui
-- exclut un work_id nul).
delete from lines where scene_id in (
  'db9f670e-59b7-4895-b20e-0906ea648a6c',
  '964f24d6-03d7-46ba-94ee-8f40fa9fc63f',
  'b9d01f8e-6999-4e9a-b3d4-3e4b31f48e3e'
);
delete from characters where scene_id in (
  'db9f670e-59b7-4895-b20e-0906ea648a6c',
  '964f24d6-03d7-46ba-94ee-8f40fa9fc63f',
  'b9d01f8e-6999-4e9a-b3d4-3e4b31f48e3e'
);
delete from scenes where id in (
  'db9f670e-59b7-4895-b20e-0906ea648a6c',
  '964f24d6-03d7-46ba-94ee-8f40fa9fc63f',
  'b9d01f8e-6999-4e9a-b3d4-3e4b31f48e3e'
);

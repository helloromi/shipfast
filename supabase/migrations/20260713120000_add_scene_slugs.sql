-- Migration : URLs slug pour les pages scènes (/scenes/[auteur]/[piece]/[scene])
--
-- Ajoute une colonne slug (nullable, unique) sur works et scenes. Le remplissage
-- se fait ensuite via supabase/seed/backfill-scene-slugs.ts (dry-run puis --apply),
-- pas par cette migration : aucune donnée existante n'est modifiée ici.
--
-- Portée : seules les scènes publiques rattachées à une œuvre du domaine public
-- reçoivent un slug (cf. filtre déjà utilisé par sitemap.xml). Les copies privées,
-- imports perso et scènes payantes gardent slug = null et continuent de vivre
-- sur /scenes/[id] (UUID), sans changement de comportement.

alter table public.works
  add column if not exists slug text unique;

alter table public.scenes
  add column if not exists slug text unique;

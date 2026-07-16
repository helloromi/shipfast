-- Migration : slug de scène unique PAR ŒUVRE (au lieu de globalement)
--
-- La route /scenes/[auteur]/[piece]/[scene] résout la scène par (œuvre, slug) :
-- le slug de scène n'a donc besoin d'être unique que dans son œuvre. On lève
-- l'unicité GLOBALE (scenes_slug_key) — qui forçait des suffixes -2/-3 arbitraires
-- sur 56% des scènes — et on la remplace par une unicité composite (work_id, slug).
--
-- La colonne previous_slugs conserve les anciens slugs après re-sluguage, pour
-- servir des redirections 301 depuis les URLs déjà indexées (cf. la route et
-- supabase/seed/reslug-scenes.ts).
--
-- Le re-sluguage des données existantes se fait par le script TS reslug-scenes.ts,
-- PAS par cette migration : il doit produire exactement le même slug que le code
-- applicatif via la fonction slugify() partagée (gestion des accents non
-- reproductible fidèlement en SQL, et le slug DB doit matcher le canonical calculé
-- côté route au caractère près).

-- Historique des slugs, pour les redirections 301.
alter table public.scenes
  add column if not exists previous_slugs text[] not null default '{}';

-- Unicité du slug de scène : globale → par œuvre.
-- On retrouve la contrainte quel que soit son nom auto-généré (UNIQUE (slug)),
-- pour rester robuste si la baseline diffère.
do $$
declare
  conname_to_drop text;
begin
  select conname
    into conname_to_drop
  from pg_constraint
  where conrelid = 'public.scenes'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) = 'UNIQUE (slug)';

  if conname_to_drop is not null then
    execute format('alter table public.scenes drop constraint %I', conname_to_drop);
  end if;
end $$;

-- Un slug de scène est unique dans son œuvre. Index partiel : les scènes sans
-- slug (privées, imports perso, catalogue payant) ne sont pas contraintes.
create unique index if not exists scenes_work_slug_unique_idx
  on public.scenes (work_id, slug)
  where slug is not null;

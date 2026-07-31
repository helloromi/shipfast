-- `lastmod` du sitemap : suivre les modifications réelles, pas la date de seed.
--
-- `scenes` n'avait pas de colonne updated_at, donc le sitemap servait created_at en
-- lastmod. Conséquence mesurée le 31/07/2026 : après la plus grosse modification de
-- contenu du site — 198 fiches éditoriales, huit œuvres re-sourcées, deux scènes
-- retitrées — le sitemap déclarait toujours ces pages comme modifiées à leur date de
-- seed. lastmod est le signal qui décide Google à repasser ; sur un domaine déjà
-- rationné en crawl, lui dire « rien n'a bougé » juste après tout avoir changé est le
-- pire moment.
--
-- Le contenu d'une page scène, ce n'est pas seulement la ligne `scenes` : c'est aussi
-- ses répliques. Un re-sourcing de texte ne touche que `lines`. D'où deux mécanismes :
-- un trigger classique sur `scenes`, et des triggers par instruction sur `lines` qui
-- répercutent le changement sur la scène parente. Les triggers `lines` utilisent des
-- tables de transition (REFERENCING … TABLE) : un seed de 5 000 répliques produit une
-- seule instruction UPDATE sur `scenes`, pas 5 000.

alter table public.scenes
  add column if not exists updated_at timestamptz not null default now();

-- Initialisation : toutes les scènes viennent effectivement d'être modifiées (fiches
-- éditoriales du 31/07), donc `now()` est la valeur juste, pas une approximation.

create or replace function public.set_scenes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists scenes_set_updated_at on public.scenes;
create trigger scenes_set_updated_at
  before update on public.scenes
  for each row
  execute function public.set_scenes_updated_at();

-- Répercussion depuis `lines`. Pas de récursion possible : le trigger sur `scenes`
-- est BEFORE UPDATE et n'écrit que dans NEW, il ne retouche jamais `lines`.
create or replace function public.touch_scenes_from_new_lines()
returns trigger
language plpgsql
as $$
begin
  update public.scenes s
     set updated_at = now()
   where s.id in (select distinct scene_id from new_lines where scene_id is not null);
  return null;
end;
$$;

create or replace function public.touch_scenes_from_old_lines()
returns trigger
language plpgsql
as $$
begin
  update public.scenes s
     set updated_at = now()
   where s.id in (select distinct scene_id from old_lines where scene_id is not null);
  return null;
end;
$$;

drop trigger if exists lines_touch_scene_insert on public.lines;
create trigger lines_touch_scene_insert
  after insert on public.lines
  referencing new table as new_lines
  for each statement
  execute function public.touch_scenes_from_new_lines();

drop trigger if exists lines_touch_scene_update on public.lines;
create trigger lines_touch_scene_update
  after update on public.lines
  referencing new table as new_lines
  for each statement
  execute function public.touch_scenes_from_new_lines();

-- Sur DELETE, la scène parente peut avoir disparu elle-même (suppression en cascade) :
-- le UPDATE ne trouve alors aucune ligne, ce qui est le comportement voulu.
drop trigger if exists lines_touch_scene_delete on public.lines;
create trigger lines_touch_scene_delete
  after delete on public.lines
  referencing old table as old_lines
  for each statement
  execute function public.touch_scenes_from_old_lines();

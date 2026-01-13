-- Migration: Lier une copie privée à sa scène source (pour fork idempotent)

alter table public.scenes
  add column if not exists source_scene_id uuid references public.scenes(id) on delete set null;

-- Garantir une seule copie privée par (owner_user_id, source_scene_id)
-- Note: index partiel => ne s'applique qu'aux scènes privées qui référencent une source.
create unique index if not exists scenes_owner_source_unique_idx
  on public.scenes (owner_user_id, source_scene_id)
  where is_private = true and source_scene_id is not null;


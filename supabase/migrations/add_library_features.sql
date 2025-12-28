-- Migration : Ajouter les fonctionnalités de bibliothèque MVP
-- - Table user_work_access pour gérer les accès
-- - Support des scènes privées
-- - Colonnes supplémentaires sur works et scenes

-- 1. Créer l'enum pour access_type
do $$
begin
  if not exists (select 1 from pg_type where typname = 'access_type') then
    create type access_type as enum ('free_slot', 'purchased', 'private');
  end if;
end $$;

-- 2. Ajouter colonnes à works
alter table public.works
  add column if not exists is_public_domain boolean not null default true,
  add column if not exists total_lines_count int;

-- 3. Ajouter colonnes à scenes pour les scènes privées
alter table public.scenes
  add column if not exists owner_user_id uuid references auth.users(id) on delete cascade,
  add column if not exists is_private boolean not null default false;

-- 4. Créer index sur les nouvelles colonnes
create index if not exists scenes_owner_user_id_idx on public.scenes(owner_user_id);
create index if not exists scenes_is_private_idx on public.scenes(is_private);

-- 5. Créer la table user_work_access
create table if not exists public.user_work_access (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  work_id uuid references public.works(id) on delete cascade,
  scene_id uuid references public.scenes(id) on delete cascade,
  access_type access_type not null,
  purchase_id text,
  created_at timestamptz not null default now(),
  constraint user_work_access_work_or_scene check (
    (work_id is not null and scene_id is null) or 
    (work_id is null and scene_id is not null)
  )
);

-- 6. Créer index sur user_work_access
create index if not exists user_work_access_user_idx on public.user_work_access(user_id);
create index if not exists user_work_access_work_idx on public.user_work_access(work_id);
create index if not exists user_work_access_scene_idx on public.user_work_access(scene_id);
create index if not exists user_work_access_type_idx on public.user_work_access(access_type);

-- 7. Activer RLS sur user_work_access
alter table public.user_work_access enable row level security;

-- 8. Politiques RLS pour user_work_access
do $$
begin
  -- Les utilisateurs voient leurs propres accès
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_work_access' 
    and policyname = 'Users see their access'
  ) then
    create policy "Users see their access" on public.user_work_access
      for select using (auth.uid() = user_id);
  end if;

  -- Les utilisateurs peuvent insérer leurs propres accès (pour free_slot)
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_work_access' 
    and policyname = 'Users insert their access'
  ) then
    create policy "Users insert their access" on public.user_work_access
      for insert with check (auth.uid() = user_id);
  end if;

  -- Service role peut tout faire (pour webhook Stripe, admin, etc.)
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_work_access' 
    and policyname = 'Service role full access'
  ) then
    create policy "Service role full access" on public.user_work_access
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- 9. Mettre à jour la politique RLS pour scenes : les scènes privées ne sont visibles que par leur propriétaire
do $$
begin
  -- Supprimer l'ancienne politique publique si elle existe
  drop policy if exists "Public read scenes" on public.scenes;
  
  -- Nouvelle politique : scènes publiques visibles par tous, scènes privées uniquement par leur propriétaire
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'scenes' 
    and policyname = 'Read scenes public or owned'
  ) then
    create policy "Read scenes public or owned" on public.scenes
      for select using (
        (is_private = false) or 
        (is_private = true and owner_user_id = auth.uid())
      );
  end if;
end $$;

-- 10. Mettre à jour la politique pour characters : seulement si la scène est accessible
do $$
begin
  drop policy if exists "Public read characters" on public.characters;
  
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'characters' 
    and policyname = 'Read characters from accessible scenes'
  ) then
    create policy "Read characters from accessible scenes" on public.characters
      for select using (
        exists (
          select 1 from public.scenes s
          where s.id = characters.scene_id
          and (
            s.is_private = false or 
            (s.is_private = true and s.owner_user_id = auth.uid())
          )
        )
      );
  end if;
end $$;

-- 11. Mettre à jour la politique pour lines : seulement si la scène est accessible
do $$
begin
  drop policy if exists "Public read lines" on public.lines;
  
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'lines' 
    and policyname = 'Read lines from accessible scenes'
  ) then
    create policy "Read lines from accessible scenes" on public.lines
      for select using (
        exists (
          select 1 from public.scenes s
          where s.id = lines.scene_id
          and (
            s.is_private = false or 
            (s.is_private = true and s.owner_user_id = auth.uid())
          )
        )
      );
  end if;
end $$;


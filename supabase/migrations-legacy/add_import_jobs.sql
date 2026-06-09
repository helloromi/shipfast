-- Migration : Ajouter la table import_jobs pour suivre les imports en arrière-plan

-- 1. Créer l'enum pour le statut des imports
do $$
begin
  if not exists (select 1 from pg_type where typname = 'import_job_status') then
    create type import_job_status as enum ('pending', 'processing', 'preview_ready', 'completed', 'error');
  end if;
end $$;

-- 2. Créer la table import_jobs
create table if not exists public.import_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status import_job_status not null default 'pending',
  file_paths jsonb not null,
  draft_data jsonb,
  scene_id uuid references public.scenes(id) on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Créer les index
create index if not exists import_jobs_user_idx on public.import_jobs(user_id);
create index if not exists import_jobs_status_idx on public.import_jobs(status);
create index if not exists import_jobs_created_at_idx on public.import_jobs(created_at);
create index if not exists import_jobs_scene_id_idx on public.import_jobs(scene_id);

-- 4. Créer une fonction pour mettre à jour updated_at automatiquement
create or replace function update_import_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. Créer le trigger pour updated_at
drop trigger if exists update_import_jobs_updated_at on public.import_jobs;
create trigger update_import_jobs_updated_at
  before update on public.import_jobs
  for each row
  execute function update_import_jobs_updated_at();

-- 6. Activer RLS sur import_jobs
alter table public.import_jobs enable row level security;

-- 7. Politiques RLS pour import_jobs
do $$
begin
  -- Les utilisateurs voient leurs propres jobs
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'import_jobs' 
    and policyname = 'Users see their import jobs'
  ) then
    create policy "Users see their import jobs" on public.import_jobs
      for select using (auth.uid() = user_id);
  end if;

  -- Les utilisateurs peuvent insérer leurs propres jobs
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'import_jobs' 
    and policyname = 'Users insert their import jobs'
  ) then
    create policy "Users insert their import jobs" on public.import_jobs
      for insert with check (auth.uid() = user_id);
  end if;

  -- Les utilisateurs peuvent mettre à jour leurs propres jobs
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'import_jobs' 
    and policyname = 'Users update their import jobs'
  ) then
    create policy "Users update their import jobs" on public.import_jobs
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- Service role peut tout faire (pour traitement en arrière-plan)
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'import_jobs' 
    and policyname = 'Service role full access'
  ) then
    create policy "Service role full access" on public.import_jobs
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;


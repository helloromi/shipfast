-- Migration : Ajouter la table works et migrer les données existantes

-- 1. Créer la table works (si elle n'existe pas déjà)
create table if not exists public.works (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text,
  summary text,
  created_at timestamptz default now()
);

-- 2. Ajouter work_id à scenes (si la colonne n'existe pas déjà)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'scenes' 
    and column_name = 'work_id'
  ) then
    alter table public.scenes 
      add column work_id uuid references public.works(id) on delete set null;
  end if;
end $$;

-- 3. Créer un index sur work_id
create index if not exists scenes_work_id_idx on public.scenes (work_id);

-- 4. Migrer les scènes existantes vers des œuvres
-- Grouper par auteur et créer une œuvre par auteur unique
-- Pour les scènes sans auteur, créer une œuvre "Sans titre"
do $$
declare
  scene_record record;
  work_record record;
  work_id_val uuid;
begin
  -- Traiter les scènes avec auteur
  for scene_record in 
    select distinct author 
    from public.scenes 
    where author is not null 
    and (work_id is null or work_id not in (select id from public.works))
  loop
    -- Créer une œuvre pour cet auteur (utiliser le titre de la première scène comme titre d'œuvre)
    insert into public.works (title, author, summary)
    select 
      coalesce(
        (select title from public.scenes where author = scene_record.author limit 1),
        'Œuvre de ' || scene_record.author
      ),
      scene_record.author,
      null
    where not exists (
      select 1 from public.works where author = scene_record.author
    )
    returning id into work_id_val;
    
    -- Si l'œuvre existe déjà, récupérer son ID
    if work_id_val is null then
      select id into work_id_val from public.works where author = scene_record.author limit 1;
    end if;
    
    -- Assigner toutes les scènes de cet auteur à cette œuvre
    update public.scenes
    set work_id = work_id_val
    where author = scene_record.author
    and work_id is null;
  end loop;
  
  -- Traiter les scènes sans auteur
  if exists (select 1 from public.scenes where author is null and work_id is null) then
    -- Créer une œuvre "Sans titre" si elle n'existe pas
    insert into public.works (title, author, summary)
    values ('Sans titre', null, 'Scènes sans œuvre assignée')
    on conflict do nothing
    returning id into work_id_val;
    
    if work_id_val is null then
      select id into work_id_val from public.works where title = 'Sans titre' and author is null limit 1;
    end if;
    
    -- Assigner toutes les scènes sans auteur à cette œuvre
    update public.scenes
    set work_id = work_id_val
    where author is null
    and work_id is null;
  end if;
end $$;

-- 5. Activer RLS sur works
alter table public.works enable row level security;

-- 6. Créer les politiques RLS (si elles n'existent pas déjà)
do $$
begin
  -- Politique de lecture publique
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'works' 
    and policyname = 'Public read works'
  ) then
    create policy "Public read works" on public.works for select using (true);
  end if;

  -- Politique d'écriture service role
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'works' 
    and policyname = 'Service role write works'
  ) then
    create policy "Service role write works" on public.works
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

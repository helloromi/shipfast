-- ---------------------------------------------------------------------------
-- Référence du schéma — DOCUMENTATION, pas un fichier à exécuter.
--
-- Ce fichier n'est pas rejouable seul : il référence des colonnes ajoutées plus
-- tard par migrations-legacy/ (scenes.owner_user_id, scenes.is_private…) et ne
-- porte pas les RLS de l'espace professeur.
-- La vérité, dans l'ordre : migrations-legacy/ (déjà appliquées à la main en
-- prod) puis migrations/ (CLI). Voir supabase/README.md pour l'ordre de rejeu
-- et `supabase db pull` pour générer une vraie baseline.
-- ---------------------------------------------------------------------------

-- Tables de base
create extension if not exists "uuid-ossp";

create table if not exists public.works (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  author text,
  summary text,
  created_at timestamptz default now()
);

create table if not exists public.scenes (
  id uuid primary key default uuid_generate_v4(),
  work_id uuid references public.works(id) on delete set null,
  title text not null,
  author text,
  summary text,
  chapter text,
  source_scene_id uuid references public.scenes (id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.characters (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references public.scenes (id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists public.lines (
  id uuid primary key default uuid_generate_v4(),
  scene_id uuid references public.scenes (id) on delete cascade,
  character_id uuid references public.characters (id) on delete cascade,
  "order" int not null,
  text text not null,
  created_at timestamptz default now()
);

create unique index if not exists lines_scene_order_idx on public.lines (scene_id, "order");
create index if not exists lines_character_id_idx on public.lines (character_id);
create index if not exists scenes_work_id_idx on public.scenes (work_id);
create unique index if not exists scenes_owner_source_unique_idx
  on public.scenes (owner_user_id, source_scene_id)
  where is_private = true and source_scene_id is not null;

create table if not exists public.user_line_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  line_id uuid references public.lines (id) on delete cascade,
  score int not null check (score between 0 and 10),
  created_at timestamptz default now()
);

create index if not exists user_line_feedback_user_idx on public.user_line_feedback (user_id);
create index if not exists user_line_feedback_line_idx on public.user_line_feedback (line_id);

create table if not exists public.user_learning_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  scene_id uuid references public.scenes (id) on delete cascade,
  character_id uuid references public.characters (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds int,
  total_lines int,
  completed_lines int,
  average_score numeric(4,2),
  created_at timestamptz default now()
);

create index if not exists user_learning_sessions_user_idx on public.user_learning_sessions (user_id);
create index if not exists user_learning_sessions_scene_idx on public.user_learning_sessions (scene_id);
create index if not exists user_learning_sessions_started_at_idx on public.user_learning_sessions (started_at);

alter table public.works enable row level security;
alter table public.user_learning_sessions enable row level security;
alter table public.scenes enable row level security;
alter table public.characters enable row level security;
alter table public.lines enable row level security;
alter table public.user_line_feedback enable row level security;

-- Lecture publique sur les œuvres
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'works'
    and policyname = 'Public read works'
  ) then
    create policy "Public read works" on public.works for select using (true);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Lecture des contenus : publique OU propriétaire OU accès partagé explicite.
--
-- ⚠️ Ces trois policies ne sont PAS celles d'origine. La base a d'abord porté
-- un "Public read scenes/characters/lines" en `using (true)`, remplacé depuis
-- par les policies ci-dessous.
-- Propriétaire réel de ces policies : migrations-legacy/add_scene_sharing.sql
-- (dernière version appliquée en prod). Toute évolution passe par une nouvelle
-- migration, pas par ce fichier — voir supabase/README.md.
-- ---------------------------------------------------------------------------
drop policy if exists "Public read scenes" on public.scenes;
drop policy if exists "Public read characters" on public.characters;
drop policy if exists "Public read lines" on public.lines;

drop policy if exists "Read scenes public or owned" on public.scenes;
create policy "Read scenes public or owned" on public.scenes
  for select using (
    (is_private = false)
    or (is_private = true and owner_user_id = auth.uid())
    or exists (
      select 1 from public.user_work_access uwa
      where uwa.scene_id = scenes.id
        and uwa.user_id = auth.uid()
        and uwa.access_type = 'private'
    )
  );

drop policy if exists "Read characters from accessible scenes" on public.characters;
create policy "Read characters from accessible scenes" on public.characters
  for select using (
    exists (
      select 1 from public.scenes s
      where s.id = characters.scene_id
        and (
          s.is_private = false
          or (s.is_private = true and s.owner_user_id = auth.uid())
          or exists (
            select 1 from public.user_work_access uwa
            where uwa.scene_id = s.id
              and uwa.user_id = auth.uid()
              and uwa.access_type = 'private'
          )
        )
    )
  );

drop policy if exists "Read lines from accessible scenes" on public.lines;
create policy "Read lines from accessible scenes" on public.lines
  for select using (
    exists (
      select 1 from public.scenes s
      where s.id = lines.scene_id
        and (
          s.is_private = false
          or (s.is_private = true and s.owner_user_id = auth.uid())
          or exists (
            select 1 from public.user_work_access uwa
            where uwa.scene_id = s.id
              and uwa.user_id = auth.uid()
              and uwa.access_type = 'private'
          )
        )
    )
  );

-- Écriture réservée (admin/service role)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'works' 
    and policyname = 'Service role write works'
  ) then
    create policy "Service role write works" on public.works
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'scenes' 
    and policyname = 'Service role write scenes'
  ) then
    create policy "Service role write scenes" on public.scenes
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'characters' 
    and policyname = 'Service role write characters'
  ) then
    create policy "Service role write characters" on public.characters
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'lines' 
    and policyname = 'Service role write lines'
  ) then
    create policy "Service role write lines" on public.lines
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Feedback utilisateur: accès restreint à l'utilisateur
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_line_feedback' 
    and policyname = 'Users can insert their feedback'
  ) then
    create policy "Users can insert their feedback" on public.user_line_feedback
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_line_feedback' 
    and policyname = 'Users see their feedback'
  ) then
    create policy "Users see their feedback" on public.user_line_feedback
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_line_feedback' 
    and policyname = 'Users update their feedback'
  ) then
    create policy "Users update their feedback" on public.user_line_feedback
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_line_feedback' 
    and policyname = 'Users delete their feedback'
  ) then
    create policy "Users delete their feedback" on public.user_line_feedback
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- Politiques RLS pour user_learning_sessions
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_learning_sessions' 
    and policyname = 'Users see their sessions'
  ) then
    create policy "Users see their sessions" on public.user_learning_sessions
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_learning_sessions' 
    and policyname = 'Users insert their sessions'
  ) then
    create policy "Users insert their sessions" on public.user_learning_sessions
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_learning_sessions' 
    and policyname = 'Users update their sessions'
  ) then
    create policy "Users update their sessions" on public.user_learning_sessions
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Espace professeur — cette section ne résume QUE les tables.
-- Les policies RLS, les helpers security definer (is_class_teacher,
-- is_class_member, has_class_membership) et les triggers updated_at vivent dans
-- supabase/migrations/20260609120000_add_teacher_spaces.sql, qui fait foi.
-- Ne pas les recopier ici : c'est ce qui a fait dériver les policies de
-- scenes/characters/lines ci-dessus.
-- ---------------------------------------------------------------------------

-- user_profiles.role : 'student' | 'teacher'

create table if not exists public.teacher_classes (
  id uuid primary key default uuid_generate_v4(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  invite_code text not null unique default upper(substring(md5(uuid_generate_v4()::text) from 1 for 8)),
  show_title text,
  show_date date,
  show_venue text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (class_id, email)
);

create table if not exists public.class_scenes (
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  scene_id uuid not null references public.scenes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, scene_id)
);

create table if not exists public.class_assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  member_id uuid not null references public.class_members (id) on delete cascade,
  scene_id uuid not null references public.scenes (id) on delete cascade,
  character_id uuid references public.characters (id) on delete set null,
  note text,
  due_date date,
  created_at timestamptz not null default now(),
  unique (class_id, member_id, scene_id)
);

create table if not exists public.class_annotations (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  scene_id uuid not null references public.scenes (id) on delete cascade,
  line_id uuid references public.lines (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_show_notes (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  scene_id uuid references public.scenes (id) on delete set null,
  member_id uuid references public.class_members (id) on delete set null,
  category text not null default 'mise_en_scene'
    check (category in ('mise_en_scene', 'costumes', 'decors', 'accessoires', 'technique', 'autre')),
  title text not null,
  content text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

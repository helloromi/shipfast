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

create table if not exists public.user_line_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  line_id uuid references public.lines (id) on delete cascade,
  score int not null check (score between 0 and 3),
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

-- Lecture publique sur les contenus
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

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'scenes' 
    and policyname = 'Public read scenes'
  ) then
    create policy "Public read scenes" on public.scenes for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'characters' 
    and policyname = 'Public read characters'
  ) then
    create policy "Public read characters" on public.characters for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'lines' 
    and policyname = 'Public read lines'
  ) then
    create policy "Public read lines" on public.lines for select using (true);
  end if;
end $$;

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

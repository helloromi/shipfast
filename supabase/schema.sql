-- Tables de base
create extension if not exists "uuid-ossp";

create table if not exists public.scenes (
  id uuid primary key default uuid_generate_v4(),
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

create table if not exists public.user_line_feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade,
  line_id uuid references public.lines (id) on delete cascade,
  score int not null check (score between 0 and 3),
  created_at timestamptz default now()
);

create index if not exists user_line_feedback_user_idx on public.user_line_feedback (user_id);
create index if not exists user_line_feedback_line_idx on public.user_line_feedback (line_id);

alter table public.scenes enable row level security;
alter table public.characters enable row level security;
alter table public.lines enable row level security;
alter table public.user_line_feedback enable row level security;

-- Lecture publique sur les contenus
create policy "Public read scenes" on public.scenes for select using (true);
create policy "Public read characters" on public.characters for select using (true);
create policy "Public read lines" on public.lines for select using (true);

-- Écriture réservée (admin/service role)
create policy "Service role write scenes" on public.scenes
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role write characters" on public.characters
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Service role write lines" on public.lines
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Feedback utilisateur: accès restreint à l'utilisateur
create policy "Users can insert their feedback" on public.user_line_feedback
  for insert with check (auth.uid() = user_id);

create policy "Users see their feedback" on public.user_line_feedback
  for select using (auth.uid() = user_id);

create policy "Users update their feedback" on public.user_line_feedback
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users delete their feedback" on public.user_line_feedback
  for delete using (auth.uid() = user_id);

-- Migration : Ajouter des surlignages + notes typées par passage (user_line_highlights)

-- 1. Créer la table user_line_highlights
create table if not exists public.user_line_highlights (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  line_id uuid not null references public.lines(id) on delete cascade,
  start_offset int not null,
  end_offset int not null,
  selected_text text not null default '',
  note_free text null,
  note_subtext text null,
  note_intonation text null,
  note_play text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_line_highlights_user_line_range_unique unique (user_id, line_id, start_offset, end_offset),
  constraint user_line_highlights_offsets_valid check (start_offset >= 0 and end_offset >= 0 and end_offset > start_offset)
);

-- 2. Index
create index if not exists user_line_highlights_user_idx on public.user_line_highlights(user_id);
create index if not exists user_line_highlights_line_idx on public.user_line_highlights(line_id);
create index if not exists user_line_highlights_updated_at_idx on public.user_line_highlights(updated_at);

-- 3. Trigger updated_at
create or replace function update_user_line_highlights_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_user_line_highlights_updated_at on public.user_line_highlights;
create trigger update_user_line_highlights_updated_at
  before update on public.user_line_highlights
  for each row
  execute function update_user_line_highlights_updated_at();

-- 4. RLS
alter table public.user_line_highlights enable row level security;

-- 5. Politiques RLS (privées par user)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_highlights'
    and policyname = 'Users insert their highlights'
  ) then
    create policy "Users insert their highlights" on public.user_line_highlights
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_highlights'
    and policyname = 'Users see their highlights'
  ) then
    create policy "Users see their highlights" on public.user_line_highlights
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_highlights'
    and policyname = 'Users update their highlights'
  ) then
    create policy "Users update their highlights" on public.user_line_highlights
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_highlights'
    and policyname = 'Users delete their highlights'
  ) then
    create policy "Users delete their highlights" on public.user_line_highlights
      for delete using (auth.uid() = user_id);
  end if;
end $$;


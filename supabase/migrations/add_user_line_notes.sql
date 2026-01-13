-- Migration : Ajouter des notes privées par réplique (user_line_notes)

-- 1. Créer la table user_line_notes
create table if not exists public.user_line_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  line_id uuid not null references public.lines(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_line_notes_user_line_unique unique (user_id, line_id)
);

-- 2. Index
create index if not exists user_line_notes_user_idx on public.user_line_notes(user_id);
create index if not exists user_line_notes_line_idx on public.user_line_notes(line_id);
create index if not exists user_line_notes_updated_at_idx on public.user_line_notes(updated_at);

-- 3. Trigger updated_at
create or replace function update_user_line_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_user_line_notes_updated_at on public.user_line_notes;
create trigger update_user_line_notes_updated_at
  before update on public.user_line_notes
  for each row
  execute function update_user_line_notes_updated_at();

-- 4. RLS
alter table public.user_line_notes enable row level security;

-- 5. Politiques RLS (privées par user)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_notes'
    and policyname = 'Users insert their notes'
  ) then
    create policy "Users insert their notes" on public.user_line_notes
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_notes'
    and policyname = 'Users see their notes'
  ) then
    create policy "Users see their notes" on public.user_line_notes
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_notes'
    and policyname = 'Users update their notes'
  ) then
    create policy "Users update their notes" on public.user_line_notes
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_line_notes'
    and policyname = 'Users delete their notes'
  ) then
    create policy "Users delete their notes" on public.user_line_notes
      for delete using (auth.uid() = user_id);
  end if;
end $$;


-- Migration : Espace professeur (classes, élèves, distribution, annotations, préparation du spectacle)
--
-- Modèle :
-- - user_profiles.role : 'student' (défaut) ou 'teacher'
-- - teacher_classes : une classe appartient à un professeur, rejoignable via un code d'invitation
-- - class_members : élèves d'une classe (invités par email, user_id lié au moment où ils rejoignent)
-- - class_scenes : textes (scènes) rattachés à une classe
-- - class_assignments : distribution (élève + scène + personnage optionnel)
-- - class_annotations : annotations du professeur visibles par toute la classe (par réplique ou par scène)
-- - class_show_notes : préparation du spectacle (mise en scène, costumes, décors, accessoires, technique)
--
-- L'accès en lecture d'un élève au contenu d'une scène privée du professeur passe par
-- user_work_access (access_type = 'private'), créé côté serveur lors de la distribution.

create extension if not exists "uuid-ossp";

-- 1. Rôle sur le profil utilisateur
alter table public.user_profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'teacher'));

-- 2. Tables

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

create index if not exists teacher_classes_teacher_idx on public.teacher_classes (teacher_id);

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

create index if not exists class_members_class_idx on public.class_members (class_id);
create index if not exists class_members_user_idx on public.class_members (user_id);

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

create index if not exists class_assignments_class_idx on public.class_assignments (class_id);
create index if not exists class_assignments_member_idx on public.class_assignments (member_id);
create index if not exists class_assignments_scene_idx on public.class_assignments (scene_id);

create table if not exists public.class_annotations (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  scene_id uuid not null references public.scenes (id) on delete cascade,
  -- null => note d'intention au niveau de la scène
  line_id uuid references public.lines (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists class_annotations_scene_idx on public.class_annotations (class_id, scene_id);
create index if not exists class_annotations_line_idx on public.class_annotations (line_id);

create table if not exists public.class_show_notes (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references public.teacher_classes (id) on delete cascade,
  scene_id uuid references public.scenes (id) on delete set null,
  -- élément concernant un élève en particulier (ex: costume de X)
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

create index if not exists class_show_notes_class_idx on public.class_show_notes (class_id, category);

-- 3. Helpers (security definer pour éviter la récursion RLS)

create or replace function public.is_class_teacher(p_class_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teacher_classes tc
    where tc.id = p_class_id and tc.teacher_id = p_user_id
  );
$$;

create or replace function public.is_class_member(p_class_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
    where cm.class_id = p_class_id and cm.user_id = p_user_id
  );
$$;

-- Un utilisateur appartient-il à au moins une classe (bypass du paywall élève) ?
create or replace function public.has_class_membership(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.class_members cm
    where cm.user_id = p_user_id
  );
$$;

-- 4. RLS

alter table public.teacher_classes enable row level security;
alter table public.class_members enable row level security;
alter table public.class_scenes enable row level security;
alter table public.class_assignments enable row level security;
alter table public.class_annotations enable row level security;
alter table public.class_show_notes enable row level security;

do $$
begin
  -- teacher_classes : lecture par le prof ou un membre, écriture par le prof
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'teacher_classes' and policyname = 'Read own or member classes') then
    create policy "Read own or member classes" on public.teacher_classes
      for select using (
        teacher_id = auth.uid() or public.is_class_member(id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'teacher_classes' and policyname = 'Teacher insert classes') then
    create policy "Teacher insert classes" on public.teacher_classes
      for insert with check (teacher_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'teacher_classes' and policyname = 'Teacher update classes') then
    create policy "Teacher update classes" on public.teacher_classes
      for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'teacher_classes' and policyname = 'Teacher delete classes') then
    create policy "Teacher delete classes" on public.teacher_classes
      for delete using (teacher_id = auth.uid());
  end if;

  -- class_members : lecture par le prof et les membres de la classe ; écriture par le prof
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_members' and policyname = 'Read class members') then
    create policy "Read class members" on public.class_members
      for select using (
        public.is_class_teacher(class_id, auth.uid())
        or user_id = auth.uid()
        or public.is_class_member(class_id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_members' and policyname = 'Teacher write class members') then
    create policy "Teacher write class members" on public.class_members
      for all using (public.is_class_teacher(class_id, auth.uid()))
      with check (public.is_class_teacher(class_id, auth.uid()));
  end if;

  -- class_scenes
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_scenes' and policyname = 'Read class scenes') then
    create policy "Read class scenes" on public.class_scenes
      for select using (
        public.is_class_teacher(class_id, auth.uid()) or public.is_class_member(class_id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_scenes' and policyname = 'Teacher write class scenes') then
    create policy "Teacher write class scenes" on public.class_scenes
      for all using (public.is_class_teacher(class_id, auth.uid()))
      with check (public.is_class_teacher(class_id, auth.uid()));
  end if;

  -- class_assignments
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_assignments' and policyname = 'Read class assignments') then
    create policy "Read class assignments" on public.class_assignments
      for select using (
        public.is_class_teacher(class_id, auth.uid()) or public.is_class_member(class_id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_assignments' and policyname = 'Teacher write class assignments') then
    create policy "Teacher write class assignments" on public.class_assignments
      for all using (public.is_class_teacher(class_id, auth.uid()))
      with check (public.is_class_teacher(class_id, auth.uid()));
  end if;

  -- class_annotations
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_annotations' and policyname = 'Read class annotations') then
    create policy "Read class annotations" on public.class_annotations
      for select using (
        public.is_class_teacher(class_id, auth.uid()) or public.is_class_member(class_id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_annotations' and policyname = 'Teacher write class annotations') then
    create policy "Teacher write class annotations" on public.class_annotations
      for all using (public.is_class_teacher(class_id, auth.uid()))
      with check (public.is_class_teacher(class_id, auth.uid()));
  end if;

  -- class_show_notes
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_show_notes' and policyname = 'Read class show notes') then
    create policy "Read class show notes" on public.class_show_notes
      for select using (
        public.is_class_teacher(class_id, auth.uid()) or public.is_class_member(class_id, auth.uid())
      );
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'class_show_notes' and policyname = 'Teacher write class show notes') then
    create policy "Teacher write class show notes" on public.class_show_notes
      for all using (public.is_class_teacher(class_id, auth.uid()))
      with check (public.is_class_teacher(class_id, auth.uid()));
  end if;
end $$;

-- 5. updated_at automatique

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists teacher_classes_updated_at on public.teacher_classes;
create trigger teacher_classes_updated_at before update on public.teacher_classes
  for each row execute function public.set_updated_at();

drop trigger if exists class_annotations_updated_at on public.class_annotations;
create trigger class_annotations_updated_at before update on public.class_annotations
  for each row execute function public.set_updated_at();

drop trigger if exists class_show_notes_updated_at on public.class_show_notes;
create trigger class_show_notes_updated_at before update on public.class_show_notes
  for each row execute function public.set_updated_at();

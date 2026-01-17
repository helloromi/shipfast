-- Migration : Profils utilisateurs + état des emails (Resend) + déduplication
-- Objectif:
-- - Stocker email + date d'inscription (auth) + opt-in marketing (pour sync Audience)
-- - Rendre les envois d'emails idempotents (welcome, unpaid reminder, payment thanks, inactivity)

create extension if not exists "uuid-ossp";

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  auth_created_at timestamptz,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_auth_created_at_idx on public.user_profiles (auth_created_at);

create table if not exists public.user_email_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  welcome_sent_at timestamptz,
  unpaid_reminder_1_sent_at timestamptz,
  payment_thanks_sent_at timestamptz,
  inactivity_sent_at timestamptz,
  -- utilisé pour dédupliquer l'email d'inactivité par "dernière activité"
  last_inactivity_for_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete set null,
  email_type text not null,
  -- clé de déduplication applicative (ex: welcome:<userId>, inactivity:<userId>:<lastActivityISO>)
  dedupe_key text not null unique,
  resend_id text,
  status text not null default 'created', -- created|sent|error|skipped
  error text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_log_user_idx on public.email_log (user_id);
create index if not exists email_log_type_idx on public.email_log (email_type);

alter table public.user_profiles enable row level security;
alter table public.user_email_state enable row level security;
alter table public.email_log enable row level security;

-- Profils: l'utilisateur peut lire/mettre à jour son profil (utile pour opt-in UI)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_profiles'
    and policyname = 'Users read own profile'
  ) then
    create policy "Users read own profile" on public.user_profiles
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_profiles'
    and policyname = 'Users insert own profile'
  ) then
    create policy "Users insert own profile" on public.user_profiles
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_profiles'
    and policyname = 'Users update own profile'
  ) then
    create policy "Users update own profile" on public.user_profiles
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- service_role full access (cron/admin)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_profiles'
    and policyname = 'Service role full access user_profiles'
  ) then
    create policy "Service role full access user_profiles" on public.user_profiles
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- État emails + logs: écriture réservée (admin/service role).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'user_email_state'
    and policyname = 'Service role write user_email_state'
  ) then
    create policy "Service role write user_email_state" on public.user_email_state
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'email_log'
    and policyname = 'Service role write email_log'
  ) then
    create policy "Service role write email_log" on public.email_log
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- Helpers SQL (pour cron): lister les candidats sans N+1 requêtes

create or replace function public.get_unpaid_users_for_reminder(
  p_cutoff timestamptz,
  p_limit int default 500
)
returns table (
  user_id uuid,
  email text,
  auth_created_at timestamptz
)
language sql
stable
as $$
  select
    p.user_id,
    p.email,
    p.auth_created_at
  from public.user_profiles p
  where
    p.email is not null
    and p.auth_created_at is not null
    and p.auth_created_at <= p_cutoff
    and not exists (
      select 1
      from public.billing_subscriptions bs
      where bs.user_id = p.user_id
        and (bs.status = 'active' or bs.status = 'trialing')
        and (bs.current_period_end is null or bs.current_period_end > now())
    )
  order by p.auth_created_at asc
  limit greatest(p_limit, 0);
$$;

create or replace function public.get_inactive_users_for_email(
  p_cutoff timestamptz,
  p_limit int default 500
)
returns table (
  user_id uuid,
  email text,
  last_activity_at timestamptz
)
language sql
stable
as $$
  select
    p.user_id,
    p.email,
    s.last_activity_at
  from (
    select user_id, max(ended_at) as last_activity_at
    from public.user_learning_sessions
    where ended_at is not null
    group by user_id
  ) s
  join public.user_profiles p on p.user_id = s.user_id
  where
    p.email is not null
    and s.last_activity_at is not null
    and s.last_activity_at <= p_cutoff
  order by s.last_activity_at asc
  limit greatest(p_limit, 0);
$$;


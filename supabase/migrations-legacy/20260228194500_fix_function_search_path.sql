-- Migration : Corriger le search_path des fonctions (conseil sécurité Supabase)
-- Sans search_path explicite, une personne pourrait manipuler search_path
-- et faire exécuter du code non prévu. On fixe search_path = public.

-- 1. update_import_jobs_updated_at
create or replace function public.update_import_jobs_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. update_user_line_notes_updated_at
create or replace function public.update_user_line_notes_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3. update_user_line_highlights_updated_at
create or replace function public.update_user_line_highlights_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. get_unpaid_users_for_reminder
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
set search_path = public
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

-- 5. get_inactive_users_for_email
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
set search_path = public
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

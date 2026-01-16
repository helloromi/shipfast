-- Migration : Billing (Stripe customers + subscriptions)
-- Objectif:
-- - Mapper user Supabase -> Stripe customer
-- - (Optionnel) Stocker un snapshot des subscriptions pour faciliter l’UI / règles métier

-- 1) Table billing_customers
create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- 2) Table billing_subscriptions (snapshot)
create table if not exists public.billing_subscriptions (
  stripe_subscription_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists billing_subscriptions_user_idx on public.billing_subscriptions(user_id);
create index if not exists billing_subscriptions_status_idx on public.billing_subscriptions(status);

-- 3) RLS
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;

do $$
begin
  -- billing_customers: users can read their own mapping
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_customers'
    and policyname = 'Users see their billing customer'
  ) then
    create policy "Users see their billing customer" on public.billing_customers
      for select using (auth.uid() = user_id);
  end if;

  -- billing_customers: users can insert their own mapping (created from app server with user session)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_customers'
    and policyname = 'Users insert their billing customer'
  ) then
    create policy "Users insert their billing customer" on public.billing_customers
      for insert with check (auth.uid() = user_id);
  end if;

  -- billing_customers: users can update only their own row (rare; allows rotation if needed)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_customers'
    and policyname = 'Users update their billing customer'
  ) then
    create policy "Users update their billing customer" on public.billing_customers
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;

  -- billing_subscriptions: users can read their own subscription snapshot
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_subscriptions'
    and policyname = 'Users see their billing subscriptions'
  ) then
    create policy "Users see their billing subscriptions" on public.billing_subscriptions
      for select using (auth.uid() = user_id);
  end if;

  -- service_role full access (webhooks/admin)
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_customers'
    and policyname = 'Service role full access billing customers'
  ) then
    create policy "Service role full access billing customers" on public.billing_customers
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
    and tablename = 'billing_subscriptions'
    and policyname = 'Service role full access billing subscriptions'
  ) then
    create policy "Service role full access billing subscriptions" on public.billing_subscriptions
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;


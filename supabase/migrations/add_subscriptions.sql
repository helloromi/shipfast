-- Migration : Ajouter le système d'abonnements Stripe
-- - Table user_subscriptions pour stocker les abonnements
-- - Table user_stripe_customers pour lier les utilisateurs à leurs customers Stripe

-- 1. Créer la table user_stripe_customers
create table if not exists public.user_stripe_customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_stripe_customers_user_idx on public.user_stripe_customers(user_id);
create index if not exists user_stripe_customers_stripe_customer_idx on public.user_stripe_customers(stripe_customer_id);

-- 2. Créer la table user_subscriptions
create table if not exists public.user_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null, -- active, canceled, past_due, incomplete, etc.
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_subscriptions_user_idx on public.user_subscriptions(user_id);
create index if not exists user_subscriptions_stripe_customer_idx on public.user_subscriptions(stripe_customer_id);
create index if not exists user_subscriptions_stripe_subscription_idx on public.user_subscriptions(stripe_subscription_id);
create index if not exists user_subscriptions_status_idx on public.user_subscriptions(status);

-- 3. Activer RLS sur les nouvelles tables
alter table public.user_stripe_customers enable row level security;
alter table public.user_subscriptions enable row level security;

-- 4. Politiques RLS pour user_stripe_customers
do $$
begin
  -- Les utilisateurs voient leur propre customer ID
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_stripe_customers' 
    and policyname = 'Users see their customer'
  ) then
    create policy "Users see their customer" on public.user_stripe_customers
      for select using (auth.uid() = user_id);
  end if;

  -- Service role peut tout faire
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_stripe_customers' 
    and policyname = 'Service role full access'
  ) then
    create policy "Service role full access" on public.user_stripe_customers
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- 5. Politiques RLS pour user_subscriptions
do $$
begin
  -- Les utilisateurs voient leurs propres abonnements
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_subscriptions' 
    and policyname = 'Users see their subscriptions'
  ) then
    create policy "Users see their subscriptions" on public.user_subscriptions
      for select using (auth.uid() = user_id);
  end if;

  -- Service role peut tout faire (pour webhooks Stripe)
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
    and tablename = 'user_subscriptions' 
    and policyname = 'Service role full access'
  ) then
    create policy "Service role full access" on public.user_subscriptions
      for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
  end if;
end $$;

-- 6. Fonction pour mettre à jour updated_at automatiquement
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 7. Triggers pour updated_at
drop trigger if exists update_user_stripe_customers_updated_at on public.user_stripe_customers;
create trigger update_user_stripe_customers_updated_at
  before update on public.user_stripe_customers
  for each row
  execute function update_updated_at_column();

drop trigger if exists update_user_subscriptions_updated_at on public.user_subscriptions;
create trigger update_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row
  execute function update_updated_at_column();


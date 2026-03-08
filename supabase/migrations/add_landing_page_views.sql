-- Table pour enregistrer les vues de la page Landing (une ligne par vue/session).
-- Lecture/écriture via API server-side (service role) uniquement.

create table if not exists public.landing_page_views (
  id uuid primary key default gen_random_uuid(),
  viewed_at timestamptz not null default now()
);

create index if not exists landing_page_views_viewed_at_idx on public.landing_page_views(viewed_at);

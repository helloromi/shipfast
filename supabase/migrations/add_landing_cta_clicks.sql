-- Clics sur les boutons CTA "Se connecter" de la landing (une ligne par clic).
create table if not exists public.landing_cta_clicks (
  id uuid primary key default gen_random_uuid(),
  clicked_at timestamptz not null default now()
);

create index if not exists landing_cta_clicks_clicked_at_idx on public.landing_cta_clicks(clicked_at);

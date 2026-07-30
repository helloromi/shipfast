-- Security Advisor (ERROR) : RLS désactivé sur landing_page_views et
-- landing_cta_clicks, tables exposées publiquement sans protection.
--
-- Usage réel (vérifié dans le code) :
--   - Écriture : src/app/api/landing/view + /cta-click, via le client admin
--     service-role (src/lib/supabase-admin.ts). Le navigateur ne fait que
--     fetch() ces routes — il n'écrit JAMAIS directement avec la clé anon.
--   - Lecture : src/app/api/admin/dashboard/landing-views, service-role +
--     requireAdmin côté app.
--
-- Le rôle service-role contourne la RLS (BYPASSRLS). On active donc la RLS
-- SANS policy anon/authenticated : default-deny pour le public, les chemins
-- serveur continuent de fonctionner. On n'ajoute volontairement pas de policy
-- INSERT anon : la clé anon étant publique (embarquée dans le bundle), une telle
-- policy laisserait n'importe qui insérer des lignes en masse hors de la route API.

alter table public.landing_page_views enable row level security;
alter table public.landing_cta_clicks enable row level security;

comment on table public.landing_page_views is
  'Tracking anonyme des vues de la homepage. Accès service-role uniquement (/api/landing/view + dashboard admin). RLS activé sans policy anon = default-deny.';
comment on table public.landing_cta_clicks is
  'Tracking anonyme des clics CTA de la homepage. Accès service-role uniquement (/api/landing/cta-click + dashboard admin). RLS activé sans policy anon = default-deny.';

-- Security Advisor (WARN) : search_path mutable sur update_updated_at_column.
-- Fix standard : figer le search_path. ALTER FUNCTION préserve le corps existant.
alter function public.update_updated_at_column() set search_path = public;

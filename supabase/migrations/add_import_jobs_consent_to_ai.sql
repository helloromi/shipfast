-- Migration : Ajouter un flag de consentement IA sur import_jobs
-- Permet de tracer le consentement explicite de l'utilisateur lorsque le contenu est envoyé à un tiers (ex: OpenAI)

alter table public.import_jobs
  add column if not exists consent_to_ai boolean not null default false;


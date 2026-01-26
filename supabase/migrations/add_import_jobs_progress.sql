-- Migration : Ajouter le pourcentage de progression pour les imports
-- Objectif: permettre d'afficher une barre de progression précise pendant le traitement

alter table public.import_jobs
  add column if not exists progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100);

-- Index pour les requêtes de statut
create index if not exists import_jobs_progress_idx on public.import_jobs(progress_percentage) where status in ('pending', 'processing');

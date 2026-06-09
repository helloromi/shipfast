-- Migration : Ajouter des champs d'observabilité sur import_jobs
-- Objectif: comprendre pourquoi un import est bloqué (étape courante, tentatives, dernière activité)

alter table public.import_jobs
  add column if not exists processing_stage text,
  add column if not exists status_message text,
  add column if not exists attempts integer not null default 0,
  add column if not exists last_attempt_at timestamptz;


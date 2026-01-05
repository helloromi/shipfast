-- Migration: Mise à jour de la contrainte de score de 0-3 à 0-10
-- Date: 2024

-- Supprimer l'ancienne contrainte
alter table public.user_line_feedback 
drop constraint if exists user_line_feedback_score_check;

-- Ajouter la nouvelle contrainte pour accepter les scores de 0 à 10
alter table public.user_line_feedback 
add constraint user_line_feedback_score_check 
check (score between 0 and 10);


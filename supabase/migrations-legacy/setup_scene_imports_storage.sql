-- Migration : Configuration du bucket Supabase Storage pour les imports de scènes
-- NOTE: Cette migration documente la configuration nécessaire.
-- Le bucket doit être créé manuellement via le dashboard Supabase ou l'API.
-- 
-- Pour créer le bucket via le dashboard :
-- 1. Allez dans Storage > Buckets
-- 2. Créez un nouveau bucket nommé "scene-imports"
-- 3. Configurez-le comme "Public" ou "Private" selon vos besoins
-- 4. Appliquez les politiques RLS ci-dessous via le SQL Editor

-- Politiques RLS pour le bucket scene-imports
-- Les utilisateurs peuvent uploader leurs propres fichiers
-- Les utilisateurs peuvent lire leurs propres fichiers
-- Les utilisateurs peuvent supprimer leurs propres fichiers

-- Note: Les politiques de storage utilisent la syntaxe suivante :
-- CREATE POLICY "policy_name" ON storage.objects FOR operation USING (condition);

-- Exemple de politiques (à adapter selon vos besoins) :

-- Politique d'upload (INSERT)
-- CREATE POLICY "Users can upload their own files"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'scene-imports' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Politique de lecture (SELECT)
-- CREATE POLICY "Users can read their own files"
-- ON storage.objects FOR SELECT
-- USING (
--   bucket_id = 'scene-imports' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Politique de suppression (DELETE)
-- CREATE POLICY "Users can delete their own files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'scene-imports' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- IMPORTANT: 
-- Actuellement, l'implémentation traite les fichiers directement sans les stocker
-- dans Supabase Storage. Si vous souhaitez stocker les fichiers pour un accès ultérieur,
-- vous devrez modifier l'API route pour uploader vers Storage avant le traitement.


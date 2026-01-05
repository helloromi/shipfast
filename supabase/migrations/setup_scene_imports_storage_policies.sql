-- Politiques RLS pour le bucket scene-imports
-- Exécutez ces commandes UNE PAR UNE dans le SQL Editor de Supabase

-- 1. Politique d'upload (INSERT) - Permet aux utilisateurs d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'scene-imports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Politique de lecture (SELECT) - Permet aux utilisateurs de lire leurs propres fichiers
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'scene-imports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique de suppression (DELETE) - Permet aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'scene-imports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);




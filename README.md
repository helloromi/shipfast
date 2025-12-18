# Côté-Cour (Next.js + Supabase)

WebApp d’entraînement de textes (masquage/révélation + feedback 0-3).

## Pré-requis
- Node 18+
- Compte Supabase (URL + clé anonyme + clé service role pour le seed/script)

## Configuration locale
1. Duplique `example.env` en `.env.local` et renseigne :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optionnel, utile pour les scripts d’admin)
2. Installe les dépendances : `npm install`
3. Démarre le serveur : `npm run dev` puis ouvre http://localhost:3000

## Schéma Supabase
- Applique le SQL `supabase/schema.sql` dans le SQL Editor Supabase.
  - Tables : `scenes`, `characters`, `lines`, `user_line_feedback`
  - RLS : lecture publique sur scènes/personnages/répliques, feedback restreint à l’utilisateur.

## Seed de scènes
- Exécute `supabase/seed/scenes.sql` dans le SQL Editor pour injecter 2 scènes (Roméo & Juliette, En attendant Godot).

## Routes principales
- `/login` : magic link Supabase.
- `/scenes` : bibliothèque des scènes (badge de maîtrise si feedback existant).
- `/scenes/[id]` : détails + choix du personnage.
- `/learn/[sceneId]?character=...` : mode apprentissage (révélation + score 0-3).

## Notes
- Pas de PWA/service worker pour l’instant.
- Le reset de progression n’est pas encore implémenté (prévu plus tard).

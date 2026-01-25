# Côté-Cour (Next.js + Supabase)

WebApp d'entraînement de textes (masquage/révélation + feedback 0-3).

## Pré-requis
- Node 18+
- Compte Supabase (URL + clé anonyme + clé service role pour le seed/script)

## Configuration locale
1. Duplique `example.env` en `.env.local` et renseigne :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optionnel, utile pour les scripts d'admin)
   - `NEXT_PUBLIC_SITE_URL` (optionnel en dev, requis en production : URL de votre site déployé)
   - (emails) `RESEND_API_KEY`, `RESEND_FROM` (ex: `contact@votredomaine.com` ou `hello@votredomaine.com` - éviter `noreply` pour améliorer la confiance)
   - (optionnel) `RESEND_AUDIENCE_ID` (sync opt-in vers une Audience Resend)
   - (cron) `CRON_SECRET` (protège les endpoints de jobs planifiés)
2. Installe les dépendances : `npm install`
3. Démarre le serveur : `npm run dev` puis ouvre http://localhost:3000

## Configuration production

### Variables d'environnement requises

- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `NEXT_PUBLIC_SITE_URL` : **URL complète de votre site en production** (ex: `https://votre-domaine.com`)
  - Cette variable est utilisée pour les redirections des magic links
  - Si omise, le système utilisera `window.location.origin` (peut causer des problèmes en production)
- `STRIPE_SECRET_KEY` : Clé secrète Stripe (commence par `sk_`)
- `STRIPE_WEBHOOK_SECRET` : Secret du webhook Stripe (commence par `whsec_`)
- `RESEND_API_KEY` : API key Resend
- `RESEND_FROM` : expéditeur par défaut (doit être sur un domaine vérifié, éviter `noreply` pour améliorer la confiance et la délivrabilité)
- `CRON_SECRET` : secret utilisé pour appeler les endpoints cron (Authorization Bearer)

### Configuration Supabase Dashboard

Pour que les magic links fonctionnent correctement en production :

1. Allez dans votre projet Supabase → **Authentication** → **URL Configuration**
2. Dans **Site URL**, ajoutez l'URL de votre site de production (ex: `https://votre-domaine.com`)
3. Dans **Redirect URLs**, ajoutez :
   - `https://votre-domaine.com/**` (pour toutes les routes)
   - Ou spécifiquement : `https://votre-domaine.com/scenes` (route de redirection après connexion)

## Schéma Supabase
- Applique le SQL `supabase/schema.sql` dans le SQL Editor Supabase.
  - Tables : `scenes`, `characters`, `lines`, `user_line_feedback`
  - RLS : lecture publique sur scènes/personnages/répliques, feedback restreint à l'utilisateur.

## Seed de scènes
- Exécute `supabase/seed/scenes.sql` dans le SQL Editor pour injecter 2 scènes (Roméo & Juliette, En attendant Godot).

## Routes principales
- `/login` : magic link Supabase.
- `/scenes` : bibliothèque des scènes (badge de maîtrise si feedback existant).
- `/scenes/[id]` : détails + choix du personnage.
- `/learn/[sceneId]?character=...` : mode apprentissage (révélation + score 0-3).

## Configuration Stripe

### Créer les produits et prix dans Stripe

L'application propose 3 plans d'abonnement. Vous devez créer les Price IDs correspondants dans Stripe :

1. **Dans Stripe Dashboard** :
   - Allez dans **Products** → **Create product**
   - Créez un produit (ex: "Abonnement Côté-Cour")
   - Ajoutez 3 prix récurrents :
     - **Mensuel** : 5€ / mois → copiez le Price ID (commence par `price_`)
     - **Trimestriel** : 12€ / 3 mois → copiez le Price ID
     - **Annuel** : 50€ / an → copiez le Price ID

2. **Ajoutez les Price IDs à vos variables d'environnement** :
   ```
   STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY=price_xxxxx
   STRIPE_SUBSCRIPTION_PRICE_ID_QUARTERLY=price_xxxxx
   STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY=price_xxxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxx
   ```

### Configuration Stripe Webhook

Pour que les paiements fonctionnent correctement, vous devez configurer le webhook Stripe :

1. **Dans Stripe Dashboard** :
   - Allez dans **Developers** → **Webhooks**
   - Cliquez sur **Add endpoint**
   - Entrez l'URL : `https://votre-domaine.com/api/payments/webhook`
   - Sélectionnez l'événement : `checkout.session.completed`
   - Copiez le **Signing secret** (commence par `whsec_`)
   - Ajoutez-le à votre variable d'environnement `STRIPE_WEBHOOK_SECRET`

2. **Vérifier la configuration** :
   - Visitez `/api/payments/webhook/test` pour voir l'état de la configuration
   - Vérifiez les logs de votre application pour voir les événements webhook reçus
   - Les logs commencent par `[WEBHOOK]` pour les événements Stripe
   - Les logs commencent par `[SUCCESS]` pour la route de succès après paiement

3. **En cas de problème** :
   - Le système a un mécanisme de fallback : si le webhook est en retard, la route `/api/payments/success` accorde l'accès directement
   - Vérifiez les logs pour voir si c'est le webhook ou la route success qui a accordé l'accès
   - Dans Stripe Dashboard → Webhooks, vous pouvez voir l'historique des tentatives et les erreurs éventuelles

## Notes
- Pas de PWA/service worker pour l'instant.
- Le reset de progression n'est pas encore implémenté (prévu plus tard).

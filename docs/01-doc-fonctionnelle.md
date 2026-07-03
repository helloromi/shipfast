# Côté-Cour — Documentation fonctionnelle

> **Objet** : liste exhaustive de ce qui est *réellement codé et fonctionnel* dans le repo `shipfast`, reconstituée à partir des routes, composants et schéma de base de données. Ce document décrit le comportement observable, pas les intentions.
>
> **Produit** : Côté-Cour, application web française pour acteurs/comédiens qui veulent apprendre leurs répliques (masquer/révéler, s'auto-noter de 0 à 10, suivre leur progression), avec un espace professeur pour gérer des classes/troupes.
>
> Généré le 2026-06-24.

---

## 1. Vue d'ensemble des parcours

Trois grands profils d'usage cohabitent dans le code :

1. **Comédien autonome (abonné)** — importe ou choisit des scènes, apprend ses répliques, suit ses stats.
2. **Professeur** — crée des classes, importe des textes, distribue rôles et scènes aux élèves, annote, prépare le spectacle.
3. **Élève rattaché à une classe** — rejoint via un code, accède aux scènes assignées sans payer (couvert par l'abonnement du prof).
4. **Admin** — tableau de bord d'administration (utilisateurs, activité, facturation, analytics landing).

L'accès aux pages protégées repose sur un **paywall** : il faut être **admin**, **abonné Stripe actif**, ou **membre d'une classe**. Sinon → redirection vers `/onboarding`.

---

## 2. Authentification & comptes

- **Connexion par lien magique uniquement** (magic link Supabase). Pas de mot de passe.
  - Page `/login` → formulaire email (`magic-link-form.tsx`).
  - Callback `/auth/callback` traite le retour du lien.
  - Une cible post-login est gérée (ex. un élève invité arrive avec `/rejoindre?code=XXXX`).
- **Route `/api/auth/post-login`** : actions exécutées après connexion (synchro contact, etc.).
- **Suppression de compte** : `/api/account/delete` (effacement des données utilisateur).
- **Rôle utilisateur** : `student` ou `teacher`, stocké dans `user_profiles.role`, modifiable via `/api/profile/role`. Choisi à l'onboarding, changeable ensuite.
- **Admins** : identifiés par email via la variable `ADMIN_EMAILS` (pas un rôle en base).
- **Page racine `/`** : si connecté → `/home`, sinon → `/landing`.

---

## 3. Landing & acquisition (visiteur non connecté)

- **`/landing`** : page marketing complète — hero, « Comment ça marche » (`how-it-works.tsx`), FAQ (`faq-section.tsx`), section tarifs (`pricing-section.tsx`), CTA trackés.
- **Tracking analytics maison** :
  - `/api/landing/view` enregistre les vues de page (`landing_page_views`).
  - `/api/landing/cta-click` enregistre les clics CTA (`landing_cta_clicks`).
  - Composants `landing-view-tracker.tsx` et `landing-cta-tracked-link.tsx`.
- **SEO** : `json-ld-software-application.tsx` (données structurées Schema.org).
- **Ressources / blog** :
  - `/ressources` : liste d'articles (source : `src/content/ressources/articles.ts`).
  - `/ressources/[slug]` : page article. Au moins **1 article réellement rédigé** : « Comment apprendre son premier texte de théâtre sans stress ».
- **`/confidentialite`** : page politique de confidentialité.

---

## 4. Onboarding (`/onboarding`)

Parcours interactif client (`onboarding-client.tsx`), **non bloquant** :

1. **Choix du profil** : « Je suis comédien·ne » ou « Je suis professeur » (best-effort : enregistre le rôle, continue même si l'appel échoue).
2. **Parcours en 3 étapes** selon le profil, avec stepper cliquable :
   - **Élève** : (1) démo interactive d'apprentissage réellement jouable (choix Marie/Paul, révélation, notation), (2) aperçu des statistiques avec graphique de démo, (3) pitch import (photo/PDF).
   - **Professeur** : (1) classe + code d'invitation, (2) distribution des rôles + annotations, (3) préparation du spectacle (mise en scène, costumes, décors…). Visuels = **maquettes statiques**, pas de fonctionnel.
3. **Dernière étape** → CTA « Découvrir les plans » vers `/subscribe`, mention « satisfait ou remboursé 14 jours », et pour le prof « un seul abonnement couvre la classe ».

> Note : l'onboarding ne déclenche aucune création de contenu. C'est un tunnel pédagogique + vers le paywall.

---

## 5. Abonnement & paiement

- **`/subscribe`** : page de souscription.
- **Trois formules** via 3 price IDs Stripe : **mensuel**, **trimestriel**, **annuel** (`STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY/QUARTERLY/YEARLY`).
- **Checkout** : `/api/payments/create-checkout` crée une session Stripe Checkout (`checkout-button.tsx`).
- **Webhook** : `/api/payments/webhook` traite `checkout.session.completed` (et active l'abonnement). `/api/payments/webhook/test` renvoie l'état de configuration.
- **Succès** : `/api/payments/success` + `/api/payments/success` côté retour.
- **Portail de facturation** : `/api/billing/portal` (gérer/annuler l'abonnement via le portail Stripe client).
- **Modèle d'accès** (`require-subscription.ts`) : admin **OU** abonnement actif **OU** membre d'une classe. Les trois vérifications tournent en parallèle.
- **Données** : tables `billing_customers`, `billing_subscriptions`.

---

## 6. Bibliothèque & scènes (comédien)

### Pages
- **`/home`** : accueil connecté. Affiche : carte récapitulative de stats, section « imports en cours », et la liste des scènes en cours de progression. **État vide** géré : message + lien vers la bibliothèque.
- **`/bibliotheque`** : « Mes scènes » — scènes privées de l'utilisateur, scènes partagées avec lui, imports en attente, recherche.
- **`/scenes`** : catalogue des œuvres publiques (`works`) + scènes privées de l'utilisateur, avec recherche.
- **`/works/[id]`** : détail d'une œuvre, ses scènes, gate d'accès (`access-gate.tsx`).
- **`/scenes/[id]`** : détail d'une scène avec onglets (`scene-detail-tabs.tsx`) — texte, stats, notes/surlignages.
- **`/scenes/[id]/edit`** : éditeur de scène (`scene-editor.tsx`).
- **`/scenes/[id]/export`** : export imprimable (`export-print-trigger.tsx`).

### Modèle de contenu
`works` → `scenes` → `characters` → `lines` (ordonnées par `"order"`, unique par scène).

### Fonctionnalités sur une scène
- **Fork** : dupliquer une scène publique en copie privée éditable (`fork-scene-button.tsx`, `/api/scenes/[id]/fork`). Champs `is_private`, `owner_user_id`, `source_scene_id`. Unicité : un seul fork par (user, scène source).
- **Édition des répliques** : `/api/scenes/[id]/lines`, `/api/scenes/[id]/editor`.
- **Suppression d'accès** : `/api/scenes/[id]/remove`.
- **Partage** : `/api/scenes/[id]/share` (génère un partage ; `add_scene_sharing` en base). Scènes partagées visibles dans la bibliothèque du destinataire.
- **Notes par réplique** : `line-note-editor.tsx`, table `user_line_notes`, requêtes `queries/notes.ts`.
- **Surlignages par réplique** : `line-highlights-editor.tsx`, table `user_line_highlights`.
- **Sélecteur de plage de répliques** : `line-range-selector.tsx`.

### Contrôle d'accès fin
- `checkAccess` (`access-control.ts`) : admin = accès total ; sinon vérifie un accès existant (abonnement).
- **Logique « free slot »** : `/api/access/grant-free-slot` + `/api/access/check`. Permet d'accorder un accès gratuit à une scène dans une limite côté serveur (idempotent). Table `user_work_access` (avec contrainte d'unicité user/scène).

---

## 7. Apprentissage d'une scène (`/learn/[sceneId]`)

Cœur du produit (`learn-session.tsx`, ~1300 lignes). Fonctionnalités réellement implémentées :

### Configuration de session (modale d'ouverture)
- **Nombre de répliques à travailler** : presets dynamiques (5 / 10 / 15 selon le nombre disponible) ou « Toutes ».
- **Options avancées** (repliées par défaut) :
  - **Mode d'affichage** : `flashcard` (une réplique à la fois) ou `overview` (toute la scène en liste). Auto-suggéré : overview si ≤ 5 répliques.
  - **Mode de saisie** (flashcard seulement) : `revealOnly` (révéler) ou `write` (écrire sa réplique avant de révéler).
  - **Point de départ** : slider pour commencer à une réplique précise.
- **Préférences mémorisées** par scène/personnage dans `localStorage` (`prefs:...`).
- Résumé de session avant lancement.

### Pendant la session
- Répliques de l'utilisateur **masquées (floutées)** ; les autres visibles.
- **Amorce (cue)** : les 5 derniers mots de la réplique adverse précédente sont mis en gras pour donner le contexte.
- **Indice** : bouton qui dévoile les premiers mots (flashcard).
- **Révélation** par bouton, clic, ou touche **Entrée / Espace**.
- **Détection des didascalies** (texte entre `[ ]` / `( )`, ou personnage « didascalie/scène/narrateur ») : affichées en italique, exclues du jeu.
- **Auto-scroll** intelligent vers la prochaine réplique en mode overview.
- **Brouillons** de saisie sauvegardés (debounce) dans `localStorage`, liés à l'ID de session (non réutilisés d'une session à l'autre).
- **Mode Zen** activé par défaut (interface épurée ; `?zen=0` pour le mode debug avec navigation/compteurs).

### Notation
- 4 boutons : **Raté (0)**, **Hésitant (3)**, **Bon (7)**, **Parfait (10)**.
- Chaque note insérée dans `user_line_feedback` (score 0–10) via le client Supabase navigateur.
- Toast de confirmation. En flashcard, passage auto à la carte suivante.

### Suivi de séance
- **Début** : `/api/sessions/start` crée une ligne `user_learning_sessions`, démarre un chrono.
- **Fin** : `/api/sessions/end` enregistre durée, répliques complétées, score moyen.
- **Quitter** : ferme proprement la session puis retour à la page scène.
- **Écran de fin** : résumé par score (barres + %), temps de pratique, et bouton **« Continuer »** intelligent (enchaîne sur les répliques suivantes), « Recommencer », « Retour accueil ».

---

## 8. Import de scènes (pipeline IA)

Pipeline asynchrone réel :

1. **Upload** : `/scenes/import` (`import-form.tsx`) → fichier PDF/texte/photo envoyé dans le **storage Supabase** + ligne dans `import_jobs`. Route `/api/scenes/import`.
2. **Consentement IA** : un import qui passe par l'IA nécessite `consent_to_ai` (var `REQUIRE_AI_CONSENT`).
3. **Traitement par étapes** (`process-import-job.ts`), avec progression écrite en base (`processing_stage`, `progress_percentage`, `status_message`) :
   `validating` → `downloading` → `extracting` → `parsing` → `finalizing`.
   - **Sécurité** : refus de tout fichier hors du dossier `user_id/` du storage.
   - **Extraction de texte** (`text-extraction.ts`) : pdfjs / pdf-parse, avec **OCR OpenAI optionnel** (vision `gpt-4o-mini`) pour les PDF/images.
   - **Parsing IA** (`text-parser.ts`) : `gpt-4o-mini` découpe le texte en personnages + répliques ordonnées.
4. **Déclenchement** : le traitement démarre **immédiatement après l'upload**. La route `/api/scenes/import` gère plusieurs modes selon les headers :
   - **Background** (`x-import-background: 1`) : crée le job, renvoie le `jobId` aussitôt, puis traite via `after()` / `waitUntil` de Vercel (la fonction serverless reste vivante après la réponse).
   - **Streaming** (`x-import-stream: 1`) : traitement avec retour progressif.
   - **Synchrone** : crée directement la scène et la renvoie.
   Le cron `/api/cron/imports/process` (quotidien, 04:00) n'est qu'un **filet de rattrapage** pour les jobs restés bloqués. Statut consultable via `/api/scenes/import/status` et `/api/scenes/import/[jobId]`. **Retry** : `/api/scenes/import/[jobId]/retry`.
5. **Aperçu & validation** : `/imports/[jobId]/preview` montre le résultat ; l'utilisateur valide via `/api/scenes/import/commit` qui crée réellement la scène/personnages/répliques.
6. **`/imports`** : liste des imports de l'utilisateur.
7. **Email** : `sendImportReadyEmailIfNeeded` notifie quand un import est prêt.

---

## 9. Espace professeur

### Pages
- **`/professeur`** : tableau de bord prof — liste des classes, création (`create-class-form.tsx`).
- **`/professeur/classes/[id]`** : détail d'une classe (`class-detail-client.tsx`) — membres, scènes attachées, distribution des rôles, notes de spectacle.
- **`/professeur/classes/[id]/textes/[sceneId]`** : annotation d'une scène pour la classe (`scene-annotations-editor.tsx`).

### Côté élève
- **`/rejoindre`** : rejoindre une classe via code d'invitation (`join-class-form.tsx`, `/api/class/join`).
- **`/mes-cours`** : vue élève de tout ce qui lui est partagé par la/les classe(s).

### Fonctionnalités (API `/api/teacher/*`)
- **Classes** : `/api/teacher/classes` (CRUD), `/api/teacher/classes/[id]`.
- **Membres** : `/api/teacher/classes/[id]/members`.
- **Scènes de classe** : `/api/teacher/classes/[id]/scenes`.
- **Assignations** : `/api/teacher/classes/[id]/assignments` — attribue une scène + un personnage à un élève. Crée automatiquement une ligne `user_work_access` (`access_type='private'`) pour que la RLS de scène accorde la lecture.
- **Annotations de jeu** : `/api/teacher/annotations` (`class_annotations`, par réplique) — visibles par l'élève sur son texte (`teacher-annotations-panel.tsx`).
- **Notes de spectacle** : `/api/teacher/show-notes` (`class_show_notes`) — catégories `mise_en_scene / costumes / decors / accessoires / technique / autre`, statut `todo / in_progress / done`.

### Tables
`teacher_classes` (avec `invite_code`, `show_title/date/venue`), `class_members`, `class_scenes`, `class_assignments`, `class_annotations`, `class_show_notes`. RLS via helpers `is_class_teacher` / `is_class_member`. Nettoyage des `user_work_access` à la suppression d'assignation/membre/scène.

---

## 10. Statistiques

- **Carte résumé** (`stats-summary-card.tsx`) sur `/home`.
- **Détail par scène** (`scene-stats-detail.tsx`) dans les onglets de scène.
- **Graphiques** (Recharts) : évolution de la note (`score-evolution-chart.tsx`), maîtrise par réplique (`line-mastery-chart.tsx`).
- **Sources** : `user_line_feedback` (scores) + `user_learning_sessions` (séances). Requêtes dans `queries/stats.ts`.

---

## 11. Emails (Resend)

- **Templates** (`resend/templates.ts`) : bienvenue, relance impayé, remerciement paiement, inactivité, import prêt.
- **Automation** (`resend/automation.ts`) : envois idempotents (`...IfNeeded`), synchro d'audience marketing avec opt-in/opt-out, adresses expéditeur par type d'email.
- **Crons** (`vercel.json`) :
  - `/api/cron/emails/inactivity` (quotidien 05:00) — relance les utilisateurs inactifs.
  - `/api/cron/emails/unpaid` (quotidien 06:00) — relance les comptes non payants.
- **Synchro contact** : `/api/resend/sync-contact`.
- **Tables** : `user_email_state`, `email_log`, `user_profiles`.
- **Protection cron** : header `Authorization: Bearer $CRON_SECRET` (`assertCronAuth`).

---

## 12. Administration (`/admin`)

Réservé aux emails dans `ADMIN_EMAILS`. Backé par `/api/admin/dashboard/*` (client service-role).

- **Utilisateurs** : table (`admin-users-table.tsx`), `/api/admin/dashboard/users` ; détail d'activité par utilisateur (`admin-user-activity-drawer.tsx`, `/api/admin/dashboard/users/[userId]/activity`).
- **Activité** : graphiques (`admin-activity-charts.tsx`, `/api/admin/dashboard/activity`).
- **Facturation** : résumé (`admin-billing-summary.tsx`, `/api/admin/dashboard/billing`).
- **Analytics landing** : vues (`admin-landing-views.tsx`, `/api/admin/dashboard/landing-views`).
- **Création de scène** : `/admin/scenes/create` (`create-scene-form.tsx`, `/api/admin/scenes/create`).
- **Maintenance** : `/api/admin/sessions/purge-empty` (purge des sessions vides), `/api/admin/users`.

---

## 13. Compte (`/compte`)

- Gestion de l'abonnement (lien portail Stripe) et des données.
- Suppression de compte.
- (`account-page-client.tsx`)

---

## 14. Récapitulatif des tables de base de données

| Domaine | Tables |
|---|---|
| Contenu | `works`, `scenes`, `characters`, `lines` |
| Progression | `user_line_feedback`, `user_learning_sessions`, `user_line_notes`, `user_line_highlights` |
| Accès | `user_work_access` |
| Facturation | `billing_customers`, `billing_subscriptions` |
| Imports | `import_jobs` |
| Emails / profils | `user_profiles`, `user_email_state`, `email_log` |
| Landing analytics | `landing_page_views`, `landing_cta_clicks` |
| Espace prof | `teacher_classes`, `class_members`, `class_scenes`, `class_assignments`, `class_annotations`, `class_show_notes` |

**RLS** : lecture publique sur `works/scenes/characters/lines` ; lignes par-utilisateur restreintes au propriétaire ; écriture contenu réservée au service-role ; classes via helpers security-definer.

---

## 15. Ce qui existe vs ce qui est « façade »

| Réellement fonctionnel | Maquette / statique |
|---|---|
| Apprentissage flashcard/overview + notation + sessions | Visuels « professeur » de l'onboarding (étapes 2-3 = images figées) |
| Import IA PDF/photo → scène | — |
| Espace prof complet (classes, rôles, annotations, notes spectacle) | — |
| Paiement Stripe 3 formules + portail | — |
| Stats (graphiques réels alimentés par la DB) | Graphique de stats de l'onboarding (données factices `FAKE_STATS_DATA`) |
| Emails transactionnels + crons de relance | — |
| Admin dashboard | — |
| Articles ressources | 1 seul article rédigé pour l'instant |

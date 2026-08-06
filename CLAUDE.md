# CLAUDE.md — Côté-Cour

Fichier lu automatiquement par Claude Code à chaque session sur ce repo (référence-le aussi dans les rules Cursor si tu y retournes). Il définit ce qui est autorisé, interdit, et les critères de validation.

## Le produit

App française d'apprentissage de texte de théâtre par flashcards et répétition espacée. Utilisateurs sur mobile (métro, coulisses). Stack : Next.js + Tailwind, Supabase (Postgres + auth magic-link), Stripe, Brevo, déployé sur Vercel.

- Version Next.js et App Router ou Pages Router : Next.js 16.0.10, App Router (`src/app/`), React 19, Tailwind 4.
- Tables Supabase principales (projet `cote-cour`) : `works`, `scenes`, `characters`, `lines` (le texte), `user_profiles`, `user_line_feedback`, `user_learning_sessions`, `user_work_access`, `import_jobs`, `billing_customers`, `billing_subscriptions` (le pass), `teacher_classes` + `class_*` (mode professeur), `landing_page_views` / `landing_cta_clicks` (tracking). `user_stripe_customers` et `user_subscriptions` existent mais sont vides (legacy).
- Où vit la logique de paywall : `src/lib/queries/access.ts` (`hasActiveSubscription`, lit `billing_subscriptions.status` + `current_period_end`) et `src/lib/utils/require-subscription.ts` (garde côté serveur). Flux Stripe dans `src/app/api/payments/` (create-checkout, webhook, success).
- Commandes : `npm run dev` / `npm run build` / `npm run lint` / `npm run test` (vitest) / `npm run seed:scenes` (exécute `supabase/seed/seed-scenes.ts` via tsx).

## Phase actuelle : acquisition — premiers utilisateurs payants

Le gel des features est levé depuis le 06/08/2026 : le socle SEO est en place et le trafic monte (5-8 impressions/jour mi-juillet → 90 début août). Le repo passe en phase d'acquisition. **Le plan opérationnel vit dans `DISTRIBUTION.md` — le lire avant de proposer un chantier**, et `PROSPECTION.md` pour la méthode de contact.

L'objectif unique jusqu'au 30/09/2026 : **2 à 4 professeurs de théâtre payants**. Pas de trafic, pas d'inscrits — des ventes.

Le critère d'arbitrage n'est plus « est-ce du funnel SEO ? » mais **« est-ce que ça rapproche d'une vente avant le 30 septembre ? »**. Concrètement :

- **Prioritaire** — les trois chantiers de `DISTRIBUTION.md` §3 : premier import offert, PDF gratuit des scènes du domaine public, parcours professeur en autonomie.
- **Reporté à octobre, explicitement** — la réécriture des `title` et les URLs UUID indexées (`DISTRIBUTION.md` §5). C'est rentable mais sans effet sur l'objectif ; le rappeler si Paul veut s'y remettre maintenant.
- **Refusé** — tout ce qui ne sert ni une vente ni un chantier en cours, avec un rappel de cette règle, même si Paul le demande.

Rappel de contexte utile à tout arbitrage : le trafic SEO est scolaire (lycéens cherchant un texte du domaine public) et ne croisera jamais le produit payant. Les acheteurs sont les cours de théâtre adultes montant du contemporain, et `hasClassMembership` fait du **professeur l'unité de vente** — une vente, quinze utilisateurs.

## Règles produit invariantes

1. Tout le contenu du domaine public est gratuit et accessible SANS compte. Ne jamais mettre une scène du domaine public derrière un login. **Cela vaut aussi pour ses dérivés** : l'export PDF d'une scène publique n'est jamais derrière le pass (chantier 2 de `DISTRIBUTION.md`).
2. Le paywall porte sur l'import de texte perso (photo/PDF via IA). Modèle : pass 3 mois à 12€, paiement Stripe unique, date d'expiration en base, pas d'abonnement récurrent. **Le premier texte importé est offert** : le pass se déclenche au deuxième, et ne retire jamais l'accès au premier.
3. Le compte n'est proposé que pour sauvegarder sa progression, exporter une scène en PDF, ou importer un texte.
4. Mobile-first : toute page ou composant se vérifie d'abord sur un viewport 375px, utilisable à une main.
5. Prix : 12€ inchangé, et **pas de second SKU (« Pass classe ») avant qu'un inconnu ait payé une première fois**. Les codes promo restent unitaires ; plus de −100 % distribués en prospection (`DISTRIBUTION.md` §4).

## Exigences SEO (s'appliquent à toute page publique)

- Rendu côté serveur (SSR ou SSG). Aucun contenu clé chargé uniquement côté client.
- Une URL propre et stable par scène : /scenes/[auteur]/[piece]/[scene-slug] ou équivalent.
- Title et meta description uniques par page, construits sur la requête cible (ex. « Tirade du nez, Cyrano de Bergerac : texte intégral et apprentissage »).
- Schema.org : CreativeWork/Play sur les pages scènes (auteur, pièce, personnages), FAQPage sur les guides.
- Sitemap.xml généré automatiquement, incluant chaque nouvelle scène seedée.
- Canonical sur chaque page, Open Graph rempli.
- Le texte intégral de la scène est dans le HTML servi, pas dans un JSON hydraté après coup.

## Definition of done d'une page scène

Une page scène est terminée quand : le texte intégral s'affiche sans compte, le mode flashcard se lance sans compte, la page passe Lighthouse SEO > 90 sur mobile, le schema est valide (validator.schema.org), l'URL est dans le sitemap, et un CTA vers la création de compte est présent sans être bloquant.

## Seed du contenu

Les scènes arrivent par lots de 10 en JSON (générés dans le projet Claude, format du seed script existant). Chaque fiche porte un champ reliability : les pièces en vers (Cyrano, Le Cid…) sont vérifiées contre Wikisource avant mise en ligne. Le seed script utilise le client admin Supabase avec le bloc CONFIG centralisé, ne pas dupliquer la logique.

## Ce que l'agent doit faire systématiquement

- Avant tout changement : vérifier que la page concernée reste indexable (pas de redirect vers login, pas de noindex hérité).
- Après tout changement de route ou de page : régénérer/vérifier le sitemap.
- Signaler tout endroit où du contenu domaine public passerait derrière l'auth **ou derrière le pass**.
- Proposer les changements en petits diffs vérifiables, pas en réécriture de fichiers entiers.
- Situer toute proposition par rapport à l'objectif du 30/09 : quel chantier de `DISTRIBUTION.md` elle sert, ou pourquoi elle passe avant.
- Tenir `DISTRIBUTION.md` à jour quand un chantier est livré ou qu'un chiffre du §6 est relevé.

## Ce que l'agent ne fait jamais

- Ouvrir un chantier qui ne rapproche pas d'une vente avant le 30/09, même « rapide » — y compris du SEO listé comme reporté en §5 de `DISTRIBUTION.md`.
- Lancer une vague de prospection en août : la cible (bénévoles de cours amateurs) ne lit pas ses mails avant le 24/08. Le calendrier est dans `DISTRIBUTION.md` §2.
- Toucher au flux Stripe existant sans plan de test sandbox explicite.
- Supprimer ou modifier des données de production Supabase sans confirmation.
- Introduire une dépendance lourde pour un besoin ponctuel.

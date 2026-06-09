# Transition — Refonte UX/UI + Espace professeur

Ce document explique comment passer de la version actuelle en production à la nouvelle version :
ce qui a changé, dans quel ordre déployer, comment tester, et comment revenir en arrière si besoin.

---

## 1. Vue d'ensemble des changements

### Nouveautés produit
- **Espace professeur** (`/professeur`) : création de classes, invitation d'élèves (email ou code),
  rattachement de textes, distribution des rôles, annotations visibles par toute la classe,
  préparation du spectacle (mise en scène, costumes, décors, accessoires, technique).
- **Espace élève** (`/mes-cours`) : textes distribués avec personnage attribué, notes du professeur,
  infos spectacle et coulisses. Rejoindre une classe via `/rejoindre` avec un code.
- **Annotations du prof sur la page scène** : un élève qui ouvre `/scenes/[id]` voit un panneau
  « Notes du professeur » (note d'intention + notes par réplique).
- **Onboarding refondu** : choix du profil (comédien·ne / professeur) puis un parcours dédié à chacun.
- **Landing page refondue** : hero « scène de théâtre » sombre, démo visuelle du masquage,
  section professeurs, FAQ enrichie. Le tracking existant (vues + clics CTA) est conservé.

### Design
- Nouvelles polices : **Fraunces** (titres) + **Karla** (texte) au lieu de Playfair/Inter.
- Système de tokens dans `globals.css` (`--paper`, `--ink`, `--prune`, `--corail`, `--gold`…)
  et classes utilitaires partagées : `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.btn-ghost`,
  `.card`, `.chip`, `.input`, `.label`, `.stage-dark`, animations `.reveal`/`.spotlight`.
- Footer enrichi, header avec entrées « Mes cours » / « Espace prof » selon le rôle.

### Changement de modèle d'accès (important)
Le paywall devient : **admin OU abonnement actif OU membre d'une classe**.
Concrètement : un élève rattaché à la classe d'un professeur accède à ses textes distribués
**sans payer d'abonnement** — c'est l'abonnement du professeur qui couvre la classe.

- Implémenté dans `src/lib/utils/require-subscription.ts` et `src/lib/queries/access.ts`
  (appel à la fonction SQL `has_class_membership`).
- Si tu ne veux PAS de ce comportement, retire le bloc `hasClassMembership` dans ces deux fichiers.

L'accès en lecture des élèves aux scènes privées du professeur réutilise le mécanisme de partage
existant : une ligne `user_work_access` avec `access_type = 'private'` est créée/supprimée
automatiquement par les routes de distribution.

---

## 2. Étapes de migration (dans l'ordre)

### Étape 1 — Base de données (Supabase SQL Editor)

Deux options :

**Option A — Supabase CLI (recommandé, désormais en place)** :
```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push   # applique supabase/migrations/20260609120000_add_teacher_spaces.sql
```

**Option B — à la main** : exécute
**`supabase/migrations/20260609120000_add_teacher_spaces.sql`** dans le SQL Editor,
puis `supabase migration repair --status applied 20260609120000` si tu adoptes le CLI ensuite.

Le détail du workflow de migrations (legacy vs CLI) est documenté dans `supabase/README.md`.

Pré-requis (déjà en prod normalement — voir `supabase/migrations-legacy/`) :
- `add_user_profiles_and_email_automation.sql` (table `user_profiles`)
- `add_user_work_access_unique_user_scene.sql` (index unique `user_id, scene_id`)
- `add_scene_sharing.sql` (policies RLS de lecture via `user_work_access` 'private')

La migration crée :
| Objet | Rôle |
|---|---|
| `user_profiles.role` | `'student'` (défaut) ou `'teacher'` |
| `teacher_classes` | classes (+ code d'invitation, infos spectacle) |
| `class_members` | élèves (email, lien `user_id` quand ils rejoignent) |
| `class_scenes` | textes rattachés à une classe |
| `class_assignments` | distribution élève × scène × personnage |
| `class_annotations` | annotations du prof (par scène ou par réplique) |
| `class_show_notes` | préparation du spectacle (catégories + statut) |
| `is_class_teacher`, `is_class_member`, `has_class_membership` | helpers `security definer` pour les policies RLS |

Elle est **idempotente** (`if not exists` partout) et **purement additive** : aucune table ni
colonne existante n'est modifiée (à part l'ajout de `user_profiles.role`).

Vérification rapide après exécution :
```sql
select count(*) from public.teacher_classes;                 -- doit répondre 0
select public.has_class_membership('00000000-0000-0000-0000-000000000000'); -- false
select role from public.user_profiles limit 1;               -- 'student'
```

### Étape 2 — Variables d'environnement

**Aucune nouvelle variable n'est requise.** Stripe, Resend, cron : rien ne change.

### Étape 3 — Déploiement du code

Déploiement Vercel classique (`git push` sur `main`). Aucun changement dans `vercel.json`.

⚠️ Déploie le code **après** la migration SQL : les nouvelles pages interrogent les nouvelles
tables (elles échouent proprement avec des listes vides + logs console, mais autant éviter).

### Étape 4 — Tests manuels post-déploiement

Parcours professeur :
1. Connecte-toi, va sur `/onboarding` → choisis « Je suis professeur » (le rôle est enregistré).
2. `/professeur` → crée une classe → vérifie le code d'invitation.
3. Onglet **Textes** : importe un texte (ou choisis-en un de ta bibliothèque) et rattache-le.
4. Onglet **Élèves** : ajoute un élève par email (utilise un second compte de test).
5. Onglet **Distribution** : attribue le texte + un personnage à l'élève.
6. **Annoter** : ajoute une note d'intention + une note sur une réplique.
7. Onglet **Spectacle** : renseigne titre/date/lieu, ajoute un costume assigné à l'élève,
   fais cycler le statut (À faire → En cours → Prêt).

Parcours élève (second compte, **sans abonnement**) :
1. `/rejoindre` → entre le code → la classe apparaît dans `/mes-cours`.
2. Le texte distribué est listé avec le personnage ; « Répéter » ouvre `/learn/...` directement
   sur le bon personnage.
3. Ouvre la scène : le panneau « Notes du professeur » s'affiche.
4. Vérifie l'accès aux pages protégées (pas de redirection vers `/onboarding`).
5. Côté coulisses : l'élève voit les éléments du spectacle, les siens en surbrillance.

Régression (5 min) :
- Landing déconnecté : hero sombre, tracking des vues/clics toujours dans `/admin`.
- Login magic link, import classique, session d'apprentissage, paiement Stripe test.

---

## 3. Nouvelles routes

### Pages
| Route | Description |
|---|---|
| `/professeur` | dashboard des classes du professeur |
| `/professeur/classes/[id]` | détail classe (élèves, textes, distribution, spectacle) |
| `/professeur/classes/[id]/textes/[sceneId]` | éditeur d'annotations ligne à ligne |
| `/mes-cours` | espace élève |
| `/rejoindre` (`?code=XXXX`) | rejoindre une classe |

### API (toutes derrière `requireAuth` : CSRF + session + rate-limit ; l'écriture est en plus protégée par RLS)
| Route | Méthodes |
|---|---|
| `/api/teacher/classes` | POST (création, passe le profil en `teacher`) |
| `/api/teacher/classes/[id]` | PATCH, DELETE |
| `/api/teacher/classes/[id]/members` | POST, DELETE (gère la liaison de compte + les accès) |
| `/api/teacher/classes/[id]/scenes` | POST, DELETE |
| `/api/teacher/classes/[id]/assignments` | POST (upsert + accès élève), DELETE (retire l'accès si plus justifié) |
| `/api/teacher/annotations` | POST, PATCH, DELETE |
| `/api/teacher/show-notes` | POST, PATCH, DELETE |
| `/api/class/join` | POST (code d'invitation, matérialise les accès) |
| `/api/profile/role` | POST (choix comédien/professeur à l'onboarding) |

---

## 4. Rollback

Le déploiement précédent peut être restauré depuis Vercel (Instant Rollback) sans toucher à la
base : les tables sont additives et inoffensives pour l'ancien code.

Si tu veux aussi nettoyer la base :
```sql
drop table if exists public.class_show_notes;
drop table if exists public.class_annotations;
drop table if exists public.class_assignments;
drop table if exists public.class_scenes;
drop table if exists public.class_members;
drop table if exists public.teacher_classes;
drop function if exists public.is_class_teacher(uuid, uuid);
drop function if exists public.is_class_member(uuid, uuid);
drop function if exists public.has_class_membership(uuid);
alter table public.user_profiles drop column if exists role;
-- Optionnel : retirer les accès créés par la distribution
-- delete from public.user_work_access where access_type = 'private'; -- ⚠️ supprime AUSSI les partages manuels
```

---

## 5. Limites connues & suites possibles

- **Pas d'email d'invitation automatique** : le professeur partage le code lui-même.
  Suite logique : un template Resend « Ton professeur t'invite » dans `src/lib/resend/templates.ts`,
  envoyé depuis `POST /api/teacher/classes/[id]/members`.
- **Pas de plan Stripe « professeur » dédié** : un prof paie le même abonnement qu'un comédien.
  Si tu veux un prix spécifique, crée un Price dans Stripe + une variable
  `STRIPE_SUBSCRIPTION_PRICE_ID_TEACHER` et ajoute la carte dans `pricing-section.tsx`.
- **Le suivi de progression des élèves n'est pas exposé au professeur** (les stats restent
  personnelles). Suite possible : un onglet « Progression » alimenté par `user_line_feedback`
  agrégé via le service role, avec consentement des élèves.
- **Les annotations ne s'affichent pas (encore) dans le mode apprentissage `/learn`** :
  elles sont visibles sur la page scène. (`learn-session.tsx` a des modifications locales en
  cours — non touché volontairement.)
- L'« annotation pour tout le monde » est visible par **toutes les classes** où la scène est
  rattachée (cas multi-classes du même texte).

---

## 6. Fichiers créés / modifiés

### Créés
```
supabase/migrations/add_teacher_spaces.sql
src/types/teacher.ts
src/lib/queries/teacher.ts
src/locales/fr/teacher.ts
src/app/professeur/page.tsx
src/app/professeur/classes/[id]/page.tsx
src/app/professeur/classes/[id]/textes/[sceneId]/page.tsx
src/app/mes-cours/page.tsx
src/app/rejoindre/page.tsx
src/app/api/teacher/** (6 routes)
src/app/api/class/join/route.ts
src/app/api/profile/role/route.ts
src/components/teacher/{create-class-form,class-detail-client,scene-annotations-editor}.tsx
src/components/classes/{join-class-form,teacher-annotations-panel}.tsx
TRANSITION.md
```

### Modifiés
```
supabase/schema.sql                       (section espace professeur ajoutée)
src/app/globals.css                       (tokens + utilitaires + animations)
src/app/layout.tsx                        (polices Fraunces/Karla, footer)
src/components/header.tsx                 (nav selon rôle)
src/app/landing/page.tsx                  (refonte complète)
src/components/landing/{how-it-works,faq-section}.tsx
src/components/pricing/pricing-section.tsx (wrapper allégé)
src/components/onboarding/onboarding-client.tsx (choix de rôle + parcours prof)
src/app/scenes/[id]/page.tsx              (panneau annotations prof)
src/lib/utils/require-subscription.ts     (bypass membres de classe)
src/lib/queries/access.ts                 (idem)
src/locales/fr/{index,common,landing}.ts
```

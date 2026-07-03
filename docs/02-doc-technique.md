# Côté-Cour — Documentation technique

> **Objet** : stack, architecture, dépendances, et surtout **ce qui est fragile ou bricolé** et mériterait un coup de propre avant de mettre l'app entre les mains de testeurs externes.
>
> Public : toi + Claude Chat, pour piloter la mise en marché.
>
> Généré le 2026-06-24.

---

## 1. Stack

| Couche | Techno |
|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** |
| Langage | TypeScript 5 |
| Styles | **Tailwind 4** + design system maison dans `globals.css` |
| Polices | Fraunces (display) + Karla (corps) via `next/font` |
| Backend / DB | **Supabase** (Auth magic-link, Postgres + RLS, Storage) |
| Paiement | **Stripe** (Checkout + webhook + portail) |
| Emails | **Resend** (templates + audience marketing) |
| IA | **OpenAI** `gpt-4o-mini` (parsing de scènes + OCR vision) |
| Extraction PDF | `pdfjs-dist`, `pdf-parse`, `pdf2json`, `canvas` |
| Graphiques | `recharts` |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights` + tracking landing maison |
| Hébergement | **Vercel** (+ crons `vercel.json`) |
| Tests | **Vitest** (logique pure colocalisée `*.test.ts`) |

---

## 2. Architecture

### Pattern de données
```
Server Component (page.tsx)
   └─ appelle les query helpers (src/lib/queries/*)   ← lecture
   └─ passe les données aux Client Components (src/components/<feature>/*)
Mutations  →  routes /api/*  (jamais de server actions)
```

### Trois clients Supabase (`src/lib/`)
- `supabase-browser.ts` — composants client (clé anon).
- `supabase-server.ts` — server components/routes, session cookie ; **dégrade gracieusement en anonyme** si `cookies()` indisponible.
- `supabase-admin.ts` — **service-role, bypass RLS** : réservé webhooks, crons, routes admin, traitement des imports.

### Memoization par requête (important)
`getSupabaseSessionUser`, `isAdmin`, `hasActiveSubscription`, `hasClassMembership` sont enveloppés dans `cache()` de React → layout + pages + guards partagent **un seul `auth.getUser()`** et un seul jeu de requêtes d'entitlement par requête.
⚠️ **Ne pas « déballer » ces fonctions** : les pages les appellent plusieurs fois en supposant qu'elles sont gratuites après le premier appel.

### Guards d'accès (à réutiliser, ne pas réinventer)
- **Pages** : `requireSubscriptionOrRedirect` (`utils/require-subscription.ts`) → admin OU abonné OU classe, sinon `/onboarding`.
- **Routes API** : `requireAuth(request, rateLimit, options)` (`utils/api-auth.ts`) → enchaîne CSRF same-origin → user Supabase → `requireAdmin` optionnel → rate limiting. Renvoie `{ ok, user, supabase }` ou une réponse d'erreur prête.
- **Crons** : `assertCronAuth` (`utils/cron.ts`) → `Authorization: Bearer $CRON_SECRET`.
- **Accès scène/œuvre fin** : `checkAccess` + logique free-slot (`utils/access-control.ts` + `queries/access.ts`).

### Validation d'environnement
`src/lib/env-validation.ts` impose les vars requises (Supabase, Stripe, Resend, `CRON_SECRET` ; + `NEXT_PUBLIC_SITE_URL` en prod). `example.env` documente tout, y compris les réglages avancés d'import.

---

## 3. Base de données & migrations

- **Migrations CLI Supabase** : `supabase/migrations/` (fichiers timestampés, `supabase db push`).
- **`supabase/migrations-legacy/`** : migrations historiques appliquées à la main, **déjà en prod, référence seulement**.
- **`supabase/schema.sql`** : document de référence du schéma de base, **pas une migration exécutable**.
- Règle : tout changement de schéma = **une migration CLI + mise à jour de `schema.sql`**.

> ⚠️ **Point de fragilité** : une seule migration « propre » dans `migrations/` (`add_teacher_spaces`), tout le reste est en legacy hand-applied. La cohérence entre `schema.sql`, le legacy et la prod réelle repose sur la discipline manuelle. Un nouveau dev ne peut pas reconstruire la base depuis zéro de façon fiable avec la CLI seule.

---

## 4. CI / qualité

- `.github/workflows/ci.yml` : **lint + typecheck + tests + build** sur chaque push/PR.
- `npm run lint` doit sortir 0. `no-explicit-any` est en **warning** (dette historique assumée).
- Tests **uniquement sur de la logique pure** : matrice paywall, CSRF, rate-limit, cron-auth, scores, validation d'env. **Aucun test d'intégration / e2e / composant.**

---

## 5. Sécurité — état réel

| Mécanisme | Implémentation | Limite |
|---|---|---|
| Anti-CSRF | `assertSameOrigin` : vérifie Origin/Referer == origin requête | Best-effort. Refuse si ni Origin ni Referer (OK navigateurs). Pas de token CSRF dédié. |
| Rate limiting | `checkRateLimit` **en mémoire** (`globalThis`) | **État perdu entre invocations serverless** → utile contre les bursts mais **pas un vrai contrôle distribué**. À migrer vers Redis/Upstash/DB si charge réelle. |
| RLS | Activée sur les tables sensibles | Le service-role bypass tout → toute route admin/cron/import doit être impeccable. |
| Import storage | Refus des chemins hors `user_id/` | OK. |
| Webhook Stripe | Vérif signature via `STRIPE_WEBHOOK_SECRET` | OK. |

---

## 6. Ce qui est fragile ou « vibe-codé » (à nettoyer avant testeurs externes)

> Classé par priorité décroissante.

### 🔴 Priorité haute

1. **Rate limiting en mémoire** (`utils/rate-limit.ts`).
   Sur Vercel serverless, chaque invocation peut être un process neuf → la protection est quasi inopérante en prod. Risque réel sur les routes coûteuses : **import IA** (coût OpenAI), **création de checkout**, **envoi de magic-link**. → Passer sur Upstash Redis (rate-limit distribué) au moins pour ces 3 routes.

2. **`learn-session.tsx` : ~1300 lignes, un seul composant.**
   Le cœur du produit (modes, limites, startIndex, brouillons, sessions, résumé, clavier, auto-scroll) tient dans un fichier monolithique avec beaucoup d'état entrelacé et plusieurs `useEffect` qui se resynchronisent mutuellement (`limitCount`/`startIndex`/`limitChoice`). C'est la zone la plus à risque de régression. → Extraire des hooks (`useSessionPrefs`, `useDrafts`, `useSessionTracking`) et découper l'UI. À faire **avant** de toucher à la logique d'apprentissage.

3. **65 occurrences de `any`** (hors tests). Concentrées notamment dans le pipeline d'import (`process-import-job.ts` : `supabase: any`, `updateData: any`). On perd la sécurité de typage exactement là où les données sont les plus hétérogènes (jobs, fichiers, sortie IA). → Typer au moins `import_jobs` et le client Supabase.

4. **Sortie IA non garantie** (`text-parser.ts`, `gpt-4o-mini`). Le découpage personnages/répliques dépend d'un LLM ; pas de schéma strict mentionné. Un texte mal structuré peut produire une scène incohérente que l'utilisateur découvre seulement à l'aperçu. → Valider la sortie (zod / structured outputs) + meilleurs messages d'échec.

### 🟠 Priorité moyenne

5. **Migrations hand-applied** (cf. §3) : la base n'est pas reconstructible proprement depuis la CLI. Risque pour onboarder un dev ou reproduire un env de test. → Consolider un baseline migration unique.

6. **Aucun test au-delà de la logique pure.** Les parcours critiques (paiement, import, apprentissage, RLS prof/élève) n'ont aucune couverture automatisée. → Au minimum quelques tests e2e Playwright sur : magic-link → paywall → learn → score ; et import → preview → commit.

7. **Préférences & brouillons en `localStorage`** (apprentissage). Pas de synchro multi-appareils ; un changement de format casse silencieusement (try/catch qui ignore). Acceptable, mais à documenter.

8. **Onboarding best-effort** : le rôle est enregistré en « fire-and-forget » (`catch {}`). Si l'appel échoue, l'UI continue mais le profil DB peut diverger de ce que l'utilisateur a choisi. → Au moins logger/retry.

9. **`landing` vs `home` vs `/`** : redirections en cascade côté serveur. À vérifier qu'il n'y a pas de boucle ou de flash sur edge cases (utilisateur connecté sans entitlement qui atterrit sur `/` → `/home` → `/onboarding`).

### 🟡 Cosmétique / dette douce

10. **Couleurs hex en dur** dans les composants (`#3b1f4a`, `#ff6b6b`, `#f4c95d`…) au lieu des tokens du design system, malgré la consigne CLAUDE.md d'utiliser `.btn-*`, `.card`, etc. → Centraliser pour faciliter un futur reskin/marque blanche.
11. **Commentaires/UI mêlant français et quelques chaînes en dur** non passées par `locales/fr` (ex. « Configure ta session d'entraînement », « Feedback enregistré pour cette réplique » directement dans `learn-session.tsx`). → Tout centraliser dans `locales/` pour cohérence + futur multilingue.
12. **`scenes` / `bibliotheque`** : logique de redirection légèrement dupliquée et conditions `user ?` redondantes (la page redirige déjà si `!user`).

---

## 7. Dépendances notables & risques

- **Next 16 + React 19** : versions très récentes. Bien pour la durée de vie, mais écosystème (libs tierces, exemples) parfois en retard. Surveiller les breaking changes.
- **`canvas` (3.x)** : dépendance native (compilation) utilisée pour le rendu PDF→image (OCR). **Point de friction de build** classique sur certains environnements/CI. À surveiller sur Vercel.
- **`pdfjs-dist` + `pdf-parse` + `pdf2json`** : trois libs PDF en parallèle → redondance possible, surface de bug et poids bundle. Vérifier lesquelles sont réellement utilisées.
- **OpenAI** : coût variable lié aux imports. Sans rate-limit fiable (cf. §6.1), un abus peut coûter cher.

---

## 8. Variables d'environnement (rappel)

Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) · `NEXT_PUBLIC_SITE_URL` · `ADMIN_EMAILS` · Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, 3 price IDs) · Resend (`RESEND_API_KEY`, `RESEND_FROM[_*]`, `RESEND_REPLY_TO`, `RESEND_AUDIENCE_ID`) · `CRON_SECRET` · `OPENAI_API_KEY` · réglages import (`REQUIRE_AI_CONSENT`, `IMPORT_SOFT_TIMEOUT_MS`, `OPENAI_PDF_OCR_TIMEOUT_MS`, `PDF_OCR_SCALE`, `DEBUG_IMPORTS`).

---

## 9. Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Dev (localhost:3000) |
| `npm run build` | Build prod |
| `npm run lint` | ESLint (doit sortir 0) |
| `npm test` | Vitest (1 run) |
| `npm run test:watch` | Vitest watch |
| `npx vitest run src/lib/utils/csrf.test.ts` | Un seul fichier de test |

---

## 10. Verdict « prêt pour testeurs externes ? »

**Quasi, mais 3 choses à sécuriser d'abord :**
1. Rate-limit distribué sur import IA + checkout + magic-link (sinon risque coût/abus).
2. Robustesse du pipeline d'import (validation sortie IA + messages d'erreur clairs) — c'est la feature la plus « magique » donc la plus décevante si elle rate silencieusement.
3. Un filet de tests e2e sur les 2 parcours critiques (apprentissage, import).

Le reste (refacto `learn-session`, `any`, tokens couleur) peut attendre, mais à traiter avant d'industrialiser.

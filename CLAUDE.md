# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Despite the repo name "shipfast", this is **Côté-Cour** — a French web app for actors to learn theater lines (mask/reveal lines, self-score 0–10, track mastery). Next.js 16 App Router + React 19 + Tailwind 4, Supabase (auth + Postgres + storage), Stripe subscriptions, Resend emails, OpenAI for scene imports. Deployed on Vercel.

All user-facing copy is in **French**, centralized in `src/locales/fr/` (imported as the `t` object from `src/locales/fr/index.ts`). Code comments are also mostly French — follow that convention. URLs use French slugs (`/compte`, `/bibliotheque`, `/ressources`, `/confidentialite`).

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint

There is no test suite. Copy `example.env` to `.env.local` for local config; `src/lib/env-validation.ts` enforces required vars (Supabase, Stripe, Resend, `CRON_SECRET`; plus `NEXT_PUBLIC_SITE_URL` in production).

## Database

No Supabase CLI workflow: `supabase/schema.sql` is the base schema and `supabase/migrations/*.sql` are mostly-unnumbered incremental migrations, both applied manually in the Supabase SQL Editor. When changing the schema, add a new migration file AND keep `schema.sql` in sync.

Domain model: `works` → `scenes` → `characters` → `lines` (ordered by `"order"`, unique per scene). Per-user data: `user_line_feedback` (score 0–10), `user_learning_sessions`, notes, highlights, `user_work_access`, `import_jobs`, profiles for email automation. RLS: public read on works/scenes/characters/lines, per-user rows restricted to the owner. Users can fork scenes into private copies (`is_private`, `owner_user_id`, `source_scene_id`).

## Auth and access control

Three Supabase clients in `src/lib/`:
- `supabase-browser.ts` — client components (anon key)
- `supabase-server.ts` — server components/routes, cookie-based session (gracefully degrades to anonymous when `cookies()` is unavailable)
- `supabase-admin.ts` — service role, bypasses RLS; only for webhooks, crons, admin routes, and import processing

Login is magic-link only (`/login`, callback at `/auth/callback`). Admins are identified by email via the `ADMIN_EMAILS` env var (`src/lib/utils/admin.ts`).

The paywall model is: **admin, active Stripe subscription, or class membership** (students are covered by their teacher's subscription; see `has_class_membership` SQL helper); otherwise redirect to `/onboarding`. Use the existing guards rather than rolling your own:
- Pages: `requireSubscriptionOrRedirect` (`src/lib/utils/require-subscription.ts`)
- API routes: `requireAuth(request, rateLimitConfig, options)` (`src/lib/utils/api-auth.ts`) — chains same-origin CSRF check → Supabase user → optional `requireAdmin` → rate limiting. Returns `{ ok, user, supabase }` or a ready-made error response.
- Cron routes: `assertCronAuth` (`src/lib/utils/cron.ts`) — `Authorization: Bearer $CRON_SECRET`
- Fine-grained scene/work access: `checkAccess` / free-slot logic in `src/lib/utils/access-control.ts` + `src/lib/queries/access.ts`

## Key flows

**Payments** (`src/app/api/payments/`): checkout via `create-checkout` with one of three price IDs (`STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY/QUARTERLY/YEARLY`); the webhook at `/api/payments/webhook` handles `checkout.session.completed`; `/api/payments/webhook/test` reports config status. Billing portal at `/api/billing/portal`.

**Scene imports** (async pipeline): user uploads PDF/text → file goes to Supabase storage + a row in `import_jobs` → `src/lib/imports/process-import-job.ts` runs stages (validating → downloading → extracting → parsing → finalizing) with progress written back to the job row → text extraction (`src/lib/utils/text-extraction.ts`, pdfjs/pdf-parse with optional OpenAI OCR) → AI parsing into characters/lines (`src/lib/utils/text-parser.ts`, requires `consent_to_ai`) → user previews at `/imports/[jobId]/preview` and commits via `/api/scenes/import/commit`. Jobs are processed by the cron `/api/cron/imports/process`.

**Emails**: Resend client/templates/automation in `src/lib/resend/`. Cron-driven automation for inactivity and unpaid users (`/api/cron/emails/*`). Cron schedules live in `vercel.json`.

**Data fetching pattern**: server components call query helpers in `src/lib/queries/` (scenes, stats, works, access, notes) and pass data to client components in `src/components/<feature>/`. Mutations go through `/api` routes, not server actions.

**Teacher spaces**: `user_profiles.role` is `student`/`teacher`. Teachers manage classes at `/professeur` (members, attached scenes, role casting, line annotations, show-prep notes); students join via invite code at `/rejoindre` and see everything at `/mes-cours`. Tables `teacher_classes`, `class_members`, `class_scenes`, `class_assignments`, `class_annotations`, `class_show_notes` — RLS gives teachers write and class members read (via `is_class_teacher`/`is_class_member` security-definer helpers). Assigning a scene to a student creates a `user_work_access` row (`access_type='private'`) so existing scene RLS grants read; the assignment/member/scene DELETE routes clean those rows up. Types in `src/types/teacher.ts`, queries in `src/lib/queries/teacher.ts`, strings in `src/locales/fr/teacher.ts`.

**Design system**: tokens and shared component classes live in `src/app/globals.css` (`.btn-primary`, `.btn-secondary`, `.btn-gold`, `.card`, `.chip`, `.input`, `.label`, `.stage-dark` dark hero sections, `.reveal`/`.spotlight` animations). Fonts: Fraunces (display) + Karla (body) via `next/font` in `layout.tsx`. Prefer these utilities over repeating raw hex Tailwind classes.

**Admin dashboard** at `/admin` (users, activity charts, billing summary, landing analytics) backed by `/api/admin/dashboard/*` routes using the service-role client.

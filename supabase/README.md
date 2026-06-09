# Base de données — workflow de migrations

## Organisation

```
supabase/
├── schema.sql              # Référence du schéma de base (documentation, pas un fichier à exécuter)
├── migrations/             # Migrations gérées par le CLI Supabase (horodatées, NON appliquées en prod)
├── migrations-legacy/      # Migrations historiques DÉJÀ appliquées en prod à la main (référence seulement)
└── seed/                   # Données de démo
```

Historiquement, les migrations étaient appliquées à la main dans le SQL Editor, sans
numérotation ni suivi. Elles sont conservées dans `migrations-legacy/` comme trace, dans
cet ordre chronologique (déduit de l'historique git) :

1. `schema.sql` (base) → `add_works` → `add_library_features` → `setup_scene_imports_storage`
   → `setup_scene_imports_storage_policies` → `allow_users_insert_private_scenes`
   → `update_score_range_to_10` → `add_import_jobs` → `add_scene_source_id`
   → `add_user_line_notes` → `add_user_line_highlights` → `add_billing`
   → `add_import_jobs_consent_to_ai` → `add_user_work_access_unique_user_scene`
   → `add_user_profiles_and_email_automation` → `add_import_jobs_observability`
   → `add_import_jobs_progress` → `20260228194500_fix_function_search_path`
   → `add_scene_sharing` → `add_landing_page_views` → `add_landing_cta_clicks`

**À partir de maintenant, toute nouvelle migration passe par le CLI** et vit dans
`migrations/` au format `YYYYMMDDHHMMSS_nom.sql`.

## Mise en place (une fois)

```bash
# 1. Installer le CLI
brew install supabase/tap/supabase

# 2. Se connecter et lier le projet (le ref est dans l'URL du dashboard)
supabase login
supabase link --project-ref <project-ref>

# 3. Appliquer les migrations en attente (actuellement : l'espace professeur)
supabase db push
```

`supabase db push` tient un registre des migrations appliquées dans la table
`supabase_migrations.schema_migrations` du projet : plus jamais de « est-ce que j'ai déjà
passé ce fichier ? ».

⚠️ Si tu as déjà appliqué `add_teacher_spaces.sql` à la main dans le SQL Editor avant
d'adopter le CLI, marque-la comme appliquée au lieu de la rejouer :

```bash
supabase migration repair --status applied 20260609120000
```

(La migration est idempotente — la rejouer ne casserait rien — mais autant garder un
registre propre.)

## Au quotidien

```bash
# Créer une migration
supabase migration new ma_nouvelle_migration
# → édite supabase/migrations/<timestamp>_ma_nouvelle_migration.sql

# L'appliquer en prod
supabase db push

# Voir l'état
supabase migration list
```

Conventions à garder :
- SQL idempotent autant que possible (`if not exists`, `drop policy if exists` + `create`).
- RLS systématique sur toute nouvelle table + policies dans la même migration.
- Mettre à jour `schema.sql` (référence) quand une table est ajoutée.

## Aller plus loin : base locale reproductible

Pour pouvoir lancer une base locale identique à la prod (`supabase db reset`,
indispensable pour de futurs tests d'intégration), génère une baseline depuis la prod :

```bash
supabase db pull   # crée supabase/migrations/<timestamp>_remote_schema.sql depuis la prod
```

Le fichier généré capture tout le schéma existant (y compris les migrations legacy) et
devient le point de départ : `supabase start` + `supabase db reset` rejouent ensuite
baseline + migrations suivantes sur un Postgres local Docker.

## Types TypeScript générés (recommandé)

```bash
supabase gen types typescript --linked > src/types/database.ts
```

Puis typer les clients : `createClient<Database>(...)` dans `src/lib/supabase-*.ts`.
Les requêtes supabase-js deviennent typées de bout en bout et la plupart des casts
`as unknown as Row[]` du dossier `queries/` peuvent disparaître.

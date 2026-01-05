# Migration : Mise à jour de la contrainte de score

## Problème
La contrainte de base de données limite les scores à 0-3, alors que le système utilise maintenant 0-10.

## Solution
Exécutez cette requête SQL dans votre base Supabase :

### Via l'interface Supabase (recommandé)
1. Allez dans votre projet Supabase
2. Ouvrez le **SQL Editor**
3. Collez et exécutez cette requête :

```sql
-- Supprimer l'ancienne contrainte
alter table public.user_line_feedback 
drop constraint if exists user_line_feedback_score_check;

-- Ajouter la nouvelle contrainte pour accepter les scores de 0 à 10
alter table public.user_line_feedback 
add constraint user_line_feedback_score_check 
check (score between 0 and 10);
```

### Via la CLI Supabase (si installée)
```bash
supabase db push
```

Ou si vous êtes connecté à votre projet distant :
```bash
supabase migration up
```

## Vérification
Après avoir appliqué la migration, vous devriez pouvoir enregistrer des scores de 0, 3, 7 et 10 sans erreur.


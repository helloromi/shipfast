# 🔴 Critiques Pré-Lancement - Problèmes Critiques à Corriger

## ⚠️ SÉCURITÉ - CRITIQUE

### 1. **CRON_SECRET exposé dans example.env**
**Problème** : Le fichier `example.env` contient une valeur par défaut pour `CRON_SECRET` qui est commitée dans le repo.
```env
CRON_SECRET=30f0beeed745ae3c40d4aefd0a6737e576d9a7306e54a5b51f93a48f221bac8e
```
**Risque** : Si quelqu'un utilise cette valeur par défaut en production, les endpoints cron sont vulnérables.
**Solution** : 
- Supprimer la valeur par défaut de `example.env`
- Ajouter un commentaire indiquant de générer un secret aléatoire
- Vérifier que personne n'utilise cette valeur en production

### 2. **Route de test webhook accessible publiquement**
**Problème** : `/api/payments/webhook/test` est accessible sans authentification et expose des informations de configuration.
**Risque** : Fuite d'informations sur la configuration Stripe, URL du webhook, etc.
**Solution** :
- Ajouter une vérification d'authentification admin
- Ou désactiver cette route en production (`NODE_ENV === 'production'`)
- Ou la protéger avec un secret

### 3. **Rate limiting en mémoire (inefficace en serverless)**
**Problème** : Le rate limiting utilise un Map en mémoire (`src/lib/utils/rate-limit.ts`), ce qui ne fonctionne pas correctement en environnement serverless (Vercel).
**Risque** : Le rate limiting ne protège pas réellement contre les abus en production.
**Solution** :
- Utiliser un service externe (Upstash Redis, Vercel KV)
- Ou implémenter un rate limiting basé sur la base de données
- Au minimum, documenter cette limitation

### 4. **Console.log en production**
**Problème** : Nombreux `console.log`, `console.error`, `console.warn` dans le code qui peuvent exposer des informations sensibles.
**Risque** : Fuite d'informations dans les logs de production.
**Solution** :
- Utiliser un système de logging structuré (ex: Sentry, LogRocket)
- Supprimer ou conditionner les logs de debug avec `process.env.NODE_ENV !== 'production'`
- Ne jamais logger des données sensibles (tokens, emails, etc.)

## ⚙️ CONFIGURATION - IMPORTANT

### 5. **Validation des variables d'environnement au démarrage**
**Problème** : Pas de validation centralisée des variables d'environnement requises au démarrage de l'application.
**Risque** : L'application peut démarrer avec des configurations incomplètes, causant des erreurs en production.
**Solution** :
- Créer un fichier `src/lib/env-validation.ts` qui valide toutes les variables requises
- Appeler cette validation au démarrage (dans `next.config.ts` ou un middleware)
- Faire échouer le build/démarrage si des variables critiques manquent

### 6. **NEXT_PUBLIC_SITE_URL peut être manquant**
**Problème** : `getSiteUrl()` a un fallback vers `window.location.origin` qui peut causer des problèmes en production (notamment pour les magic links).
**Risque** : Les redirections après authentification peuvent échouer.
**Solution** :
- Rendre `NEXT_PUBLIC_SITE_URL` obligatoire en production
- Valider cette variable au démarrage
- Faire échouer le build si elle manque en production

### 7. **Pas de validation des Price IDs Stripe**
**Problème** : Les Price IDs Stripe sont utilisés sans validation de format.
**Risque** : Si un Price ID invalide est configuré, les paiements échoueront silencieusement.
**Solution** :
- Valider le format des Price IDs (commencent par `price_`)
- Valider au démarrage que les Price IDs existent dans Stripe (optionnel mais recommandé)

## 🛡️ GESTION D'ERREURS - IMPORTANT

### 8. **Messages d'erreur génériques exposent trop d'infos**
**Problème** : Certaines routes retournent des messages d'erreur détaillés qui peuvent exposer la structure interne.
**Risque** : Aide les attaquants à comprendre l'architecture.
**Solution** :
- Standardiser les messages d'erreur côté client (messages génériques)
- Logger les détails côté serveur uniquement
- Ne jamais exposer les stack traces en production

### 9. **Pas de système de logging structuré**
**Problème** : Utilisation de `console.error` partout sans contexte structuré.
**Risque** : Difficile de déboguer les problèmes en production, pas de corrélation entre les logs.
**Solution** :
- Implémenter un système de logging structuré (JSON logs)
- Ajouter des IDs de corrélation pour tracer les requêtes
- Intégrer avec un service de monitoring (Sentry, Datadog, etc.)

## 🔐 AUTHENTIFICATION & AUTORISATION - À VÉRIFIER

### 10. **Vérification admin basée uniquement sur email**
**Problème** : `isAdmin()` vérifie uniquement si l'email est dans `ADMIN_EMAILS`, sans vérification supplémentaire.
**Risque** : Si un email est compromis, l'accès admin est compromis.
**Solution** :
- Ajouter une vérification 2FA pour les admins (optionnel mais recommandé)
- Implémenter un système de rôles plus robuste dans Supabase
- Logger toutes les actions admin

### 11. **CSRF protection basique**
**Problème** : La protection CSRF (`assertSameOrigin`) vérifie uniquement Origin/Referer, ce qui peut être contourné.
**Risque** : Vulnérable aux attaques CSRF sophistiquées.
**Solution** :
- Implémenter des tokens CSRF pour les actions critiques
- Utiliser SameSite cookies strictes
- Ajouter des headers de sécurité (CSP, etc.)

## 💳 STRIPE & PAIEMENTS - À VÉRIFIER

### 12. **Webhook peut échouer silencieusement**
**Problème** : Si le webhook Stripe échoue, il y a un fallback dans `/api/payments/success`, mais pas de monitoring.
**Risque** : Des paiements peuvent être acceptés sans que l'abonnement soit activé.
**Solution** :
- Ajouter un monitoring des webhooks (alerte si échec)
- Implémenter un système de retry pour les webhooks échoués
- Logger tous les événements Stripe pour audit

### 13. **Pas de vérification d'idempotence pour les webhooks**
**Problème** : Les webhooks Stripe peuvent être rejoués, mais il n'y a pas de vérification d'idempotence explicite.
**Risque** : Double traitement des événements (double facturation, double activation).
**Solution** :
- Stocker les IDs d'événements Stripe traités
- Vérifier avant de traiter un événement s'il a déjà été traité
- Utiliser les transactions pour garantir l'atomicité

## 📊 PERFORMANCE & SCALABILITÉ - MOYEN

### 14. **Rate limiting en mémoire**
**Problème** : Déjà mentionné (#3), mais impacte aussi la performance.
**Solution** : Voir #3

### 15. **Pas de cache visible**
**Problème** : Pas de stratégie de cache visible pour les données fréquemment accédées.
**Risque** : Performance dégradée sous charge.
**Solution** :
- Implémenter un cache pour les scènes publiques
- Utiliser Next.js cache pour les pages statiques
- Considérer un CDN pour les assets

## 🔒 CONFORMITÉ RGPD - À VÉRIFIER

### 16. **Pas de politique de confidentialité visible**
**Problème** : Le consentement IA est géré, mais pas de page de politique de confidentialité visible.
**Risque** : Non-conformité RGPD.
**Solution** :
- Créer une page `/privacy` ou `/confidentialite`
- Créer une page `/terms` ou `/cgu`
- Ajouter des liens vers ces pages dans le footer
- Documenter le traitement des données (OpenAI, Stripe, etc.)

### 17. **Gestion des données personnelles**
**Problème** : Pas de fonctionnalité visible pour que les utilisateurs exportent/suppriment leurs données.
**Risque** : Non-conformité RGPD (droit à l'effacement, droit à la portabilité).
**Solution** :
- Implémenter une route `/api/account/export` pour exporter les données
- Améliorer `/api/account/delete` pour supprimer toutes les données
- Documenter ces fonctionnalités dans l'interface utilisateur

## 🧪 TESTS & QUALITÉ - MOYEN

### 18. **Pas de tests visibles**
**Problème** : Aucun test unitaire ou d'intégration visible dans le projet.
**Risque** : Régression lors des modifications futures.
**Solution** :
- Ajouter des tests pour les routes critiques (paiements, authentification)
- Tests d'intégration pour les flux principaux
- Tests E2E pour les parcours utilisateur critiques

## 📝 DOCUMENTATION - MOYEN

### 19. **Documentation de déploiement incomplète**
**Problème** : Le README ne couvre pas tous les aspects du déploiement.
**Risque** : Erreurs de configuration en production.
**Solution** :
- Documenter le processus de déploiement complet
- Checklist de pré-lancement
- Procédures de rollback
- Monitoring et alertes

## ✅ CHECKLIST PRÉ-LANCEMENT

### Sécurité
- [ ] Supprimer CRON_SECRET de example.env
- [ ] Protéger/désactiver `/api/payments/webhook/test` en production
- [ ] Remplacer le rate limiting en mémoire par une solution distribuée
- [ ] Supprimer/conditionner tous les console.log en production
- [ ] Ajouter des headers de sécurité (CSP, HSTS, etc.)

### Configuration
- [ ] Valider toutes les variables d'environnement au démarrage
- [ ] Rendre NEXT_PUBLIC_SITE_URL obligatoire en production
- [ ] Valider les Price IDs Stripe

### Monitoring
- [ ] Configurer un service de logging (Sentry, LogRocket, etc.)
- [ ] Configurer des alertes pour les erreurs critiques
- [ ] Monitorer les webhooks Stripe
- [ ] Configurer des alertes pour les paiements échoués

### Conformité
- [ ] Créer une page de politique de confidentialité
- [ ] Créer une page de CGU
- [ ] Implémenter l'export des données utilisateur
- [ ] Tester la suppression complète des données utilisateur

### Tests
- [ ] Tests pour les routes de paiement
- [ ] Tests pour l'authentification
- [ ] Tests E2E pour les flux principaux

### Documentation
- [ ] Checklist de déploiement complète
- [ ] Procédures de rollback
- [ ] Runbook pour les incidents courants

---

## 🎯 PRIORISATION

### 🔴 CRITIQUE (À corriger avant le lancement)
1. CRON_SECRET exposé (#1)
2. Route de test webhook publique (#2)
3. Validation des variables d'environnement (#5)
4. NEXT_PUBLIC_SITE_URL obligatoire (#6)
5. Politique de confidentialité (#16)

### 🟡 IMPORTANT (À corriger rapidement après le lancement)
6. Rate limiting distribué (#3)
7. Système de logging structuré (#9)
8. Monitoring des webhooks (#12)
9. Export/suppression des données (#17)

### 🟢 MOYEN (Améliorations continues)
10. Tests (#18)
11. Cache (#15)
12. Documentation (#19)

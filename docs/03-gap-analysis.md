# Côté-Cour — Gap analysis : « un acteur amateur peut-il l'utiliser seul, sans toi à côté ? »

> **Objet** : identifier ce qui manque pour qu'un comédien amateur découvre l'app, comprenne quoi faire, et réussisse seul son premier apprentissage — sans accompagnement. Focus : **onboarding, gestion d'erreurs, états vides à la première ouverture**.
>
> Public : toi + Claude Chat (commercialisation).
>
> Généré le 2026-06-24. Basé sur l'état réel du code.

---

## Méthode

J'ai suivi mentalement le parcours d'un nouvel utilisateur :
`/landing` → inscription magic-link → onboarding → paywall → première scène → premier apprentissage → suivi.
Et j'ai noté à chaque étape où il peut **se bloquer**, **ne pas savoir quoi faire**, ou **tomber sur du vide**.

Légende sévérité : 🔴 bloquant · 🟠 friction forte · 🟡 confort.

---

## 1. Le « trou » majeur : aucun contenu au démarrage

C'est **le** problème numéro un pour l'autonomie.

Le modèle de contenu repose sur :
- des **œuvres publiques** (`works`, lecture publique) — mais **rien n'indique dans le code qu'un catalogue de scènes publiques est seedé**. Si la table `works` est vide, `/scenes` et `/bibliotheque` sont des coquilles.
- l'**import** par l'utilisateur (photo/PDF).

Conséquence : un acteur amateur qui paie, arrive sur `/home`, voit l'état vide « va dans la bibliothèque pour démarrer »… et **trouve une bibliothèque potentiellement vide**. Il n'a alors **qu'une seule porte** : importer son propre texte (étape technique : avoir un PDF/photo propre).

| Gap | Sévérité | Reco |
|---|---|---|
| Pas de catalogue de scènes publiques prêtes à l'emploi garanti | 🔴 | Seeder **5-10 scènes du domaine public** (Molière, Marivaux, Musset…) découpées proprement. C'est le « contenu d'amorçage » indispensable pour qu'on puisse apprendre **sans rien importer**. |
| `/home` vide pointe vers une bibliothèque potentiellement vide | 🔴 | Tant qu'il n'y a pas de catalogue : faire pointer l'état vide vers **l'import**, avec un exemple téléchargeable. |
| Pas de scène de démo « bac à sable » | 🟠 | Pré-charger une scène de démo pour chaque nouveau compte → premier « learn » garanti en 1 clic. |

---

## 2. Onboarding → vide d'action

L'onboarding (`/onboarding`) est **pédagogique mais ne fait rien démarrer**.

- Il explique (3 étapes), puis pousse vers `/subscribe`.
- La démo de l'étape 1 est jouable **mais factice** (Marie/Paul codés en dur) — l'utilisateur joue une fausse scène, pas la sienne.
- Après paiement, **il n'est pas ramené dans un parcours guidé** : il atterrit sur `/home` et doit deviner la suite.

| Gap | Sévérité | Reco |
|---|---|---|
| Rupture entre fin d'onboarding et première vraie action | 🔴 | Après l'abonnement, rediriger vers un **« premier pas » concret** : soit la scène de démo en mode learn, soit l'écran d'import avec exemple. |
| La démo n'enchaîne pas sur du réel | 🟠 | À la fin de la démo interactive, proposer « Maintenant, fais-le avec ton texte → Importer » ou « → Choisir une scène ». |
| Pas de barre de progression/checklist de mise en route | 🟡 | Checklist « Pour bien démarrer » sur `/home` (1. choisir/importer une scène, 2. première séance, 3. voir tes stats). |

---

## 3. Gestion d'erreurs — points aveugles

L'app a de bons garde-fous serveur (CSRF, auth, RLS) mais **côté utilisateur, plusieurs échecs sont silencieux ou opaques**.

### Import (le plus critique pour la confiance)
- **Bonne nouvelle** : l'import est traité **immédiatement à l'upload** (via `after()` / `waitUntil` de Vercel), pas le lendemain. Le cron quotidien n'est qu'un filet de rattrapage. Le délai n'est donc **pas** un bloquant.
- **Le vrai risque** : le traitement background dépend de la survie de la fonction serverless après réponse. Si elle est tuée (timeout, erreur), le job peut rester « pending/processing » jusqu'au **prochain passage du cron (24h)** — sans signal clair à l'utilisateur entre-temps.
- Le parsing IA (`gpt-4o-mini`) peut produire un résultat incohérent ; l'utilisateur ne le découvre qu'à l'aperçu, sans toujours comprendre pourquoi.

| Gap | Sévérité | Reco |
|---|---|---|
| Job bloqué = rattrapé seulement par le cron quotidien | 🟠 | Réduire la fréquence du cron de rattrapage (ex. toutes les heures) ou ajouter un re-déclenchement quand l'utilisateur ouvre `/imports` et voit un job coincé. Afficher clairement « traitement plus long que prévu ». |
| Échec d'import peu explicite | 🟠 | Messages clairs par cause (PDF illisible, scan trop flou, pas de dialogue détecté) + bouton « réessayer » (existe : `/retry`) bien visible + conseil (« reprends la photo en pleine lumière »). |
| Sortie IA incohérente acceptée telle quelle | 🟠 | À l'aperçu : permettre une **édition facile** (renommer perso, fusionner/scinder répliques) avant commit. L'éditeur existe (`scene-editor`) — vérifier qu'il est accessible depuis l'aperçu. |

### Apprentissage
- La sauvegarde de score passe par le **client Supabase navigateur** ; en cas d'erreur réseau, un toast d'erreur s'affiche **mais le score est perdu** (pas de retry/queue).
- Fin de session (`/api/sessions/end`) en fire-and-forget : si ça rate, la séance n'est pas enregistrée et les stats sont fausses, sans que l'utilisateur le sache.

| Gap | Sévérité | Reco |
|---|---|---|
| Score perdu si l'insert échoue | 🟠 | File de retry locale + indicateur « non synchronisé ». |
| Fin de séance silencieusement perdue | 🟡 | Retry best-effort + log ; au minimum ne pas fausser les stats affichées. |

### Auth
- Magic-link : si l'email n'arrive pas (spam, faute de frappe), **pas de parcours de secours évident** décrit dans le code.

| Gap | Sévérité | Reco |
|---|---|---|
| Pas de « renvoyer le lien » / aide si l'email n'arrive pas | 🟠 | Sur `/login` après envoi : compte à rebours + « renvoyer », rappel « vérifie tes spams », support visible. |

---

## 4. États vides (first-run) — inventaire

| Écran | État vide géré ? | Manque |
|---|---|---|
| `/home` | ✅ message + lien bibliothèque | Le lien mène à un endroit possiblement vide (cf. §1). Pas de CTA import en alternative. |
| `/bibliotheque` | ✅ | État vide « Importez votre première scène » + bouton import présent. Bon. (Distingue aussi « aucun résultat de recherche ».) |
| `/scenes` (catalogue) | À vérifier | Si `works` vide → page morte. Besoin d'un fallback. |
| Stats (`/home`, scène) | Partiel | Première séance : graphiques vides. Prévoir un message « tes stats apparaîtront après ta première séance ». |
| `/imports` | À vérifier | État « aucun import » + bouton importer. |
| `/mes-cours` (élève) | À vérifier | « Aucune scène assignée pour l'instant — demande à ton prof. » |
| `/professeur` | À vérifier | « Crée ta première classe » (le formulaire existe). |

> ⚠️ Action : auditer visuellement chaque écran avec un **compte neuf et une base vide**. Le code montre que seul `/home` a un état vide explicite ; les autres sont à confirmer.

---

## 5. Compréhension / guidage en cours d'usage

L'app est riche (modes flashcard/overview, write/revealOnly, point de départ, indices, mode zen). C'est **beaucoup d'options pour un débutant**.

| Gap | Sévérité | Reco |
|---|---|---|
| Modale de config de session dense dès la 1ʳᵉ fois | 🟠 | Pour la 1ʳᵉ session : pré-régler intelligemment (déjà partiel) et masquer encore plus les options avancées ; un « mode simple » par défaut. |
| Concept « note-toi 0-10 » pas évident | 🟡 | Micro-explication à la 1ʳᵉ notation (« sois honnête, c'est pour suivre ta progression »). La démo onboarding aide déjà. |
| Pas d'aide contextuelle / FAQ in-app | 🟡 | Petit « ? » ou page d'aide accessible depuis le header. FAQ existe sur la landing mais pas forcément en-app. |
| Mode zen masque les compteurs par défaut | 🟡 | OK, mais s'assurer que « combien il me reste » reste perceptible. |

---

## 6. Confiance & rétention (autonomie sur la durée)

| Gap | Sévérité | Reco |
|---|---|---|
| Emails de relance existent (inactivité, impayé) mais **crons quotidiens** | 🟡 | OK pour relance ; vérifier que l'email de bienvenue + « import prêt » partent vite (pas dépendants du cron lent). `importReady` semble envoyé dans le pipeline — bon. |
| Pas de rappel « reviens t'entraîner » avant la relance inactivité | 🟡 | Notifications/email de streak ou rappel J+2. |
| Garantie 14 jours annoncée à l'onboarding | ✅ | Vérifier qu'elle est **réellement applicable** (process de remboursement Stripe documenté). |

---

## 7. Accessibilité / device

| Gap | Sévérité | Reco |
|---|---|---|
| Apprentissage très clavier (Entrée/Espace) | 🟡 | Bien sur desktop ; vérifier l'ergonomie **mobile** (l'app a des CTA sticky mobile → bon signe, mais tester le flux learn au doigt). |
| Beaucoup d'acteurs amateurs répètent sur mobile | 🟠 | Tester explicitement tout le parcours import (photo du script depuis le tel) + learn sur petit écran. C'est probablement **le device principal** de la cible. |

---

## 8. Synthèse — top 5 à régler avant des testeurs externes autonomes

1. 🔴 **Contenu d'amorçage** : seeder un catalogue de scènes du domaine public, sinon l'app est vide à l'arrivée (`/scenes` et `/home` pointent vers du vide si `works` n'est pas peuplée).
2. 🔴 **Pont onboarding → première action réelle** : après paiement, amener directement à une scène de démo en mode learn ou à l'import guidé (aujourd'hui : atterrissage sur `/home` sans guidage).
3. 🟠 **Robustesse de l'import** : messages d'erreur explicites par cause + édition facile à l'aperçu + rattrapage plus rapide des jobs bloqués (le traitement immédiat existe déjà ; c'est le cas d'échec qui pèche). C'est la feature « magique », elle doit échouer proprement.
4. 🟠 **Parcours mobile complet** : tester import (photo du script) + learn au doigt — c'est probablement le device principal de la cible.
5. 🟡 **Audit des derniers états vides sur compte neuf** (`/scenes` si catalogue vide, `/imports`, `/mes-cours`) — `/home` et `/bibliotheque` sont déjà couverts.

Une fois ces 5 points traités, un comédien amateur peut réellement : s'inscrire → choisir/importer une scène → apprendre → voir sa progression, **sans toi à côté**.

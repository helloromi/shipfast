# Distribution — premiers utilisateurs payants

Plan opérationnel pour obtenir les premières ventes du pass. Établi le 06/08/2026.
Complète `PROSPECTION.md`, qui reste la référence pour la méthode de contact (cibles, modèles de mail, outil `npm run prospection`) — mais dont l'**objectif** change ici : on ne cherche plus des liens, on cherche des clients.

---

## 1. Le diagnostic

**Le trafic SEO et le produit payant ne s'adressent pas aux mêmes personnes.**

Relevé Search Console du 06/08/2026, 3 mois (04/05 → 03/08) :

| | |
|---|---|
| Impressions | 443 |
| Clics | 9 (CTR 2,0 %) |
| Position moyenne | ~13 |
| Impressions/jour, mi-juillet → 02/08 | 5-8 → **90** |

Les requêtes qui rentrent sont scolaires : *analyse linéaire Horace acte 4 scène 5*, *les fourberies de scapin texte*, *phèdre texte intégral*, *le médecin malgré lui 6ème*, *séquence pédagogique les fourberies de scapin*. Ce sont des collégiens, des lycéens et des profs de français. Ils cherchent un texte **du domaine public**, qu'on leur donne gratuitement — et c'est très bien ainsi (règle produit n°1).

Or le seul produit payant est l'import d'un texte qui n'est **pas** dans le domaine public. Un lycéen qui cherche Scapin n'aura jamais ce besoin. **Le trafic SEO peut être multiplié par vingt sans produire un euro.**

Les acheteurs possibles sont ailleurs : l'élève de cours de théâtre adulte qui monte une pièce contemporaine, le comédien qui prépare une audition, le professeur de théâtre qui veut distribuer un texte à sa classe. Le seul canal qui les touche aujourd'hui, ce sont les 10 mails hebdomadaires — et `PROSPECTION.md` les optimisait pour obtenir des backlinks, c'est-à-dire pour alimenter le canal qui ne touche pas d'acheteurs.

### Ce que dit le reste de la mesure

- **405 vues de la page d'accueil → 5 clics « Se connecter »** (1,2 %).
- **~6 inscrits réels** (le reste du tableau, c'est Paul et mail-tester). **Un seul** a vraiment utilisé l'app : 12 sessions, dernière activité le 03/05/2026. Trois ont 0 session. Aucune session sur le produit depuis le 11/07/2026.
- **0 payant.** Le parcours Stripe à 12 €, lui, a été vérifié de bout en bout par Paul le 06/08/2026 : ce n'est plus un risque.

Le problème n'est donc pas seulement l'acquisition. Après le magic link, il ne se passe rien.

### L'unité de vente

`hasClassMembership` (`src/lib/utils/require-subscription.ts`) donne aux élèves d'une classe l'accès couvert par le compte du professeur. **Le professeur qui paie est donc l'unité de vente naturelle** : une vente, quinze utilisateurs actifs.

---

## 2. La contrainte de calendrier

Elle décide de tout l'ordonnancement.

**Les trois semaines du 06 au 23 août sont mortes pour la prospection.** Les cours de théâtre amateurs sont tenus par des bénévoles ; en août ils ne lisent pas leurs mails et ne pensent pas à la saison. Envoyer 30 mails à ce moment-là, c'est brûler 30 cibles pour rien.

En face, deux dates dures :

- **samedi 5 septembre 2026 — les forums des associations.** 40 à 60 cours de théâtre dans un gymnase, sur une matinée, qui cherchent activement des élèves et de la matière. Plus dense que trois mois de mails froids.
- **mi-septembre — le démarrage des cours.** La pièce de saison est choisie, les groupes sont formés. Après, c'est verrouillé pour un an.

> **On construit jusqu'au 23 août, on frappe du 24 août au 30 septembre.**

Budget disponible : une journée pleine par semaine (~7 h).

---

## 3. Phase 1 — jusqu'au 23 août : le build (~3 jours)

Trois chantiers, dans cet ordre. Chacun lève une objection précise qui sera rencontrée en septembre.

### Chantier 1 — Le premier import offert ✅ livré le 06/08/2026

**Pourquoi.** `src/app/scenes/import/page.tsx` appelait `requireSubscriptionOrRedirect` sur la page entière : un inscrit ne voyait jamais l'import fonctionner. L'argument de vente était « payez 12 € pour une fonction que vous n'avez jamais vue tourner », sur un domaine de trois mois, sans preuve sociale. C'était le blocage n°1.

**Ce qui a été trouvé en chemin.** Le paywall de l'import était **purement décoratif** : `/api/scenes/import` et `/api/scenes/import/commit` ne vérifiaient que l'authentification. N'importe quel inscrit pouvait importer sans pass en appelant l'API directement, et brûler du crédit OCR au passage. Le mécanisme `free_slot` (`grantFreeSlotAccess`, `FREE_SLOT_LIMIT`) n'était pas réutilisable : c'est un quota de *répliques* sur le catalogue public, hérité d'un modèle antérieur, sans rapport avec l'import.

**Ce qui a été fait.**
- `src/lib/utils/entitlement.ts` — la matrice de droits (admin / pass / classe) extraite en un seul endroit, réutilisée par le paywall des pages et par le quota d'import.
- `src/lib/utils/import-quota.ts` — `FREE_IMPORT_LIMIT = 1`, plus un plafond de 5 fichiers par import offert pour borner le coût OCR d'un compte gratuit.
- Quota appliqué **côté serveur** sur les deux routes API : avant l'extraction (on ne paie pas d'OCR pour un compte sans droit) et avant la création de la scène.
- Page ouverte à tout inscrit, avec bandeau « ton premier texte importé est offert » ; redirection vers `/subscribe` une fois l'offert consommé, y compris depuis le client (402 → `/subscribe`).

**Correctif du 06/08/2026, remonté par un test manuel.** Le premier import créait bien la scène, puis `/scenes/[id]` renvoyait aussitôt sur `/subscribe` : quatre gardes (détail, `/learn`, export, édition) traitaient toute scène privée comme du contenu payant, sans regarder à qui elle appartenait. On offrait un import qu'on ne pouvait pas ouvrir. `canAccessPrivateScene` pose désormais la règle « on est toujours chez soi » : le propriétaire d'un texte importé le lit, le répète, l'exporte et le corrige sans pass. **Conséquence assumée : un pass expiré ne reprend pas les textes déjà importés** — le pass vend le droit d'importer, pas la garde de ce qui a été importé.

**Sémantique retenue.** On compte les textes importés **possédés**, pas les imports réalisés depuis toujours : supprimer son texte importé rend l'import offert. La promesse « un texte importé à la fois » reste vraie, et compter l'historique aurait demandé de s'appuyer sur `import_jobs`, qui ne couvre pas le chemin d'import synchrone. À revoir si quelqu'un en abuse.

### Chantier 2 — Le PDF des scènes du domaine public, gratuit avec un compte ✅ livré le 06/08/2026

**Pourquoi.** `src/app/scenes/[identifiant]/export/page.tsx` exigeait le pass, y compris quand `scene.is_private` était faux. C'était du contenu du domaine public derrière l'auth **et** derrière 12 € — une entorse à la règle produit n°1. C'est aussi le meilleur aimant à compte disponible : « télécharger la scène en PDF » est exactement ce que veulent le prof qui photocopie et le lycéen qui révise, et c'est un argument physique sur un stand de forum.

**Décision.** Le PDF exige un compte, volontairement. Le texte intégral reste lisible sans compte sur la page scène ; le PDF est une commodité dérivée, et c'est la seule contrepartie concrète qu'on ait à échanger contre une adresse mail auprès du trafic SEO existant.

**Ce qui a été fait.**
- Le pass ne garde plus que l'export d'un texte **importé** (`scene.is_private`). Sur une scène publique, un compte gratuit suffit.
- Un visiteur anonyme part sur `/login?redirect=/scenes/[id]/export` et retombe sur son PDF après connexion.
- **Le CTA existe enfin pour l'anonyme** : un bloc « Télécharger la scène en PDF » en haut de l'onglet Aperçu. Sans lui, ouvrir la route n'aurait rien changé — l'entrée était réservée aux connectés et enterrée dans l'onglet Réglages.
- Le bloc connecté s'intitulait « Exporter mes notes », ce qui vendait une fonction annexe. Il s'appelle maintenant « Télécharger la scène en PDF ».

`/scenes/*/export` reste en disallow dans `robots.ts` : c'est une vue par utilisateur, pas une page de contenu.

### Chantier 3 — Le parcours professeur en autonomie ✅ livré le 06/08/2026

**Décision de modèle.** Le paywall reste **en amont** : tenir une classe demande le pass. L'alternative — classe gratuite, pass pour distribuer un texte importé — a été écartée. Conséquence assumée : le professeur paie avant d'avoir rien vu, donc le mail du 24/08 doit faire le travail de conviction que le produit ne fera pas.

**La faille trouvée en chemin.** L'espace professeur était intégralement ouvert :

- les **15 handlers** de `src/app/api/teacher/**` ne vérifiaient que l'authentification — le paywall ne vivait que sur les pages, exactement comme pour l'import ;
- `has_class_membership` renvoie vrai pour tout membre de n'importe quelle classe, sans regarder le professeur.

Combinés, ces deux points formaient un contournement complet du pass : créer une classe par l'API, diffuser le code, et tout le monde obtenait les fonctions payantes.

**Ce qui a été fait.**
- `canOwnClass` (admin ou pass actif) — **volontairement plus strict** que `isEntitledToPaidFeatures` : l'appartenance à une classe donne les fonctions payantes mais jamais le droit d'en créer une, sinon un seul professeur payant amorce une chaîne sans fin.
- Option `requireClassOwner` sur `requireAuth`, appliquée aux 15 handlers ; réponse 402 pour que le client renvoie sur `/subscribe`.
- `requireClassOwnerOrRedirect` sur les trois pages `/professeur/**`, qui laissaient entrer un élève.
- `next` traverse désormais la connexion **et** le paiement (`/subscribe?next=`, métadonnée jusqu'à `/api/payments/success`) : un professeur qui paie retombe dans son espace, plus sur `/home`.
- `/professeurs` annonçait « Créer ma classe **gratuitement** · aucune carte bancaire requise » et pointait sur `/login`. C'était faux sous ce modèle et se serait retourné contre toi dès le premier prof démarché. La page annonce le prix, pointe sur le pass, et la FAQ distingue ce qui est gratuit (les élèves, toujours) de ce qui ne l'est pas (ton espace).

**Reste ouvert.** `has_class_membership` ignore toujours l'état du pass du professeur : les élèves d'un professeur dont le pass a expiré gardent les fonctions payantes indéfiniment. Fermer ça demande la migration écartée ici. À revoir avant le premier renouvellement, soit fin novembre.

**Pourquoi.** C'est le chantier qui fixe le plafond. `PROSPECTION.md` niveau 2 prévoit que Paul paramètre la classe à la main : dix minutes par prospect. Ça tient jusqu'à cinq professeurs, pas au-delà, et ça ne survit pas au 5 septembre où il repartira avec quinze contacts.

**Quoi.** Un professeur qui dit oui doit pouvoir, seul et en cinq minutes : créer sa classe, y déposer trois scènes, récupérer le code d'invitation, l'envoyer à ses élèves. Les routes `src/app/api/teacher/*` et les pages `src/app/professeur/*` existent déjà — c'est un travail de parcours, pas de fonctionnalité.

**Fini quand.** Paul peut envoyer un seul lien à un professeur rencontré la veille et ne plus rien avoir à faire.

---

## 4. Phase 2 — du 24 août au 30 septembre : l'acquisition (~5 jours)

Découper la journée hebdomadaire en deux : une demi-journée de contacts, une demi-journée de suivi et de correction produit sur ce qui remonte.

**Semaine du 24 août — 15 mails.** Cible resserrée : cours **adultes** montant du **contemporain**. Un cours qui monte Molière n'a besoin que du catalogue gratuit et ne paiera jamais ; c'est une cible à liens, pas à revenus. Le modèle A de `PROSPECTION.md` tient pour l'accroche, mais la réponse enchaîne sur « je vous ouvre une classe », plus sur le lien.

**Samedi 5 septembre — le forum des associations.** 50 flyers avec un QR code vers **une scène concrète**, jamais vers l'accueil. Objectif : 15 conversations, 15 emails notés, 3 classes ouvertes sur place depuis le téléphone.

**Semaines du 7 au 28 septembre.** Relance des contacts du forum d'abord — ils ont vu un visage, le taux de réponse n'a rien à voir avec du froid — puis 10 mails/semaine en continu.

### Sur les remises

**Plus de codes à −100 % pour les prospects.** À 12 €, le prix n'est pas l'objection, la confiance l'est. Un code gratuit produit un utilisateur, pas un client, et détruit l'ancre de prix. Ce qu'on donne, c'est du temps (le paramétrage de classe), pas de la remise. Les codes promo restent disponibles pour un cas particulier, à l'unité.

### Sur le prix

12 € pour un professeur dont quinze élèves auront accès est faible, et un « Pass classe » plus cher se défendrait. **À ne pas créer avant que les 12 € aient été payés une fois par un inconnu.** Inventer un second SKU avant la première vente, c'est optimiser une marge qui n'existe pas. Décision reportée à octobre, sur données.

---

## 5. Ce qu'on déprioritise volontairement

Rentable, peu coûteux, et sans effet sur l'objectif avant novembre. **À reprendre en octobre.**

- **Réécriture des `title`.** Le problème n'est pas le rang, c'est le clic : Cyrano acte V scène 6 est en position 6 avec 19 impressions et 0 clic ; Bérénice acte II scène V en position 6,7 avec 9 impressions et 0 clic. Les titres ne reprennent pas les mots des requêtes (« texte intégral », « analyse », « acte X scène Y »).
- **Les URLs UUID indexées.** `/scenes/cb149ae6…` (24 impressions) et `/scenes/b36cdba5…` (22) sont les deux pages les plus vues du site, à 0 clic, et concurrencent les URLs slug. La route fait pourtant un `permanentRedirect` dès que `scenePathFor` renvoie un chemin : ces scènes-là ne sont pas éligibles à la route slug, il faut comprendre pourquoi.

---

## 6. Ce qu'on mesure

Relevé mensuel, pas plus souvent — en dessous, le bruit domine.

| Indicateur | Au 06/08/2026 | Cible au 30/09/2026 |
|---|---|---|
| **Professeurs payants** | 0 | **2 à 4** |
| Classes créées et actives | 0 | 5 |
| Inscrits ayant fait ≥ 1 session | 1 | 20 |
| Imports gratuits consommés | — | 15 |
| Impressions/jour (GSC) | 90 | suivi seulement |

L'indicateur qui compte est le premier. Les autres servent à comprendre *où* ça casse quand il ne bouge pas.

---

## 7. Question ouverte

La conversation déjà eue avec un professeur de théâtre a donné quoi, exactement : un texte hors domaine public à faire apprendre à ses élèves, ou de la politesse sur le catalogue gratuit ? La réponse ne change pas les trois chantiers, mais elle change ce qu'on écrit dans le mail du 24 août.

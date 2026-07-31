# Prospection — petits cours de théâtre

Plan opérationnel pour obtenir des liens entrants vers cote-cour.studio.
Établi le 31/07/2026. À tenir à jour au fil des contacts.

---

## 1. Pourquoi on fait ça, et pourquoi maintenant

Search Console, relevé du 24/07/2026 :

| | |
|---|---|
| Pages indexées | 252 |
| **« Détectée, actuellement non indexée »** | **108** |
| Impressions sur 85 jours | 137, dont 126 sur les 14 derniers |

« Détectée, actuellement non indexée » ne veut pas dire que Google a regardé et refusé. Ça veut dire qu'il **connaît ces URLs et n'a pas dépensé de crawl pour aller les voir**. Sur un domaine de cinq semaines sans aucun lien entrant, c'est un arbitrage de sa part, pas un problème technique.

Trois leviers agissent là-dessus. Deux sont faits :
- la **cachabilité** — les pages publiques ne coûtent plus un rendu complet à chaque passage ;
- la **différenciation** — les 208 scènes portent désormais une fiche éditoriale, donc plus rien n'est un doublon pur de Wikisource.

Le troisième, les **liens entrants**, n'a jamais été travaillé. C'est le seul signal qui débloque simultanément le budget de crawl et le classement, pour tout le domaine d'un coup. C'est maintenant la contrainte principale.

**Objectif à deux mois : une dizaine de liens depuis des domaines tiers réels.** Pas cent. Dix suffisent à changer le comportement de crawl d'un domaine neuf.

---

## 2. La cible

**Petits cours de théâtre et ateliers amateurs, villes moyennes, France entière.**

Pourquoi eux plutôt que les conservatoires et grandes écoles :

- ils éditent leur site eux-mêmes, sans service com ni validation ;
- ils ont presque tous une page « liens utiles » ou « ressources » déjà existante ;
- ils ont un besoin réel et récurrent — trouver des scènes libres de droits pour leurs élèves, et arrêter de photocopier les mêmes trois extraits ;
- le lien d'un petit cours vaut autant que celui d'une grande école pour ce qui nous bloque : sortir du rationnement de crawl.

**Villes moyennes plutôt que Paris** : moins de sollicitations dans les boîtes mail, taux de réponse nettement supérieur.

### Où les trouver, par rendement décroissant

1. **Fédérations régionales de théâtre amateur** — elles publient des annuaires de compagnies et de cours, département par département. Source la plus dense.
2. **« cours de théâtre + [ville] »** sur les 30 à 40 villes de 50 000 à 200 000 habitants.
3. **MJC et centres sociaux** avec un atelier théâtre — page dédiée et adresse de contact directe presque à chaque fois.
4. **Annuaires du secteur** (Le Proscenium, Dramaction, pieces-de-theatre.com). Ce sont ceux qui tiennent le SERP « scène de théâtre à 2 personnages » ; certains acceptent des soumissions de ressources.
5. **Profs de théâtre sur Instagram et TikTok** qui postent des conseils d'audition. Peu de valeur SEO, mais l'audience est exactement la nôtre.

---

## 3. L'offre

Trois niveaux, du moins au plus engageant. Monter d'un cran seulement quand l'interlocuteur a répondu.

### Niveau 1 — les ressources (dans le premier mail)

« 208 scènes du domaine public, texte intégral, gratuit et sans compte, lisible sur téléphone. »

C'est vrai, c'est vérifiable en un clic, et ça ne demande rien en retour. C'est l'accroche par défaut.

### Niveau 2 — je paramètre leur classe (quand ils répondent)

Créer la classe, y déposer les scènes qu'ils montent cette saison, leur envoyer le code d'invitation prêt à distribuer aux élèves. Dix minutes de travail, et ça transforme un contact poli en utilisateur.

À proposer **en réponse**, jamais dans le premier mail : c'est trop engageant pour une prise de contact froide.

### Niveau 3 — codes de réduction sur le pass

Pour les élèves qui veulent importer leurs propres textes.

> ⚠️ **Bloqué techniquement aujourd'hui.** `src/app/api/payments/create-checkout/route.ts` ne passe pas `allow_promotion_codes: true` à la session Stripe : même en créant un code promo dans le dashboard, le client n'a aucun champ pour le saisir au paiement.
>
> Le correctif est d'une ligne, mais le CLAUDE.md interdit de toucher au flux Stripe sans plan de test sandbox explicite. À faire avant de promettre un code à qui que ce soit — promettre une réduction inutilisable est le meilleur moyen de perdre un contact acquis.

---

## 4. La méthode

**10 contacts personnalisés par semaine.** Une demi-journée bloquée. Environ 40 par mois.

Un mail générique sur cette cible ne se répond pas. Un mail qui cite la pièce qu'ils montent se répond souvent. La personnalisation n'est pas un supplément d'âme, c'est ce qui fait la différence entre 2 % et 20 % de réponse.

### Le rituel hebdomadaire, environ 2 h

1. **Constituer la liste (30 min)** — 10 cibles, avec pour chacune : nom, ville, URL du site, page contact, et **la pièce qu'ils montent ou ont monté** (toujours sur leur site ou leur page Facebook).
2. **Préparer les liens (20 min)** — une commande par cible, voir §5.
3. **Écrire et envoyer (1 h)** — modèles au §6, à trous. Compter 5 à 6 min par mail une fois les liens prêts.
4. **Reporter dans le tableau (10 min)** — §7.

### Les relances

**Une seule relance, à 10 jours**, trois lignes maximum. Ensuite on passe. Deux relances sur cette cible font plus de mal que de bien.

---

## 5. L'outil : `npm run prospection`

Le goulot d'un mail personnalisé n'est pas l'écriture, c'est la vérification : retrouver l'URL de la page œuvre, choisir des scènes qui vont à leur distribution, s'assurer qu'aucun lien n'est mort. Cette commande le fait à partir de la base réelle.

```bash
# Ils montent une pièce précise
npm run prospection -- "Le Malade imaginaire"

# Ils cherchent une configuration
npm run prospection -- --duo --court
npm run prospection -- --trio --comique
npm run prospection -- --femmes

# Se repérer dans le catalogue
npm run prospection -- --catalogue
```

Filtres cumulables : `--duo` `--trio` `--court` `--femmes` `--hommes` `--comique` `--tragique`.

La sortie donne l'URL de la page œuvre, six scènes avec distribution, nombre de répliques et durée approximative, plus les sélections thématiques à joindre. Il n'y a plus qu'à copier dans le mail.

---

## 6. Les modèles

À trous. Les crochets sont à remplir, le reste peut rester tel quel.

### A — Ils montent une pièce qu'on a au catalogue

> Objet : *[Pièce] — le texte scène par scène pour vos élèves*
>
> Bonjour,
>
> J'ai vu que [nom du cours] monte *[Pièce]* cette saison.
>
> Je développe Côté-Cour, un site où les textes du domaine public sont découpés scène par scène, avec le nombre de répliques et la distribution affichés avant d'ouvrir. C'est gratuit et sans compte, et ça se lit sur téléphone — vos élèves peuvent réviser dans le métro.
>
> *[Pièce]* y est en entier : [URL page œuvre]
> Par exemple [Acte X scène Y], [distribution] : [URL scène]
>
> Si ça vous est utile, n'hésitez pas à le passer à vos élèves. Et si vous voyez quelque chose à corriger dans les textes, je suis preneur — je collationne tout contre Wikisource mais quatre yeux valent mieux que deux.
>
> Bien à vous,
> Paul

### B — Ils cherchent des scènes pour une distribution donnée

> Objet : *Scènes à [N] personnages, libres de droits*
>
> Bonjour,
>
> Une question qui revient souvent en atelier : trouver une scène qui va au groupe qu'on a, et pas l'inverse. La plupart des recueils proposent des duos, et il faut couper un rôle ou en inventer un.
>
> J'ai regroupé les scènes du domaine public par contrainte de distribution : [URL collection pertinente]
>
> Tout est en texte intégral, gratuit, sans compte, avec le nombre de répliques indiqué pour jauger la longueur avant d'ouvrir.
>
> Si vous avez une page ressources sur votre site, ça peut y trouver sa place. Et si vous cherchez une configuration précise que je n'ai pas encore couverte, dites-le-moi, c'est le genre de sélection que je fais volontiers.
>
> Bien à vous,
> Paul

### C — Angle droits d'auteur

> Objet : *Ce qu'on peut jouer et photocopier librement*
>
> Bonjour,
>
> J'ai écrit une page sur une question que se posent la plupart des troupes amateur : quels textes peut-on jouer, copier et distribuer sans autorisation. Domaine public, cas de l'édition, cas de la traduction — avec les deux pièges qui reviennent le plus.
>
> [URL /ressources/texte-de-theatre-libre-de-droits]
>
> Elle renvoie vers un catalogue de 208 scènes classiques en texte intégral, gratuites et sans compte, que vos élèves peuvent lire sur téléphone.
>
> Si ça vous paraît utile à vos adhérents, n'hésitez pas à le partager.
>
> Bien à vous,
> Paul

### Relance (une seule, à 10 jours)

> Bonjour,
>
> Je me permets un rappel rapide sur mon message du [date] — les scènes de *[Pièce]* sont ici si ça peut servir à vos élèves : [URL].
>
> Si ce n'est pas le moment, aucun souci, je n'insiste pas.
>
> Paul

---

## 7. Le suivi

Une ligne par cible. `Résultat` : `—` en attente, `réponse`, `lien`, `refus`, `sans suite`.

| Cible | Ville | Site | Contact | Pièce montée | Angle | Envoyé | Relancé | Résultat | Notes |
|---|---|---|---|---|---|---|---|---|---|
| *(exemple)* Atelier du Passage | Niort | atelier-du-passage.fr | contact@ | Le Malade imaginaire | A | 2026-08-04 | 2026-08-14 | — | page « liens » existante |

À remplir au fil de l'eau. Si le tableau dépasse une cinquantaine de lignes et devient pénible à éditer, le basculer en CSV et le référencer ici.

### Ce qu'on mesure vraiment

Le nombre de liens obtenus est l'indicateur d'activité. Le vrai indicateur de succès est dans Search Console :

- **« Détectée, actuellement non indexée » doit baisser** — c'est le signe que le budget de crawl s'ouvre ;
- les impressions quotidiennes, aujourd'hui autour de 8, devraient suivre avec quelques semaines de retard.

Relever ces deux chiffres **une fois par mois**, pas plus souvent : en dessous, le bruit domine le signal.

---

## 8. Ce qui reste à faire avant de lancer

- [ ] **Activer `allow_promotion_codes`** sur la session Stripe, avec test sandbox — sinon ne pas promettre de code de réduction (§3, niveau 3).
- [ ] Constituer la première liste de 10 cibles.
- [ ] Relever l'état Search Console du jour, pour avoir un point de comparaison propre dans un mois.

## 9. Ce qu'on pourrait ajouter si ça prend

- Une page `/pour-les-cours-de-theatre` distincte de `/professeurs` — orientée « trouver des scènes à distribuer » plutôt que « gérer une classe ». Ce serait la page à mettre en lien dans tous les mails.
- Une sélection sur mesure publiée pour un cours qui joue le jeu : ça génère le lien presque à coup sûr, mais c'est coûteux par cible, donc à réserver aux contacts déjà chauds.
- Un export PDF propre d'une scène, à distribuer en atelier. La route `/scenes/[id]/export` existe déjà mais demande un compte.

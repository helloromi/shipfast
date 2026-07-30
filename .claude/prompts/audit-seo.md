AUDIT SEO CÔTÉ-COUR — LECTURE SEULE

RÈGLE ABSOLUE : tu ne modifies aucun fichier, aucune donnée, aucune migration.
Cette tâche produit un rapport, rien d'autre. Si tu identifies un correctif
évident, tu le décris dans le rapport, tu ne l'appliques pas.

CONTRAINTES D'ENVIRONNEMENT

- Toute vérification HTTP se fait en local, jamais sur cote-cour.studio. Le
  réseau de travail a un proxy d'inspection TLS qui renvoie ses propres
  réponses : les curl sur le domaine de prod sont inexploitables.
- Les métadonnées ne se vérifient que sur build de production :
  `next build && next start`, puis curl sur localhost. Jamais en dev, le
  rendu diffère.
- Next 16 : la convention middleware.ts est dépréciée, le fichier est
  src/proxy.ts. Un Server Component ne peut pas émettre un statut arbitraire.
- Piège connu à vérifier partout : un objet openGraph déclaré sur une page
  enfant ne fusionne pas en profondeur avec le layout racine. og:type,
  og:locale et og:image disparaissent silencieusement.


PÉRIMÈTRE DE L'AUDIT

A. Inventaire des routes
Lister toutes les routes publiques (non authentifiées) du App Router, avec
pour chacune : mode de rendu (static, dynamic, force-dynamic), présence d'un
loading.tsx au-dessus, présence d'un generateStaticParams. Signaler toute
route publique dont le contenu principal n'est pas dans le HTML servi.

B. Métadonnées, page par type
Pour chaque type de page (landing, liste scènes, scène, professeurs,
ressources éditoriales, learn), vérifier sur build prod en local : title,
meta description, canonical, og:title, og:description, og:image, og:type,
og:locale, twitter:card, meta robots. Reporter les valeurs réelles extraites
du HTML, pas ce que dit le code. Signaler les titles dupliqués entre pages.

C. Codes de statut
Tester en local : une URL de scène à slug valide, un ancien slug censé être
dans previous_slugs, un UUID de scène, une URL inexistante, une URL avec
casse différente, une URL avec slash final. Reporter le code réel et le
Location.

D. Sitemap et robots.txt
Nombre d'URLs dans le sitemap, comparaison avec le nombre de scènes
publiables en base, présence d'URLs mortes ou de doublons, cohérence des
lastmod, présence d'UUID. Contenu du robots.txt et de tout noindex hérité.

E. Données structurées
Pour chaque type de page, extraire le JSON-LD servi et signaler les champs
manquants ou invalides. Vérifier que le @id et le url pointent sur l'URL
canonique et non sur un UUID.

F. Maillage interne
Compter les liens internes entrants par page scène. Identifier les pages
orphelines (aucun lien entrant depuis une autre page du site). Vérifier que
les pages éditoriales /ressources/* pointent bien vers des URLs à slug
résolues, sans 404 ni redirection.

G. Contenu dupliqué
Rechercher en base les scènes dont le texte est identique ou quasi identique
sous deux entrées différentes, et les œuvres présentes en double sous des
graphies différentes. Signaler les incohérences d'orthographe de noms de
personnages au sein d'une même œuvre.

H. Performance mobile
Lighthouse sur build prod local, viewport mobile, sur trois pages : landing,
une page scène, une page ressource. Reporter les quatre scores et les
opportunités au-dessus de 300 ms.

FORMAT DU RAPPORT

Un fichier markdown, audit-seo-[date].md, à la racine du repo. Structure :

1. Tableau de synthèse : une ligne par constat, colonnes = section, constat
   en une phrase, gravité (bloquant / important / cosmétique), statut
   (connu-confirmé / connu-résolu / nouveau).
2. Le détail par section A à H, avec les sorties brutes (curl, extraits de
   HTML, résultats SQL) et non des reformulations.
3. Une section « incertitudes » listant ce que tu n'as pas pu vérifier et
   pourquoi.

Ne priorise pas les correctifs, ne propose pas de plan d'action. Le tri se
fait ailleurs.

Si une vérification échoue ou donne un résultat que tu ne sais pas
interpréter, écris-le dans les incertitudes. N'invente aucune valeur, ne
substitue jamais un slug ou une URL par ce qui te paraît logique.
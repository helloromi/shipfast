/**
 * Paliers de distribution : parcourir le catalogue par NOMBRE de personnages.
 *
 * Pourquoi. C'est l'intention la plus rentable du site, et de loin. Sur 3 mois au
 * 03/08/2026, les pages /ressources qui visent une distribution font 11,3 % de CTR
 * (6 clics sur 53 impressions) quand les pages scènes font 0,8 %. Les requêtes
 * existent déjà : « scene duo » (position 6), « pièce de théâtre à deux personnages »
 * (36), « pièce de théâtre 2 personnages courte » (66).
 *
 * Ce qui manque, et qui est couvert ici. Les paliers 2 et 3 personnages ont DÉJÀ leur
 * page éditoriale (/ressources/scenes-a-deux-personnages et
 * /ressources/scenes-de-theatre-a-3-personnages) — ce sont les deux meilleures pages
 * du site. En créer des doublons générés se cannibaliserait. Ces trois paliers-ci
 * comblent les trous : le monologue, la scène à quatre, et la scène de groupe — celle
 * que cherche une troupe qui monte un spectacle.
 *
 * Ce qui n'est PAS couvert : la distribution par genre (« 2 hommes 1 femme »). La
 * table `characters` ne contient que `id, scene_id, name` — aucune donnée de genre.
 * C'est précisément pour ça que /ressources/scenes-de-theatre-deux-femmes est un
 * article écrit à la main : le site ne peut pas le générer. Il faudrait une colonne
 * `characters.gender` et un lot d'annotation vérifié.
 *
 * Le nombre de personnages retenu est celui de la table `characters`, pas celui des
 * personnages qui parlent : un rôle muet dans la scène demande quand même un comédien
 * sur le plateau. C'est la mesure juste pour une distribution. Les deux ne diffèrent
 * que sur une scène du catalogue.
 */

export type Distribution = {
  /** Dernier segment de l'URL, sous /scenes. */
  slug: string;
  /** Titre de la page (H1). */
  h1: string;
  /** <title>, sous la barre des 60 caractères. */
  title: string;
  /** meta description, sous 155 caractères. */
  description: string;
  /** Chapô éditorial, un paragraphe par entrée. Rendu côté serveur. */
  intro: string[];
  /**
   * Afficher le nombre de rôles à côté de chaque scène. N'a de sens que sur un palier
   * ouvert : sur /monologues toutes les scènes valent 1, l'information serait du bruit
   * répété 22 fois.
   */
  showRoleCount: boolean;
  /** Vrai si une scène à `count` personnages appartient à ce palier. */
  matches: (count: number) => boolean;
};

export const DISTRIBUTIONS: Distribution[] = [
  {
    slug: "monologues",
    h1: "Monologues et tirades à travailler seul",
    title: "Monologues de théâtre : textes intégraux gratuits",
    description:
      "Les monologues et grandes tirades du répertoire français, texte intégral et gratuit, avec le mode flashcard pour les apprendre.",
    intro: [
      "Un monologue se choisit rarement au hasard : c'est le texte qu'on présente en audition, celui sur lequel on est jugé sur trois minutes. Les scènes réunies ici n'ont qu'un personnage en scène, ou une tirade assez longue pour se jouer seule.",
      "Chaque page donne le texte intégral, sans compte et sans limite de lecture, et le mode flashcard pour le mémoriser réplique par réplique.",
    ],
    showRoleCount: false,
    matches: (count) => count === 1,
  },
  {
    slug: "scenes-a-4-personnages",
    h1: "Scènes de théâtre à 4 personnages",
    title: "Scènes de théâtre à 4 personnages : textes gratuits",
    description:
      "Scènes du répertoire français à quatre personnages, texte intégral et gratuit, à lire et à répéter en groupe avec le mode flashcard.",
    intro: [
      "Quatre personnages, c'est la distribution du quiproquo : assez de monde pour que l'information circule mal, assez peu pour que chacun garde du texte à défendre. C'est aussi une taille de groupe commode en cours, où l'on travaille rarement à deux toute l'année.",
      "Toutes les scènes ci-dessous sont du domaine public : le texte est intégral, gratuit, et lisible sans créer de compte.",
    ],
    showRoleCount: false,
    matches: (count) => count === 4,
  },
  {
    slug: "scenes-a-5-personnages-et-plus",
    h1: "Scènes de groupe, 5 personnages et plus",
    title: "Scènes de théâtre à 5 personnages et plus",
    description:
      "Scènes de groupe du répertoire français, de 5 personnages à la scène de foule : texte intégral gratuit, pour une troupe ou une classe entière.",
    intro: [
      "Monter un spectacle avec une troupe ou une classe pose un problème que les scènes à deux ne résolvent pas : il faut du texte pour tout le monde. Les scènes réunies ici vont de cinq personnages aux grandes scènes de foule du répertoire romantique.",
      "Le nombre indiqué est celui des rôles de la scène, y compris les rôles brefs — ce sont eux qui permettent de distribuer un groupe entier sans laisser personne en coulisse.",
    ],
    showRoleCount: true,
    matches: (count) => count >= 5,
  },
];

export function getDistribution(slug: string): Distribution | null {
  return DISTRIBUTIONS.find((d) => d.slug === slug) ?? null;
}

/** Chemin canonique d'un palier. */
export function distributionPath(slug: string): string {
  return `/scenes/${slug}`;
}

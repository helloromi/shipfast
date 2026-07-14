import type { ReactNode } from "react";

import {
  Body as BodyPremierTexte,
  meta as metaPremierTexte,
  slug as slugPremierTexte,
} from "./comment-apprendre-premier-texte-theatre-sans-stress";
import {
  Body as BodyMethodeFlashcard,
  meta as metaMethodeFlashcard,
  slug as slugMethodeFlashcard,
} from "./comment-apprendre-son-texte-de-theatre";
import {
  Body as BodyMonologuesHomme,
  meta as metaMonologuesHomme,
  monologues as monologuesHomme,
  slug as slugMonologuesHomme,
} from "./quel-monologue-choisir-pour-une-audition-homme";

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
};

/**
 * Une page liste (ex. sélection de monologues) fournit ses items pour émettre un
 * schema ItemList en plus de l'Article. Absent = page éditoriale simple (Article seul).
 */
export type ArticleListItem = { name: string; href: string };

export type Article = ArticleMeta & {
  Body: () => ReactNode;
  listItems?: ArticleListItem[];
};

const articles: Article[] = [
  {
    slug: slugMonologuesHomme,
    title: metaMonologuesHomme.title,
    description: metaMonologuesHomme.description,
    publishedAt: metaMonologuesHomme.publishedAt,
    Body: BodyMonologuesHomme,
    listItems: monologuesHomme.map((m) => ({ name: m.name, href: m.href })),
  },
  {
    slug: slugMethodeFlashcard,
    title: metaMethodeFlashcard.title,
    description: metaMethodeFlashcard.description,
    publishedAt: metaMethodeFlashcard.publishedAt,
    Body: BodyMethodeFlashcard,
  },
  {
    slug: slugPremierTexte,
    title: metaPremierTexte.title,
    description: metaPremierTexte.description,
    publishedAt: metaPremierTexte.publishedAt,
    Body: BodyPremierTexte,
  },
];

export function getArticlesList(): ArticleMeta[] {
  return articles.map(({ slug, title, description, publishedAt }) => ({
    slug,
    title,
    description,
    publishedAt,
  }));
}

export function getArticleBySlug(slug: string): Article | null {
  return articles.find((a) => a.slug === slug) ?? null;
}

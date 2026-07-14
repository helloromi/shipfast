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

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
};

export type Article = ArticleMeta & {
  Body: () => ReactNode;
};

const articles: Article[] = [
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

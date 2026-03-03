import type { ReactNode } from "react";

import {
  Body as BodyPremierTexte,
  meta as metaPremierTexte,
  slug as slugPremierTexte,
} from "./comment-apprendre-premier-texte-theatre-sans-stress";

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

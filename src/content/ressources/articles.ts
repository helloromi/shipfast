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
import {
  Body as BodyScenesDeux,
  duoSchemaName,
  duos as duosScenesDeux,
  meta as metaScenesDeux,
  slug as slugScenesDeux,
} from "./scenes-a-deux-personnages";
import {
  Body as BodyScenesTrois,
  meta as metaScenesTrois,
  slug as slugScenesTrois,
  trios,
  triosSchemaName,
} from "./scenes-de-theatre-a-3-personnages";
import {
  Body as BodyScenesCourtes,
  courtes,
  courtesSchemaName,
  meta as metaScenesCourtes,
  slug as slugScenesCourtes,
} from "./scenes-de-theatre-courtes";
import {
  Body as BodyDeuxFemmes,
  duosFeminins,
  duosFemininsSchemaName,
  meta as metaDeuxFemmes,
  slug as slugDeuxFemmes,
} from "./scenes-de-theatre-deux-femmes";
import {
  Body as BodyTiradesFemme,
  meta as metaTiradesFemme,
  slug as slugTiradesFemme,
  tirades as tiradesFemme,
} from "./tirades-monologues-femme-audition";

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date;
  /** <title> HTML si distinct du H1 (`title`). Défaut : `${title} | Côté-Cour`. */
  metaTitle?: string;
};

/**
 * Une page liste (ex. sélection de monologues) fournit ses items pour émettre un
 * schema ItemList en plus de l'Article. Absent = page éditoriale simple (Article seul).
 * `author`/`work` présents => l'item est émis en CreativeWork (author + isPartOf) ;
 * sinon en ListItem simple (name + url).
 */
export type ArticleListItem = {
  name: string;
  href: string;
  author?: string;
  work?: string;
};

export type Article = ArticleMeta & {
  Body: () => ReactNode;
  listItems?: ArticleListItem[];
  /** Type Open Graph. Défaut : "article". */
  ogType?: "article" | "website";
};

const articles: Article[] = [
  {
    slug: slugScenesDeux,
    title: metaScenesDeux.title,
    metaTitle: metaScenesDeux.metaTitle,
    description: metaScenesDeux.description,
    publishedAt: metaScenesDeux.publishedAt,
    Body: BodyScenesDeux,
    ogType: "website",
    listItems: duosScenesDeux.map((d) => ({
      name: duoSchemaName(d),
      href: d.href,
      author: d.author,
      work: d.work,
    })),
  },
  {
    slug: slugScenesTrois,
    title: metaScenesTrois.title,
    metaTitle: metaScenesTrois.metaTitle,
    description: metaScenesTrois.description,
    publishedAt: metaScenesTrois.publishedAt,
    Body: BodyScenesTrois,
    ogType: "website",
    listItems: trios.map((s) => ({
      name: triosSchemaName(s),
      href: s.href,
      author: s.author,
      work: s.work,
    })),
  },
  {
    slug: slugScenesCourtes,
    title: metaScenesCourtes.title,
    metaTitle: metaScenesCourtes.metaTitle,
    description: metaScenesCourtes.description,
    publishedAt: metaScenesCourtes.publishedAt,
    Body: BodyScenesCourtes,
    ogType: "website",
    listItems: courtes.map((s) => ({
      name: courtesSchemaName(s),
      href: s.href,
      author: s.author,
      work: s.work,
    })),
  },
  {
    slug: slugDeuxFemmes,
    title: metaDeuxFemmes.title,
    metaTitle: metaDeuxFemmes.metaTitle,
    description: metaDeuxFemmes.description,
    publishedAt: metaDeuxFemmes.publishedAt,
    Body: BodyDeuxFemmes,
    ogType: "website",
    listItems: duosFeminins.map((s) => ({
      name: duosFemininsSchemaName(s),
      href: s.href,
      author: s.author,
      work: s.work,
    })),
  },
  {
    slug: slugTiradesFemme,
    title: metaTiradesFemme.title,
    metaTitle: metaTiradesFemme.metaTitle,
    description: metaTiradesFemme.description,
    publishedAt: metaTiradesFemme.publishedAt,
    Body: BodyTiradesFemme,
    ogType: "website",
    listItems: tiradesFemme.map((t) => ({
      name: t.name,
      href: t.href,
      author: t.author,
      work: t.work,
    })),
  },
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

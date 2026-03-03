import type { MetadataRoute } from "next";

import { getArticlesList } from "@/content/ressources/articles";

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cote-cour.fr";
  return base.startsWith("http") ? base : `https://${base}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const articles = getArticlesList();

  const resourceEntries = articles.map((a) => ({
    url: `${baseUrl}/ressources/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ressources`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...resourceEntries,
    {
      url: `${baseUrl}/alternatives`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}

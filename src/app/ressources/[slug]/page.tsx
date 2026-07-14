import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticleBySlug, getArticlesList } from "@/content/ressources/articles";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(/\/$/, "");

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = getArticlesList();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const url = `${BASE_URL}/ressources/${slug}`;
  const title = `${article.title} | Côté-Cour`;

  return {
    title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      // Next.js ne fusionne pas openGraph en profondeur avec le layout parent :
      // type/locale doivent être répétés ici pour ne pas disparaître du HTML.
      title,
      description: article.description,
      url,
      type: "article",
      locale: "fr_FR",
    },
  };
}

export default async function RessourceArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const Body = article.Body;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt.toISOString(),
    author: { "@type": "Organization", name: "Côté-Cour" },
    publisher: {
      "@type": "Organization",
      name: "Côté-Cour",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/apple-touch-icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/ressources/${slug}` },
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/ressources"
        className="text-sm font-semibold text-[#3b1f4a] underline-offset-4 hover:underline"
      >
        ← Ressources
      </Link>

      <article className="flex flex-col gap-4 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm shadow-[#3b1f4a14] sm:p-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            Article
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#1c1b1f] sm:text-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-[#7a7184]">
            {article.publishedAt.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <Body />
        </div>
      </article>
    </div>
  );
}

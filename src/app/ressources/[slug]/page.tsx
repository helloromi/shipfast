import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticleBySlug, getArticlesList } from "@/content/ressources/articles";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = getArticlesList();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Côté-Cour`,
    description: article.description,
  };
}

export default async function RessourceArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const Body = article.Body;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
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

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, Newspaper } from "lucide-react";
import { notFound } from "next/navigation";
import { formatArticleDate } from "@/components/news/ArticleCard";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: absoluteUrl(`/news/${article.slug}`) },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt || undefined,
      authors: [article.authorName],
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@type": "Organization", name: "REES52 Academy" },
    image: article.coverImageUrl || undefined,
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
  };

  return (
    <main className="flex-1 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }}
      />
      <article>
        <header className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto w-full max-w-4xl px-4 py-12 lg:px-8 lg:py-16">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-300"
            >
              <ArrowLeft className="h-4 w-4" />
              All news &amp; articles
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest">
              <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">{article.category}</span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                {article.readTimeMinutes} min read
              </span>
            </div>
            <h1 className="mt-5 text-balance text-4xl font-black leading-tight md:text-6xl">{article.title}</h1>
            <p className="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-300">{article.excerpt}</p>
            <div className="mt-7 flex items-center gap-3 text-sm font-semibold text-slate-400">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/15 text-sky-200">
                <Newspaper className="h-4 w-4" />
              </span>
              <p>
                <span className="block font-black text-white">{article.authorName}</span>
                <time dateTime={article.publishedAt || article.createdAt}>
                  {formatArticleDate(article.publishedAt || article.createdAt)}
                </time>
              </p>
            </div>
          </div>
        </header>

        {article.coverImageUrl && (
          <div className="mx-auto w-full max-w-5xl px-4 pt-10 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImageUrl} alt={article.title} className="max-h-[620px] w-full object-cover" />
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-3xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="space-y-6">
            {article.content
              .split(/\n{2,}/)
              .map((block) => block.trim())
              .filter(Boolean)
              .map((block, index) =>
                block.startsWith("## ") ? (
                  <h2 key={index} className="pt-4 text-2xl font-black leading-tight text-slate-950 md:text-3xl">
                    {block.slice(3).trim()}
                  </h2>
                ) : (
                  <p key={index} className="whitespace-pre-line text-base font-medium leading-8 text-slate-700 md:text-lg">
                    {block}
                  </p>
                ),
              )}
          </div>

          <div className="mt-12 border-t border-slate-200 pt-7">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-800"
            >
              <ArrowLeft className="h-4 w-4" />
              More Academy articles
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

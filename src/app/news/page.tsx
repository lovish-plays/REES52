import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import ArticleCard from "@/components/news/ArticleCard";
import { getPublishedArticles } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Articles",
  description:
    "Read REES52 Academy news, classroom stories, robotics tutorials and electronics teaching articles.",
  alternates: { canonical: absoluteUrl("/news") },
};

export default async function NewsPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="flex-1">
      <section className="border-b border-sky-100 bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-900 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-100">
            <Newspaper className="h-3.5 w-3.5" />
            From the Academy
          </span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">News &amp; Articles</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-sky-100/80">
            Academy announcements, classroom stories, practical robotics guidance and ideas from REES52 teachers.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        {articles.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-black text-slate-900">The newsroom is ready.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
              Published Academy news and teacher articles will appear here. Drafts remain private until a teacher publishes them.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

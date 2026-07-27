import Link from "next/link";
import { ArrowRight, Clock3, Newspaper } from "lucide-react";
import type { Article } from "@/lib/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg">
      {article.coverImageUrl ? (
        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
          {/* Teacher-uploaded covers use the Academy's validated public image store. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-cyan-800 text-white">
          <Newspaper className="h-12 w-12 text-sky-200" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-800">{article.category}</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Clock3 className="h-3 w-3" />
            {article.readTimeMinutes} min read
          </span>
        </div>
        <h2 className="mt-4 text-xl font-black leading-tight text-slate-950">{article.title}</h2>
        <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-600">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-[11px] font-semibold text-slate-500">
            <p className="font-black text-slate-700">{article.authorName}</p>
            <time dateTime={article.publishedAt || article.createdAt}>
              {formatArticleDate(article.publishedAt || article.createdAt)}
            </time>
          </div>
          <Link
            href={`/news/${article.slug}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-800"
          >
            Read
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

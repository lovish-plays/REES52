"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  Bookmark,
  CheckCircle2,
  Clock,
  CornerDownRight,
  ExternalLink,
  Flame,
  Globe,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Newspaper,
  Repeat2,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Article } from "@/lib/articles";

export function formatArticleDate(value: string) {
  if (!value) return "Recently";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(value));
  } catch {
    return "Recently";
  }
}

export default function TwitterNewsFeed({ articles }: { articles: Article[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Interactive engagement states
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [reposts, setReposts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean)));
    return ["all", ...cats];
  }, [articles]);

  // Unified single-stream list of ALL articles ordered by publish date (newest first)
  const allArticlesStream = useMemo(() => {
    let result = [...articles].sort(
      (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    );

    // Filter by search query if provided
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.authorName.toLowerCase().includes(q)
      );
    }

    // Filter by topic category if selected
    if (selectedCategory !== "all") {
      result = result.filter((a) => a.category === selectedCategory);
    }

    return result;
  }, [articles, searchQuery, selectedCategory]);

  const toggleLike = (id: string) => {
    setLikes((prev) => {
      const updated = !prev[id];
      showToast(updated ? "Liked article" : "Unliked article");
      return { ...prev, [id]: updated };
    });
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const updated = !prev[id];
      showToast(updated ? "Saved to your Bookmarks" : "Removed from Bookmarks");
      return { ...prev, [id]: updated };
    });
  };

  const toggleRepost = (id: string) => {
    setReposts((prev) => {
      const updated = !prev[id];
      showToast(updated ? "Reposted article to feed" : "Undo repost");
      return { ...prev, [id]: updated };
    });
  };

  const copyShareLink = (slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/news/${slug}`;
      navigator.clipboard.writeText(url);
      showToast("Article link copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-[var(--container-padding)] py-[var(--space-md)]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl animate-fade-in-up">
          <Sparkles className="h-4 w-4 text-sky-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Single Continuous Scrolling Feed Container */}
      <div className="space-y-6">

        {/* Stream Hero Header & Topic Controls */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-sky-800">
                  Continuous Stream
                </span>
                <span className="text-[10px] font-bold text-slate-400">•</span>
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {allArticlesStream.length} Article{allArticlesStream.length !== 1 ? "s" : ""} Uploaded
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                Academy News &amp; Articles Stream
              </h1>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                Scroll through the complete chronological feed of hardware tutorials, classroom updates, and STEM news.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative min-w-[260px] md:min-w-[300px]">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search all news &amp; articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-[9px] font-black uppercase text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Topic Filter Pills (Horizontal Scrolling Row) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-sky-600" /> Topics:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-black capitalize tracking-wide transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat === "all" ? "All Articles" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Stream List */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden divide-y divide-slate-150">
          {allArticlesStream.length > 0 ? (
            allArticlesStream.map((article) => {
              const isLiked = !!likes[article.id];
              const isBookmarked = !!bookmarks[article.id];
              const isReposted = !!reposts[article.id];
              const handle = `@${article.authorName.toLowerCase().replace(/\s+/g, "_")}`;
              const publishedDate = formatArticleDate(article.publishedAt || article.createdAt);

              return (
                <article
                  key={article.id}
                  className="group p-6 md:p-8 transition-colors hover:bg-slate-50/70 text-slate-900"
                >
                  <div className="flex items-start gap-4">
                    {/* Author Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                      {article.authorName.charAt(0).toUpperCase()}
                    </div>

                    {/* Article Content Stream Item */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Author Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-black text-slate-950 text-sm hover:underline">{article.authorName}</span>
                          <CheckCircle2 className="h-4 w-4 fill-sky-500 text-white" />
                          <span className="font-semibold text-slate-500">{handle}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-medium text-slate-500">{publishedDate}</span>
                          <span className="text-slate-400">•</span>
                          <span className="inline-flex items-center gap-1 text-slate-500 font-semibold">
                            <Clock className="h-3 w-3 text-sky-600" /> {article.readTimeMinutes} min read
                          </span>
                        </div>
                        <span className="rounded-full bg-sky-50 border border-sky-200/60 px-3 py-1 text-[9.5px] font-black uppercase tracking-widest text-sky-800">
                          {article.category}
                        </span>
                      </div>

                      {/* Title & Excerpt */}
                      <Link href={`/news/${article.slug}`} className="block mt-3">
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-950 group-hover:text-sky-700 leading-snug">
                          {article.title}
                        </h2>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10.5px] font-bold text-sky-600">
                          <span>#{article.category.replace(/\s+/g, "")}</span>
                          <span>#STEMAcademy</span>
                          <span>#REES52Tech</span>
                        </div>
                      </Link>

                      {/* Cover Image Media Preview */}
                      {article.coverImageUrl && (
                        <Link href={`/news/${article.slug}`} className="block mt-4 relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[16/9] shadow-sm max-h-[420px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-lg">
                              Read Full Article <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
                            </span>
                          </div>
                        </Link>
                      )}

                      {/* Stream Action Toolbar */}
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                        
                        {/* Comments */}
                        <Link
                          href={`/news/${article.slug}`}
                          className="flex items-center gap-1.5 hover:text-sky-600 transition"
                          title="Comments"
                          aria-label="View comments"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs font-bold">12</span>
                        </Link>

                        {/* Repost */}
                        <button
                          onClick={() => toggleRepost(article.id)}
                          className={`flex items-center gap-1.5 transition hover:text-emerald-600 cursor-pointer ${
                            isReposted ? "text-emerald-600 font-bold" : ""
                          }`}
                          title="Repost"
                          aria-label="Repost article"
                        >
                          <Repeat2 className={`h-4 w-4 ${isReposted ? "text-emerald-600" : ""}`} />
                          <span className="text-xs font-bold">{isReposted ? 29 : 28}</span>
                        </button>

                        {/* Like */}
                        <button
                          onClick={() => toggleLike(article.id)}
                          className={`flex items-center gap-1.5 transition hover:text-rose-600 cursor-pointer ${
                            isLiked ? "text-rose-600 font-bold" : ""
                          }`}
                          title="Like"
                          aria-label="Like article"
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                          <span className="text-xs font-bold">{isLiked ? 143 : 142}</span>
                        </button>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-slate-500" title="Views">
                          <BarChart2 className="h-4 w-4 text-sky-600" />
                          <span className="text-xs font-semibold">{article.readTimeMinutes * 120} views</span>
                        </div>

                        {/* Bookmark & Share */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleBookmark(article.id)}
                            className={`transition hover:text-sky-600 cursor-pointer ${
                              isBookmarked ? "text-sky-600" : ""
                            }`}
                            title="Bookmark"
                            aria-label="Bookmark article"
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-sky-600 text-sky-600" : ""}`} />
                          </button>

                          <button
                            onClick={() => copyShareLink(article.slug)}
                            className="transition hover:text-sky-600 cursor-pointer"
                            title="Share Link"
                            aria-label="Share article link"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Read Link */}
                      <div className="mt-4 flex justify-end">
                        <Link
                          href={`/news/${article.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-4 py-2 rounded-xl transition"
                        >
                          Read Full Story <CornerDownRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <Newspaper className="h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-black text-slate-900">No news or articles found</h3>
              <p className="text-xs text-slate-600 font-medium max-w-sm">
                No matching published articles found for your search query or selected topic filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800"
              >
                Reset Stream Filters
              </button>
            </div>
          )}
        </div>

        {/* End of News Stream Indicator */}
        {allArticlesStream.length > 0 && (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-slate-400">
            <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse"></div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-600">
              End of News Stream
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              All {allArticlesStream.length} published articles and STEM updates are loaded above.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

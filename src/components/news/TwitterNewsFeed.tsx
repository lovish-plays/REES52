"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  Clock,
  CornerDownRight,
  ExternalLink,
  Heart,
  MessageCircle,
  Newspaper,
  Repeat2,
  Search,
  Share2,
  Sparkles,
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
    <div className="mx-auto w-full max-w-5xl px-[var(--container-padding)] py-4 text-white bg-zinc-950 selection:bg-cyan-500/30 selection:text-white">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl animate-fade-in-up">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          {toastMessage}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE INSHORTS FULL SCREEN CARDS FEED (< md BREAKPOINT)                 */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3">
        
        {/* Mobile Header / Controls Bar */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                Inshorts Mode
              </span>
              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                {allArticlesStream.length} Stories
              </span>
            </div>

            {/* Search Input Bar Mobile Toggle */}
            <div className="relative flex-1 max-w-[170px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-8 pr-3 py-1.5 text-xs font-semibold text-white placeholder-zinc-500 outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Topic Filter Pills (Mobile Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1 text-[10.5px] font-black capitalize tracking-wide transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                    : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {cat === "all" ? "All Stories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Snap Scroll Container (Inshorts Cards) */}
        {allArticlesStream.length > 0 ? (
          <div className="h-[calc(100dvh-170px)] min-h-[520px] overflow-y-auto snap-y snap-mandatory scroll-smooth no-scrollbar rounded-3xl border border-zinc-800/90 bg-zinc-950 shadow-2xl relative">
            {allArticlesStream.map((article, idx) => {
              const isLiked = !!likes[article.id];
              const isBookmarked = !!bookmarks[article.id];
              const isReposted = !!reposts[article.id];
              const publishedDate = formatArticleDate(article.publishedAt || article.createdAt);

              return (
                <div
                  key={article.id}
                  className="snap-start snap-always h-full w-full flex flex-col justify-between p-5 bg-zinc-950 border-b border-zinc-800/80 text-white relative overflow-y-auto no-scrollbar"
                >
                  {/* Top Card Info Row */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-3 py-0.5 text-[9.5px] font-black uppercase tracking-widest text-cyan-300">
                        {article.category}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                        <span>{publishedDate}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-cyan-400">
                          <Clock className="h-3 w-3" /> {article.readTimeMinutes} min
                        </span>
                        <span className="ml-1 rounded-md bg-zinc-800 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                          #{idx + 1}/{allArticlesStream.length}
                        </span>
                      </div>
                    </div>

                    {/* Article Media Cover Preview */}
                    {article.coverImageUrl && (
                      <Link href={`/news/${article.slug}`} className="block mt-3 relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 aspect-[16/9] max-h-[210px] shadow-lg group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.coverImageUrl}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
                      </Link>
                    )}

                    {/* Title & Inshorts Excerpt */}
                    <div className="mt-3">
                      <Link href={`/news/${article.slug}`}>
                        <h2 className="text-lg xs:text-xl font-black tracking-tight text-white leading-snug hover:text-cyan-400 transition">
                          {article.title}
                        </h2>
                      </Link>
                      <p className="mt-2 text-xs xs:text-sm font-medium leading-relaxed text-zinc-300 line-clamp-6">
                        {article.excerpt}
                      </p>
                      <div className="mt-2 text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                        <span>By <strong className="text-zinc-200">{article.authorName}</strong></span>
                        <span>•</span>
                        <span className="text-cyan-400">REES52 Academy</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar & Swipe Hint */}
                  <div className="mt-4 pt-3 border-t border-zinc-800/90 space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Social Controls */}
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <button
                          onClick={() => toggleLike(article.id)}
                          className={`flex items-center gap-1 transition cursor-pointer hover:text-rose-500 ${
                            isLiked ? "text-rose-500 font-bold" : ""
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                          <span className="text-[11px]">{isLiked ? 143 : 142}</span>
                        </button>

                        <button
                          onClick={() => toggleRepost(article.id)}
                          className={`flex items-center gap-1 transition cursor-pointer hover:text-emerald-400 ${
                            isReposted ? "text-emerald-400 font-bold" : ""
                          }`}
                        >
                          <Repeat2 className="h-4 w-4" />
                          <span className="text-[11px]">{isReposted ? 29 : 28}</span>
                        </button>

                        <button
                          onClick={() => toggleBookmark(article.id)}
                          className={`transition cursor-pointer hover:text-cyan-400 ${
                            isBookmarked ? "text-cyan-400" : ""
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-cyan-400 text-cyan-400" : ""}`} />
                        </button>

                        <button
                          onClick={() => copyShareLink(article.slug)}
                          className="transition cursor-pointer hover:text-cyan-400"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Read Full Story Button */}
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider shadow-md shadow-cyan-500/20 transition"
                      >
                        Read Full <CornerDownRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {/* Swipe Up Navigation Hint (on all except last) */}
                    {idx < allArticlesStream.length - 1 && (
                      <div className="flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-widest text-zinc-500 animate-bounce pt-1">
                        <span>Swipe up for next news</span>
                        <ChevronDown className="h-3.5 w-3.5 text-cyan-400" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400 bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center space-y-3">
            <Newspaper className="h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-black text-white">No articles found</h3>
            <p className="text-xs text-zinc-400">Try adjusting your search query or topic filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-2 px-4 py-2 bg-cyan-500 text-zinc-950 rounded-xl text-xs font-black uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP DARK STREAM VIEW (>= md BREAKPOINT)                               */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">

        {/* Stream Hero Header & Topic Controls */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300">
                  REES52 News Stream
                </span>
                <span className="text-[10px] font-bold text-zinc-500">•</span>
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  {allArticlesStream.length} Article{allArticlesStream.length !== 1 ? "s" : ""} Published
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Academy News &amp; STEM Articles
              </h1>
              <p className="mt-1 text-xs text-zinc-400 font-medium">
                Scroll through the complete chronological feed of hardware tutorials, robotics updates, and STEM news.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="relative min-w-[260px] md:min-w-[300px]">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search all news &amp; articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-zinc-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-[9px] font-black uppercase text-zinc-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Topic Filter Pills (Horizontal Scrolling Row) */}
          <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1 shrink-0 mr-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Topics:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-black capitalize tracking-wide transition shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {cat === "all" ? "All Articles" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Continuous Stream List */}
        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/60 shadow-2xl overflow-hidden divide-y divide-zinc-800/80">
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
                  className="group p-6 md:p-8 transition-colors hover:bg-zinc-900/90 text-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Author Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                      {article.authorName.charAt(0).toUpperCase()}
                    </div>

                    {/* Article Content Stream Item */}
                    <div className="flex-1 min-w-0">
                      
                      {/* Author Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-black text-white text-sm hover:underline">{article.authorName}</span>
                          <CheckCircle2 className="h-4 w-4 fill-cyan-400 text-zinc-950" />
                          <span className="font-semibold text-zinc-400">{handle}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-medium text-zinc-400">{publishedDate}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="inline-flex items-center gap-1 text-zinc-400 font-semibold">
                            <Clock className="h-3 w-3 text-cyan-400" /> {article.readTimeMinutes} min read
                          </span>
                        </div>
                        <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-[9.5px] font-black uppercase tracking-widest text-cyan-300">
                          {article.category}
                        </span>
                      </div>

                      {/* Title & Excerpt */}
                      <Link href={`/news/${article.slug}`} className="block mt-3">
                        <h2 className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 leading-snug transition-colors">
                          {article.title}
                        </h2>
                        <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-300 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10.5px] font-bold text-cyan-400">
                          <span>#{article.category.replace(/\s+/g, "")}</span>
                          <span>#STEMAcademy</span>
                          <span>#REES52Tech</span>
                        </div>
                      </Link>

                      {/* Cover Image Media Preview */}
                      {article.coverImageUrl && (
                        <Link href={`/news/${article.slug}`} className="block mt-4 relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 aspect-[16/9] shadow-xl max-h-[420px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                            <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-950 shadow-lg">
                              Read Full Article <ExternalLink className="h-3.5 w-3.5 text-zinc-950" />
                            </span>
                          </div>
                        </Link>
                      )}

                      {/* Stream Action Toolbar */}
                      <div className="mt-5 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                        
                        {/* Comments */}
                        <Link
                          href={`/news/${article.slug}`}
                          className="flex items-center gap-1.5 hover:text-cyan-400 transition"
                          title="Comments"
                          aria-label="View comments"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs font-bold">12</span>
                        </Link>

                        {/* Repost */}
                        <button
                          onClick={() => toggleRepost(article.id)}
                          className={`flex items-center gap-1.5 transition hover:text-emerald-400 cursor-pointer ${
                            isReposted ? "text-emerald-400 font-bold" : ""
                          }`}
                          title="Repost"
                          aria-label="Repost article"
                        >
                          <Repeat2 className={`h-4 w-4 ${isReposted ? "text-emerald-400" : ""}`} />
                          <span className="text-xs font-bold">{isReposted ? 29 : 28}</span>
                        </button>

                        {/* Like */}
                        <button
                          onClick={() => toggleLike(article.id)}
                          className={`flex items-center gap-1.5 transition hover:text-rose-500 cursor-pointer ${
                            isLiked ? "text-rose-500 font-bold" : ""
                          }`}
                          title="Like"
                          aria-label="Like article"
                        >
                          <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                          <span className="text-xs font-bold">{isLiked ? 143 : 142}</span>
                        </button>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 text-zinc-400" title="Views">
                          <BarChart2 className="h-4 w-4 text-cyan-400" />
                          <span className="text-xs font-semibold">{article.readTimeMinutes * 120} views</span>
                        </div>

                        {/* Bookmark & Share */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleBookmark(article.id)}
                            className={`transition hover:text-cyan-400 cursor-pointer ${
                              isBookmarked ? "text-cyan-400" : ""
                            }`}
                            title="Bookmark"
                            aria-label="Bookmark article"
                          >
                            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-cyan-400 text-cyan-400" : ""}`} />
                          </button>

                          <button
                            onClick={() => copyShareLink(article.slug)}
                            className="transition hover:text-cyan-400 cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-cyan-300 hover:text-cyan-200 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 px-4 py-2 rounded-xl transition"
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
            <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center space-y-3">
              <Newspaper className="h-12 w-12 text-zinc-600" />
              <h3 className="text-lg font-black text-white">No news or articles found</h3>
              <p className="text-xs text-zinc-400 font-medium max-w-sm">
                No matching published articles found for your search query or selected topic filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-2 px-4 py-2 bg-cyan-500 text-zinc-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-cyan-400 font-black transition"
              >
                Reset Stream Filters
              </button>
            </div>
          )}
        </div>

        {/* End of News Stream Indicator */}
        {allArticlesStream.length > 0 && (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-zinc-500">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
              End of News Stream
            </p>
            <p className="text-[10px] text-zinc-500 font-semibold">
              All {allArticlesStream.length} published articles and STEM updates are loaded above.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

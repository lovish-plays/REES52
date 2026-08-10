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
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function TwitterNewsFeed({ articles }: { articles: Article[] }) {
  const [activeTab, setActiveTab] = useState<"for-you" | "latest" | "trending">("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Interactive tweet states
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [reposts, setReposts] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category)));
    return ["all", ...cats];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Filter by search query
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

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Sort according to tab
    if (activeTab === "latest") {
      result.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    } else if (activeTab === "trending") {
      result.sort((a, b) => b.readTimeMinutes - a.readTimeMinutes);
    }

    return result;
  }, [articles, searchQuery, selectedCategory, activeTab]);

  const toggleLike = (id: string) => {
    setLikes((prev) => {
      const updated = !prev[id];
      showToast(updated ? "Liked post" : "Unliked post");
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
      showToast(updated ? "Reposted to your feed!" : "Undo repost");
      return { ...prev, [id]: updated };
    });
  };

  const copyShareLink = (slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/news/${slug}`;
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-[var(--container-padding)] py-[var(--space-md)]">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl animate-fade-in-up">
          <Sparkles className="h-4 w-4 text-sky-400" />
          {toastMessage}
        </div>
      )}

      {/* Main Twitter-Style 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* ── LEFT SIDEBAR (Navigation Pills) ── */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-20 flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2.5 px-3 py-2">
              <div className="rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 p-2 text-white shadow-md">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-slate-900">Academy News</h2>
                <p className="text-[10px] font-bold text-slate-500">Live STEM Feed</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("for-you")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "for-you"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              For You
            </button>

            <button
              onClick={() => setActiveTab("latest")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "latest"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Clock className="h-4 w-4" />
              Latest News
            </button>

            <button
              onClick={() => setActiveTab("trending")}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === "trending"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Flame className="h-4 w-4" />
              Trending STEM
            </button>

            <hr className="my-2 border-slate-200" />

            <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
              Filter By Topic
            </div>

            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold capitalize transition ${
                    selectedCategory === cat
                      ? "bg-sky-50 font-black text-sky-800 border-l-4 border-sky-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{cat === "all" ? "All Topics" : cat}</span>
                  {selectedCategory === cat && <CheckCircle2 className="h-3.5 w-3.5 text-sky-600" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MIDDLE COLUMN (Main Twitter Feed Stream) ── */}
        <main className="lg:col-span-6 border-x border-slate-200/80 bg-white/70 min-h-screen rounded-2xl shadow-sm overflow-hidden">
          
          {/* Sticky Twitter Header */}
          <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span>News &amp; Articles Feed</span>
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-sky-800">
                  LIVE
                </span>
              </h1>
              <Sparkles className="h-4 w-4 text-sky-600" />
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex border-t border-slate-200 text-xs font-black uppercase tracking-wider">
              <button
                onClick={() => setActiveTab("for-you")}
                className={`flex-1 py-3 text-center transition border-b-2 ${
                  activeTab === "for-you"
                    ? "border-sky-600 text-sky-700 bg-sky-50/50"
                    : "border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                For You
              </button>
              <button
                onClick={() => setActiveTab("latest")}
                className={`flex-1 py-3 text-center transition border-b-2 ${
                  activeTab === "latest"
                    ? "border-sky-600 text-sky-700 bg-sky-50/50"
                    : "border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setActiveTab("trending")}
                className={`flex-1 py-3 text-center transition border-b-2 ${
                  activeTab === "trending"
                    ? "border-sky-600 text-sky-700 bg-sky-50/50"
                    : "border-transparent text-slate-600 hover:bg-slate-50"
                }`}
              >
                Trending
              </button>
            </div>
          </div>

          {/* Twitter Composer Box */}
          <div className="border-b border-slate-200/80 bg-slate-50/70 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-black text-xs shadow-md">
                R52
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="What's happening in STEM &amp; Robotics?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-600">
                    <button className="p-1.5 hover:bg-sky-100 rounded-full transition" title="Image attachment">
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-sky-100 rounded-full transition" title="Globe public post">
                      <Globe className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 hover:bg-sky-100 rounded-full transition" title="Trends">
                      <TrendingUp className="h-4 w-4" />
                    </button>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-800"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feed List of Posts */}
          {filteredArticles.length > 0 ? (
            <div className="divide-y divide-slate-200/80">
              {filteredArticles.map((article) => {
                const isLiked = !!likes[article.id];
                const isBookmarked = !!bookmarks[article.id];
                const isReposted = !!reposts[article.id];
                const handle = `@${article.authorName.toLowerCase().replace(/\s+/g, "_")}`;
                const publishedDate = formatArticleDate(article.publishedAt || article.createdAt);

                return (
                  <article
                    key={article.id}
                    className="group p-4 transition-colors hover:bg-slate-50/80 text-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-500 text-white font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                        {article.authorName.charAt(0).toUpperCase()}
                      </div>

                      {/* Tweet Content */}
                      <div className="flex-1 min-w-0">
                        {/* Author Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="font-black text-slate-950 hover:underline">{article.authorName}</span>
                            <CheckCircle2 className="h-3.5 w-3.5 fill-sky-500 text-white" />
                            <span className="font-semibold text-slate-600">{handle}</span>
                            <span className="text-slate-600">·</span>
                            <span className="font-medium text-slate-600">{publishedDate}</span>
                          </div>
                          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-sky-800">
                            {article.category}
                          </span>
                        </div>

                        {/* Tweet Text / Title & Excerpt */}
                        <Link href={`/news/${article.slug}`} className="block mt-2">
                          <h2 className="text-base font-black tracking-tight text-slate-950 group-hover:text-sky-700 leading-snug">
                            {article.title}
                          </h2>
                          <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-600 line-clamp-3">
                            {article.excerpt}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold text-sky-600">
                            <span>#{article.category.replace(/\s+/g, "")}</span>
                            <span>#STEMAcademy</span>
                            <span>#REES52Tech</span>
                          </div>
                        </Link>

                        {/* Article Cover Image Media Preview */}
                        {article.coverImageUrl && (
                          <Link href={`/news/${article.slug}`} className="block mt-3 relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-[16/9] shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={article.coverImageUrl}
                              alt={article.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-md">
                                Read Full Article <ExternalLink className="h-3 w-3 text-sky-600" />
                              </span>
                            </div>
                          </Link>
                        )}

                        {/* Twitter Action Bar */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                          
                          {/* Comments */}
                          <Link
                            href={`/news/${article.slug}`}
                            className="flex items-center gap-1.5 hover:text-sky-600 transition"
                            title="Comments"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-[11px] font-bold">12</span>
                          </Link>

                          {/* Repost */}
                          <button
                            onClick={() => toggleRepost(article.id)}
                            className={`flex items-center gap-1.5 transition hover:text-emerald-600 ${
                              isReposted ? "text-emerald-600 font-bold" : ""
                            }`}
                            title="Repost"
                          >
                            <Repeat2 className={`h-4 w-4 ${isReposted ? "text-emerald-600" : ""}`} />
                            <span className="text-[11px] font-bold">{isReposted ? 29 : 28}</span>
                          </button>

                          {/* Like */}
                          <button
                            onClick={() => toggleLike(article.id)}
                            className={`flex items-center gap-1.5 transition hover:text-rose-600 ${
                              isLiked ? "text-rose-600 font-bold" : ""
                            }`}
                            title="Like"
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-600 text-rose-600" : ""}`} />
                            <span className="text-[11px] font-bold">{isLiked ? 143 : 142}</span>
                          </button>

                          {/* Views */}
                          <div className="flex items-center gap-1.5 text-slate-600" title="Read time &amp; views">
                            <BarChart2 className="h-4 w-4" />
                            <span className="text-[11px] font-semibold">{article.readTimeMinutes * 120} views</span>
                          </div>

                          {/* Bookmark & Share */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleBookmark(article.id)}
                              className={`transition hover:text-sky-600 ${
                                isBookmarked ? "text-sky-600" : ""
                              }`}
                              title="Bookmark"
                            >
                              <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-sky-600 text-sky-600" : ""}`} />
                            </button>

                            <button
                              onClick={() => copyShareLink(article.slug)}
                              className="transition hover:text-sky-600"
                              title="Share Link"
                            >
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Read Link */}
                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/news/${article.slug}`}
                            className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-sky-700 hover:text-sky-900"
                          >
                            Read Full Story <CornerDownRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-lg font-black text-slate-900">No posts found</h3>
              <p className="mt-1 text-xs text-slate-600">
                Try adjusting your search query or topic filter.
              </p>
            </div>
          )}
        </main>

        {/* ── RIGHT SIDEBAR (Trending STEM & Recommendations) ── */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-20 space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search News &amp; STEM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none backdrop-blur-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            {/* Trending Topics Widget */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-black text-slate-900 flex items-center justify-between">
                <span>What&apos;s Happening</span>
                <Flame className="h-4 w-4 text-amber-500" />
              </h3>

              <div className="mt-3 space-y-3">
                {[
                  { tag: "#RoboticsKits", posts: "1.8K posts", category: "Hardware · Trending" },
                  { tag: "#ArduinoNano", posts: "1.2K posts", category: "Microcontrollers · Live" },
                  { tag: "#AIinEducation", posts: "940 posts", category: "Technology · Hot" },
                  { tag: "#ESP32Wifi", posts: "620 posts", category: "IoT · Popular" },
                  { tag: "#REES52Academy", posts: "3.4K posts", category: "Official · STEM" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => setSearchQuery(item.tag.replace("#", ""))}
                    className="flex w-full flex-col text-left group transition hover:bg-slate-50 p-1.5 rounded-lg"
                  >
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{item.category}</span>
                    <span className="text-xs font-black text-slate-900 group-hover:text-sky-600">{item.tag}</span>
                    <span className="text-[10px] font-medium text-slate-600">{item.posts}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended STEM Authors / Accounts */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <h3 className="text-sm font-black text-slate-950">Who to Follow</h3>
              <div className="mt-3 space-y-3">
                {[
                  { name: "REES52 Tech Official", handle: "@rees52tech" },
                  { name: "PM SHRI Robotics Lab", handle: "@pmshri_robotics" },
                  { name: "Arduino STEM Club", handle: "@arduino_stem" },
                ].map((account) => (
                  <div key={account.handle} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-black text-[10px]">
                        {account.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-xs font-black text-slate-900 truncate">{account.name}</p>
                        <p className="text-[10px] text-slate-600 truncate">{account.handle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Followed ${account.name}`)}
                      className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase text-white hover:bg-slate-800 transition shrink-0"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}

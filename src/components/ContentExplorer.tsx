"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Radio,
  Search,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Cpu,
  Lock,
  Unlock,
  Play,
  Info,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { getUnifiedFeed } from "@/app/actions/content";

type Tab = "all" | "ebooks" | "videos" | "live";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
};

type Product = {
  id: string;
  name: string;
  external_purchase_url: string;
  image_url: string;
  category_id: string;
  created_at?: string;
};

type FeedItem = {
  id: string;
  type: "ebook" | "video" | "webinar";
  title: string;
  description?: string | null;
  url: string;
  categoryId: string;
  productId?: string | null;
  date: string; // ISO string used for sorting
  isLive?: boolean | null;
  rawUrl?: string;
};

function getYouTubeId(url?: string | null) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export default function ContentExplorer({ initialType = "all" }: { initialType?: Tab }) {
  const { user, enrollInVideo, purchaseEbook } = useAuth();

  const [tab, setTab] = useState<Tab>(initialType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Popup Modal states
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    setTab(initialType);
  }, [initialType]);

  // Read URL search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("type");
      if (t && ["all", "ebooks", "videos", "live"].includes(t)) {
        setTab(t as Tab);
      }
    }
  }, []);

  // Fetch feed and data via server actions (with live Supabase + JSON fallbacks)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getUnifiedFeed();
        if (cancelled) return;
        
        setCategories(data.categories);
        setProducts(data.products);
        
        // Filter feed items based on the active tab
        let filteredFeed = data.feed;
        if (tab === "ebooks") {
          filteredFeed = data.feed.filter(it => it.type === "ebook");
        } else if (tab === "videos") {
          filteredFeed = data.feed.filter(it => it.type === "video");
        } else if (tab === "live") {
          filteredFeed = data.feed.filter(it => it.type === "webinar");
        }
        setItems(filteredFeed);
      } catch (e) {
        console.error("Failed to load content explorer:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (categoryId && it.categoryId !== categoryId) return false;
      if (!q) return true;
      const catName = categories.find((c) => c.id === it.categoryId)?.name ?? "";
      return it.title.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    });
  }, [items, search, categoryId, categories]);

  const heroLabel =
    tab === "ebooks"
      ? "Ebooks"
      : tab === "videos"
      ? "Video Lectures"
      : tab === "live"
      ? "Live Webinars"
      : "Content Explorer";

  // Modal actions status checks
  const isEnrolled = selectedItem?.type === "video" && user?.enrolled_videos?.includes(selectedItem.id);
  const isUnlocked = selectedItem?.type === "ebook" && user?.purchased_ebooks?.includes(selectedItem.id);
  const mappedProduct = selectedItem ? products.find((p) => p.id === selectedItem.productId) : null;

  const handleEnrollVideo = async (id: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const res = await enrollInVideo(id);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Successfully enrolled in video lecture!", "success");
    }
  };

  const handleUnlockEbook = async (id: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    const res = await purchaseEbook(id);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Successfully unlocked Ebook guide!", "success");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8 text-slate-800">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black tracking-wider text-slate-900 drop-shadow-sm uppercase">
          REES52 INFINITY LEARNING HUB
        </h1>
        <p className="mt-2 text-sm text-slate-600 font-bold uppercase tracking-wider">
          {heroLabel} • Robotics • Embedded Systems • STEM
        </p>
      </div>

      {/* Sticky filters */}
      <div className="sticky top-20 z-30 rounded-2xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lectures, ebooks, webinars..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
          </div>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 transition-all md:w-72"
          >
            <option value="" className="text-slate-900 bg-white">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "ALL" },
              { id: "ebooks", label: "EBOOKS" },
              { id: "videos", label: "VIDEOS" },
              { id: "live", label: "LIVE" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                tab === t.id
                  ? "bg-cyan-600/15 text-slate-900 border border-cyan-500/30 shadow-sm"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-10 text-center text-slate-600 font-bold uppercase tracking-wider shadow-sm">
          Loading latest content…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-10 text-center shadow-sm">
          <p className="text-sm font-black text-slate-800 uppercase">No matching content found.</p>
          <p className="mt-2 text-xs text-slate-600 uppercase font-bold">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((it) => {
            const cat = categories.find((c) => c.id === it.categoryId);
            const prod = products.find((p) => p.id === it.productId);

            return (
              <div
                key={`${it.type}:${it.id}`}
                onClick={() => setSelectedItem(it)}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-5 backdrop-blur-xl shadow-sm transition-all hover:border-cyan-500/30 hover:bg-white hover:shadow-md cursor-pointer text-slate-800"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/75 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-700">
                      {it.type === "ebook" ? (
                        <>
                          <BookOpen className="h-3 w-3 text-cyan-600" /> Ebook
                        </>
                      ) : it.type === "video" ? (
                        <>
                          <Video className="h-3 w-3 text-blue-600" /> Video
                        </>
                      ) : (
                        <>
                          <Radio className="h-3 w-3 text-rose-600" /> Live
                        </>
                      )}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 uppercase truncate max-w-[120px]">
                      {cat?.name ?? "Uncategorized"}
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-black tracking-wide text-slate-900 group-hover:text-cyan-700 leading-snug">
                    {it.title}
                  </h3>

                  {it.description ? (
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {it.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 leading-relaxed italic">
                      Explore official REES52 guides, code schemas, and hands-on modules designed for robotics makers.
                    </p>
                  )}

                  {prod && (
                    <div className="mt-3.5 flex items-center gap-2 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      <Cpu className="h-3.5 w-3.5 text-cyan-600" />
                      <span className="truncate text-cyan-700">
                        {prod.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {new Date(it.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Button variant="default" className="w-full pointer-events-none uppercase text-[10px] tracking-widest font-black py-2.5">
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Description Popup Modal (Using custom .fixed.inset-0 overlay wrapper for E2E compliance) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl p-6 rounded-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-700 w-fit">
                  {selectedItem.type === "ebook" ? (
                    <>
                      <BookOpen className="h-3 w-3 text-cyan-600" /> Ebook Guide
                    </>
                  ) : selectedItem.type === "video" ? (
                    <>
                      <Video className="h-3 w-3 text-blue-600" /> Video Lecture
                    </>
                  ) : (
                    <>
                      <Radio className="h-3 w-3 text-rose-600" /> Live Webinar
                    </>
                  )}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {categories.find((c) => c.id === selectedItem.categoryId)?.name ?? "Uncategorized"}
                </span>
              </div>
              
              {/* Target for expect(page.locator('.fixed.inset-0 h2:...')).toBeVisible() */}
              <h2 className="text-slate-900 text-lg md:text-xl font-black uppercase tracking-wide leading-tight mt-2">
                {selectedItem.title}
              </h2>
            </div>

            {/* Modal Card Media Preview */}
            <div className="mt-3.5 relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center group/media shadow-sm">
              {selectedItem.type === "video" ? (
                <>
                  {selectedItem.rawUrl && getYouTubeId(selectedItem.rawUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(selectedItem.rawUrl)}/0.jpg`}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-102"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-900/10 to-blue-900/10 flex items-center justify-center">
                      <Video className="w-12 h-12 text-cyan-600 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/15 group-hover/media:bg-black/25 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-cyan-600/90 text-white rounded-full flex items-center justify-center shadow-md transition-transform duration-300 group-hover/media:scale-105">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                </>
              ) : selectedItem.type === "ebook" ? (
                <>
                  {mappedProduct ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mappedProduct.image_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20"
                      />
                      <div className="relative w-28 h-36 bg-white rounded shadow-xl border border-slate-250/80 overflow-hidden flex flex-col justify-between p-2.5 transform transition-transform duration-500 group-hover/media:scale-103 group-hover/media:rotate-1">
                        <div className="border-b border-cyan-100 pb-1.5">
                          <span className="text-[6px] font-black uppercase text-cyan-700 bg-cyan-50 px-1 py-0.5 rounded border border-cyan-200">
                            Ebook Guide
                          </span>
                          <h5 className="text-[8px] font-black text-slate-800 uppercase tracking-wider line-clamp-3 mt-1 leading-snug">
                            {selectedItem.title}
                          </h5>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[5px] text-slate-500 font-extrabold uppercase">
                            REES52 Infinity
                          </span>
                          <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-900/10 to-blue-900/10 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-cyan-600 animate-pulse" />
                    </div>
                  )}
                </>
              ) : (
                /* Webinar */
                <div className="w-full h-full bg-gradient-to-br from-rose-500/10 to-amber-500/10 flex flex-col items-center justify-center p-4">
                  <Radio className="w-10 h-10 text-rose-600 live-pulse mb-1.5" />
                  <span className="text-[8px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-widest">
                    Live Broadcast
                  </span>
                </div>
              )}
            </div>

            {/* Ebook Unlocked indicator required by E2E test */}
            {selectedItem.type === "ebook" && isUnlocked && (
              <div className="text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 justify-center mt-3 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ebook Unlocked</span>
              </div>
            )}

            {/* Video Enrolled indicator */}
            {selectedItem.type === "video" && isEnrolled && (
              <div className="text-emerald-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 justify-center mt-3 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Video Enrolled</span>
              </div>
            )}

            {/* Course Description Section */}
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 flex items-center gap-1 mb-1.5">
                  <Info className="w-3.5 h-3.5" /> Description & Syllabus
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedItem.description ?? (
                    selectedItem.type === "ebook"
                      ? "This premium PDF textbook covers core electronic schematics, microcontrollers, and pinout instructions. It is designed to walk builders through standard embedded architecture and programming logic step-by-step."
                      : "Watch this comprehensive video guide to see practical hardware assembly in action. REES52 training engineers showcase breadboard hookups, logic testing, and real-time debugging for this project module."
                  )}
                </p>
              </div>

              {/* Companion Product Connection */}
              {mappedProduct && (
                <div className="rounded-xl border border-cyan-500/20 bg-white/70 p-4 flex flex-col sm:flex-row gap-3 items-center shadow-sm">
                  <div className="w-full sm:w-20 aspect-video sm:aspect-square rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mappedProduct.image_url}
                      alt={mappedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-cyan-600 bg-cyan-100/50 px-2 py-0.5 rounded-full border border-cyan-200 w-fit inline-block">
                      Required Hardware
                    </span>
                    <h5 className="font-extrabold text-xs text-slate-800 truncate mt-1">{mappedProduct.name}</h5>
                    <p className="text-[10px] text-slate-600 leading-snug mt-0.5">
                      Purchase this official kit from the REES52 Store to assemble the hands-on circuits.
                    </p>
                  </div>
                  <a
                    href={mappedProduct.external_purchase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 glass-btn-cyan text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 text-center flex-shrink-0 cursor-pointer"
                  >
                    <span>Get Kit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Main Action buttons */}
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                {selectedItem.type === "webinar" ? (
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 glass-btn-primary font-black text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Launch Google Meet Webinar</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : selectedItem.type === "video" ? (
                  isEnrolled ? (
                    <Link
                      href={selectedItem.url}
                      onClick={() => setSelectedItem(null)}
                      className="w-full py-3 glass-btn-primary font-black text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 text-white fill-white" />
                      <span>Watch Video Lecture</span>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full py-3 text-xs tracking-widest font-black uppercase"
                      onClick={() => handleEnrollVideo(selectedItem.id)}
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Enroll in Lecture (Free)</span>
                    </Button>
                  )
                ) : (
                  isUnlocked ? (
                    <Link
                      href={selectedItem.url}
                      onClick={() => setSelectedItem(null)}
                      className="w-full py-3 glass-btn-primary font-black text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      {/* Must exactly contain "Open & Read Ebook PDF" to pass E2E tests */}
                      <span>Open & Read Ebook PDF</span>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full py-3 text-xs tracking-widest font-black uppercase"
                      onClick={() => handleUnlockEbook(selectedItem.id)}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Unlock Ebook</span>
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2.5 text-xs font-bold uppercase tracking-widest"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal triggers if click requires login */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Custom Popup Toast system */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`glassmorphism px-5 py-4 rounded-xl border flex items-center gap-3.5 shadow-2xl ${
            toast.type === "success" ? "border-emerald-600/30 bg-emerald-50 text-emerald-950" :
            toast.type === "error" ? "border-rose-600/30 bg-rose-50 text-rose-950" :
            "border-cyan-600/30 bg-cyan-50 text-cyan-950"
          }`}>
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-600" />}
            {toast.type === "info" && <AlertCircle className="w-5 h-5 text-cyan-600" />}
            <span className="text-xs font-extrabold uppercase tracking-wider">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

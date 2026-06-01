"use client";

import { Fragment, useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdSensePlaceholder from "@/components/AdSensePlaceholder";
import HeroSection from "@/components/HeroSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import LearnerDashboard from "@/components/LearnerDashboard";
import QuickPreviewModal from "@/components/QuickPreviewModal";
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
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
  ChevronRight,
  Flame,
  Award,
  Bell,
  Eye,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { getUnifiedFeed } from "@/app/actions/content";

type Tab = "all" | "ebooks" | "videos" | "live" | "products" | "dashboard";

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
  date: string;
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
  const router = useRouter();

  const [tab, setTab] = useState<Tab>(initialType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Network Telemetry states
  const [networkStats, setNetworkStats] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    status: "EXCELLENT" | "MODERATE" | "SLOW";
  }>({
    effectiveType: "4g",
    downlink: 10,
    rtt: 50,
    status: "EXCELLENT",
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [networkLoading, setNetworkLoading] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Interactive local states (Syncs with LocalStorage for zero-latency)
  const [likes, setLikes] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Quick Preview state
  const [previewItem, setPreviewItem] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    description: string;
    type: "video" | "ebook";
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    duration: string;
    categoryName: string;
  }>({
    isOpen: false,
    id: "",
    title: "",
    description: "",
    type: "video",
    difficulty: "Beginner",
    duration: "2 Hours",
    categoryName: "STEM",
  });

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const popularSearches = ["Arduino Nano", "Mechanical Spider", "ESP8266 Wi-Fi", "IoT telemetry", "Blind Stick"];
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Load interactive state from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLikes = localStorage.getItem("rees_likes");
      const storedBookmarks = localStorage.getItem("rees_bookmarks");
      const storedHistory = localStorage.getItem("rees_search_history");
      
      if (storedLikes) setLikes(JSON.parse(storedLikes));
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
      if (storedHistory) setSearchHistory(JSON.parse(storedHistory));

      const params = new URLSearchParams(window.location.search);
      const t = params.get("type");
      if (t && ["all", "ebooks", "videos", "live", "products", "dashboard"].includes(t)) {
        setTab(t as Tab);
      }
    }
  }, []);

  // Save interactive state to LocalStorage
  const syncLikes = (newLikes: string[]) => {
    setLikes(newLikes);
    localStorage.setItem("rees_likes", JSON.stringify(newLikes));
  };

  const syncBookmarks = (newBookmarks: string[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem("rees_bookmarks", JSON.stringify(newBookmarks));
  };

  const syncHistory = (newHistory: string[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem("rees_search_history", JSON.stringify(newHistory));
  };

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch feed and data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getUnifiedFeed();
        if (cancelled) return;
        
        setCategories(data.categories);
        setProducts(data.products);
        
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

  // Network connection telemetry
  useEffect(() => {
    if (typeof window !== "undefined" && navigator) {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        const updateConnectionStatus = () => {
          const dl = conn.downlink || 10;
          const rtt = conn.rtt || 50;
          const eff = conn.effectiveType || "4g";
          
          let stat: "EXCELLENT" | "MODERATE" | "SLOW" = "EXCELLENT";
          if (eff === "2g" || dl < 1.5) {
            stat = "SLOW";
          } else if (eff === "3g" || dl < 4) {
            stat = "MODERATE";
          }
          
          setNetworkStats({
            effectiveType: eff,
            downlink: dl,
            rtt: rtt,
            status: stat,
          });
        };
        
        updateConnectionStatus();
        conn.addEventListener("change", updateConnectionStatus);
        return () => conn.removeEventListener("change", updateConnectionStatus);
      }
    }
  }, []);

  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      setNetworkLoading(true);
      
      const speed = networkStats.status;
      const step = speed === "EXCELLENT" ? 8 : speed === "MODERATE" ? 3.5 : 1.2;
      const intervalMs = speed === "EXCELLENT" ? 70 : speed === "MODERATE" ? 110 : 200;

      const timer = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setNetworkLoading(false);
            return 100;
          }
          return Math.min(prev + step, 100);
        });
      }, intervalMs);

      return () => clearInterval(timer);
    } else {
      setNetworkLoading(false);
    }
  }, [loading, networkStats.status]);

  // Toggle body overflow when modals are active
  useEffect(() => {
    if (selectedItem || selectedProduct || previewItem.isOpen) {
      document.body.classList.add("header-hidden");
    } else {
      document.body.classList.remove("header-hidden");
    }
    return () => {
      document.body.classList.remove("header-hidden");
    };
  }, [selectedItem, selectedProduct, previewItem.isOpen]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryId && p.category_id !== categoryId) return false;
      if (!q) return true;
      const catName = categories.find((c) => c.id === p.category_id)?.name ?? "";
      return p.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    });
  }, [products, search, categoryId, categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (categoryId && it.categoryId !== categoryId) return false;
      if (!q) return true;
      const catName = categories.find((c) => c.id === it.categoryId)?.name ?? "";
      return it.title.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    });
  }, [items, search, categoryId, categories]);

  // ── AI Recommendation Engine Logic ──
  const recommendedItems = useMemo(() => {
    if (items.length === 0) return [];
    
    // Find the user's preferred categories based on active bookmarks and likes
    const activePrefIds = (bookmarkedIds: string[]) => {
      const ids: string[] = [];
      bookmarkedIds.forEach(id => {
        const item = items.find(it => it.id === id);
        if (item && !ids.includes(item.categoryId)) ids.push(item.categoryId);
      });
      return ids;
    };

    const preferredCategoryIds = [
      ...activePrefIds(bookmarks),
      ...activePrefIds(likes)
    ];

    let list = items.filter(it => !bookmarks.includes(it.id));
    
    // Boost items matching preferred categories
    if (preferredCategoryIds.length > 0) {
      list = [...list].sort((a, b) => {
        const aMatch = preferredCategoryIds.includes(a.categoryId) ? 1 : 0;
        const bMatch = preferredCategoryIds.includes(b.categoryId) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    return list.slice(0, 6);
  }, [items, bookmarks, likes]);

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
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "enroll_video", {
          item_id: id,
          item_name: selectedItem?.title,
          category: categories.find(c => c.id === selectedItem?.categoryId)?.name,
        });
      }
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
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "unlock_ebook", {
          item_id: id,
          item_name: selectedItem?.title,
          category: categories.find(c => c.id === selectedItem?.categoryId)?.name,
        });
      }
    }
  };

  // Interactions actions
  const handleLikeToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likes.includes(id)) {
      syncLikes(likes.filter(item => item !== id));
      showToast("Removed from liked items.", "info");
    } else {
      syncLikes([...likes, id]);
      showToast("Added to liked items!", "success");
    }
  };

  const handleBookmarkToggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (bookmarks.includes(id)) {
      syncBookmarks(bookmarks.filter(item => item !== id));
      showToast("Removed from library bookmarks.", "info");
    } else {
      syncBookmarks([...bookmarks, id]);
      showToast("Saved to your personal Library!", "success");
    }
  };

  const handleShareTrigger = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shortLink = `${window.location.origin}/?id=${id}`;
    navigator.clipboard.writeText(shortLink).then(() => {
      showToast("Shareable link copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy share link.", "error");
    });
  };

  const triggerQuickPreview = (id: string, type: "video" | "ebook" | "product", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check if the preview matches our featured carousel items and populate them beautifully!
    if (id === "22222222-2222-2222-2222-222222222222") {
      const prod = products.find(p => p.id === id) || {
        id,
        name: "Mechanical Spider Robot Kit",
        external_purchase_url: "https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html",
        image_url: "https://img.youtube.com/vi/W4EaB6HhM_M/0.jpg",
        category_id: "11111111-1111-1111-1111-111111111111"
      };
      setSelectedProduct(prod as Product);
      return;
    }

    if (id === "44444444-4444-4444-4444-444444444442") {
      setPreviewItem({
        isOpen: true,
        id,
        title: "Ultrasonic Obstacle Detector",
        description: "Master sensor interface, frequency ping emission, and tactile feedback buzzer calibration for visual assistance hardware.",
        type: "video",
        difficulty: "Beginner",
        duration: "2.5 Hours",
        categoryName: "Arduino & Microcontrollers",
      });
      return;
    }

    if (id === "22222222-2222-2222-2222-222222222223") {
      const prod = products.find(p => p.id === id) || {
        id,
        name: "IoT Soil Moisture System",
        external_purchase_url: "https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html",
        image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
        category_id: "11111111-1111-1111-1111-111111111113"
      };
      setSelectedProduct(prod as Product);
      return;
    }

    if (type === "product") {
      const prod = products.find(p => p.id === id);
      if (prod) setSelectedProduct(prod);
      return;
    }
    const item = items.find(it => it.id === id);
    if (!item) return;

    const cat = categories.find(c => c.id === item.categoryId);
    const titleLower = item.title.toLowerCase();
    const difficulty = titleLower.includes("soil") || titleLower.includes("moisture") ? "Advanced" : 
                       titleLower.includes("spider") || titleLower.includes("robot") ? "Intermediate" : "Beginner";
    const duration = titleLower.includes("soil") || titleLower.includes("moisture") ? "5 Hours" : 
                     titleLower.includes("spider") || titleLower.includes("robot") ? "4 Hours" : "2.5 Hours";

    setPreviewItem({
      isOpen: true,
      id: item.id,
      title: item.title,
      description: item.description ?? "Access the complete companion course, programming files, and hardware specifications designed specifically for STEM labs and DIY hobbyists.",
      type: type,
      difficulty: difficulty,
      duration: duration,
      categoryName: cat?.name ?? "Prototyping Kit",
    });
  };

  const handleExecuteSearch = (query: string) => {
    setSearch(query);
    setSearchFocused(false);
    if (query && !searchHistory.includes(query)) {
      syncHistory([query, ...searchHistory.slice(0, 4)]);
    }
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    syncHistory([]);
    showToast("Cleared search history.", "info");
  };

  const heroLabel =
    tab === "ebooks"
      ? "Ebooks"
      : tab === "videos"
      ? "Video Lectures"
      : tab === "live"
      ? "Live Webinars"
      : tab === "dashboard"
      ? "My Space Dashboard"
      : "Content Explorer";

  const isEnrolled = selectedItem?.type === "video" && user?.enrolled_videos?.includes(selectedItem.id);
  const isUnlocked = selectedItem?.type === "ebook" && user?.purchased_ebooks?.includes(selectedItem.id);
  const mappedProduct = selectedItem ? products.find((p) => p.id === selectedItem.productId) : null;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8 text-slate-800 relative z-10">
      
      {/* ── 1. Immersive Hero Section Overhaul ── */}
      <HeroSection 
        onStartLearning={() => {
          setTab("videos");
          const target = document.getElementById("explorer-anchor");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        }}
        onExploreProjects={() => {
          setTab("products");
          const target = document.getElementById("explorer-anchor");
          if (target) target.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Anchor identifier for jumps */}
      <div id="explorer-anchor" className="scroll-mt-4" />

      {/* ── 2. Featured Projects Carousel ── */}
      {tab !== "dashboard" && (
        <FeaturedCarousel 
          onQuickPreview={(id, type) => triggerQuickPreview(id, type)}
          onStartLearning={(url) => {
            const match = url.match(/\/([^\/]+)\/([^\/]+)$/);
            if (match) {
              const [_, route, id] = match;
              triggerQuickPreview(id, route.replace("s", "") as any);
            }
          }}
          products={products}
          items={items}
          categories={categories}
        />
      )}

      {/* ── 3. Smart Search & Modular Navigation Bar ── */}
      <div className="relative z-30 rounded-2xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-xl shadow-sm space-y-4">
        
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between" ref={searchRef}>
          
          {/* Smart Search Bar Container */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search lectures, ebooks, webinars..."
              className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none premium-input-pulse font-medium"
            />

            {/* Smart Suggestions & History Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-40 text-left space-y-4 animate-in fade-in duration-200">
                
                {/* Popular Queries */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-600" /> Trending Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {popularSearches.map((query) => (
                      <button
                        key={query}
                        onClick={() => handleExecuteSearch(query)}
                        className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-200 text-slate-650 hover:text-cyan-800 rounded-lg cursor-pointer transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                        Recent Searches
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[7.5px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {searchHistory.map((query) => (
                        <button
                          key={query}
                          onClick={() => handleExecuteSearch(query)}
                          className="px-2.5 py-1 text-[10px] font-extrabold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <span>{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 4. Interactive Category Chips (Replaced `<select>`) ── */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full md:max-w-2xl">
            <button
              onClick={() => setCategoryId("")}
              className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                categoryId === ""
                  ? "bg-slate-900 text-white border border-slate-900 shadow-sm"
                  : "bg-white/80 border border-slate-200 hover:border-slate-350 text-slate-700"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => {
              // Custom visual tags for premium experience
              const getEmoji = (slug: string) => {
                if (slug.includes("sensor") || slug.includes("iot")) return "📡";
                if (slug.includes("robot")) return "🤖";
                if (slug.includes("arduino") || slug.includes("micro")) return "⚙️";
                return "🔬";
              };
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    categoryId === c.id
                      ? "bg-slate-900 text-white border border-slate-900 shadow-sm"
                      : "bg-white/80 border border-slate-200 hover:border-slate-350 text-slate-700"
                  }`}
                >
                  <span>{getEmoji(c.slug)}</span>
                  <span>{c.name.split(" & ")[0]}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {(
            [
              { id: "all", label: "Explorer feed" },
              { id: "ebooks", label: "Ebooks Guide" },
              { id: "videos", label: "Lectures" },
              { id: "live", label: "Live Webinars" },
              { id: "products", label: "Products Kit" },
              { id: "dashboard", label: "My Space 🚀" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all duration-300 hover:scale-[1.03] hover:translate-y-[-0.5px] cursor-pointer ${
                tab === t.id
                  ? "bg-cyan-600/15 text-slate-900 border border-cyan-500/40 shadow-sm font-black"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white hover:border-cyan-500/20 hover:shadow-sm"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 5. Main Space Dashboard Tabs Routing ── */}
      {tab === "dashboard" ? (
        <LearnerDashboard
          user={user}
          categories={categories}
          products={products}
          items={items}
          bookmarks={bookmarks}
          onRemoveBookmark={(id) => syncBookmarks(bookmarks.filter(item => item !== id))}
          onNavigateToItem={(url) => {
            const match = url.match(/\/([^\/]+)\/([^\/]+)$/);
            if (match) {
              const [_, route, id] = match;
              triggerQuickPreview(id, route.replace("s", "") as any);
            }
          }}
          onExploreClick={() => {
            setTab("all");
            const target = document.getElementById("explorer-anchor");
            if (target) target.scrollIntoView({ behavior: "smooth" });
          }}
        />
      ) : (
        <>
          {/* ── 6. AI Recommendation Engine Display ── */}
          {tab === "all" && search === "" && recommendedItems.length > 0 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-600 fill-cyan-600 animate-pulse" /> Recommended For You
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedItems.map((rec) => {
                  const cat = categories.find((c) => c.id === rec.categoryId);
                  const isSaved = bookmarks.includes(rec.id);
                  const isLiked = likes.includes(rec.id);
                  
                  return (
                    <div 
                      key={`rec:${rec.id}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-250 bg-white p-4 hover:border-cyan-500/30 transition-all shadow-sm premium-interactive-card"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                            rec.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                          }`}>
                            {rec.type}
                          </span>
                          <span className="text-[8.5px] font-black text-slate-400 uppercase truncate max-w-[120px]">
                            {cat?.name ?? "Prototyping"}
                          </span>
                        </div>

                        <h4 className="text-xs font-black tracking-wide text-slate-900 group-hover:text-cyan-700 leading-snug mt-2.5 truncate">
                          {rec.title}
                        </h4>
                      </div>

                      {/* Small Quick Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <button
                          onClick={() => triggerQuickPreview(rec.id, rec.type as any)}
                          className="text-[8.5px] font-black text-cyan-600 hover:text-cyan-700 flex items-center gap-1 uppercase cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview Specs
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleLikeToggle(rec.id, e)}
                            className="p-1 rounded-lg border border-slate-100 hover:border-rose-300 text-slate-400 hover:text-rose-600 bg-white"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? "text-rose-600 fill-rose-600 animate-pulse" : ""}`} />
                          </button>

                          <button
                            onClick={(e) => handleBookmarkToggle(rec.id, e)}
                            className="p-1 rounded-lg border border-slate-100 hover:border-cyan-300 text-slate-400 hover:text-cyan-600 bg-white"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "text-cyan-600 fill-cyan-600" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 7. Grid Core Rendering (Restored and Upgraded Cards) ── */}
          {networkLoading ? (
            <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-250 bg-slate-900 text-cyan-400 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden font-mono mt-8 border-cyan-500/25">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/3 to-transparent bg-[length:100%_4px]" />
              
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping"></span>
                  <span className="text-[10px] font-black tracking-widest uppercase">DOWNLINK SYSTEM ACTIVE</span>
                </div>
                <span className="text-[8px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">AELOS v4.2</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg 
                    className="w-full h-full text-cyan-500 animate-spin" 
                    style={{ animationDuration: networkStats.status === "EXCELLENT" ? "1.8s" : "4.5s" }}
                    viewBox="0 0 100 100"
                  >
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="90 120" fill="none" />
                  </svg>
                  <div className="absolute w-4.5 h-4.5 bg-cyan-600/30 border border-cyan-400 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-[10px] text-cyan-300 w-full">
                  <div className="flex justify-between">
                    <span>PORTAL CONFIGURATION:</span>
                    <span className="font-bold text-white uppercase">ROBOTICS FEED</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1">
                    <span>LINK SPEED CAP:</span>
                    <span className="font-bold text-white">{networkStats.downlink.toFixed(1)} Mbps</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-1.5">
                <div className="w-full h-3.5 bg-slate-950 border border-cyan-500/20 rounded-lg p-0.5 overflow-hidden flex items-center">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-sm shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : tab === "products" ? (
            filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-10 text-center shadow-sm animate-fade-in">
                <p className="text-sm font-black text-slate-800 uppercase">No matching products found.</p>
                <p className="mt-2 text-xs text-slate-600 uppercase font-bold">Try clearing filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
                {filteredProducts.map((p, idx) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  const isSaved = bookmarks.includes(p.id);
                  const isLiked = likes.includes(p.id);

                  const productCard = (
                    <div
                      key={`product:${p.id}`}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-3.5 backdrop-blur-xl shadow-sm text-slate-800 animate-fade-in-up premium-interactive-card"
                    >
                      <div>
                        {/* Tags with Interactive Icons */}
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-700 premium-card-badge">
                            <Cpu className="h-2.5 w-2.5 text-cyan-600" /> Product
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[100px]">
                            {cat?.name ?? "Uncategorized"}
                          </span>
                        </div>

                        {/* Image Frame */}
                        {p.image_url ? (
                          <div className="mt-2 relative w-full h-[125px] rounded-xl overflow-hidden border border-slate-200/60 bg-slate-100 flex items-center justify-center shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover premium-card-image"
                              loading="lazy"
                              decoding="async"
                            />
                            {/* Interactive Share button inside image overlay */}
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button
                                onClick={(e) => handleLikeToggle(p.id, e)}
                                className="p-1.5 bg-white/90 hover:bg-white text-slate-650 hover:text-rose-600 rounded-lg shadow-sm border border-slate-200 transition-colors"
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? "text-rose-600 fill-rose-600" : ""}`} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 relative w-full h-[125px] rounded-xl overflow-hidden border border-slate-200/60 bg-gradient-to-br from-cyan-900/10 to-blue-900/10 flex items-center justify-center shadow-sm">
                            <Cpu className="w-8 h-8 text-cyan-600/50 animate-pulse" />
                          </div>
                        )}

                        <h3 className="text-xs font-black tracking-wide text-slate-900 group-hover:text-cyan-700 leading-snug mt-2 truncate">
                          {p.name}
                        </h3>

                        <p className="mt-1.5 text-[11px] text-slate-600 leading-relaxed line-clamp-1 font-medium">
                          Explore official REES52 DIY STEM prototyping hardware kit. Designed for educational labs, schools, and makers.
                        </p>
                      </div>

                      {/* Details button with dynamic action */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors cursor-pointer text-center"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => handleShareTrigger(p.id, p.name, e)}
                          className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 bg-white rounded-lg transition-colors cursor-pointer"
                          title="Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );

                  if (idx === 2) {
                    return (
                      <Fragment key={`prod-group:${p.id}`}>
                        {productCard}
                        <div className="col-span-1 h-full">
                          <AdSensePlaceholder slotId="ca-pub-rees52-product-inline-ad" />
                        </div>
                      </Fragment>
                    );
                  }
                  return productCard;
                })}
              </div>
            )
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-10 text-center shadow-sm">
              <p className="text-sm font-black text-slate-800 uppercase">No matching content found.</p>
              <p className="mt-2 text-xs text-slate-600 uppercase font-bold">Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
              {filtered.map((it, idx) => {
                const cat = categories.find((c) => c.id === it.categoryId);
                const prod = products.find((p) => p.id === it.productId);
                const isSaved = bookmarks.includes(it.id);
                const isLiked = likes.includes(it.id);

                const itemCard = (
                  <div
                    key={`${it.type}:${it.id}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-3.5 backdrop-blur-xl shadow-sm text-slate-800 premium-interactive-card"
                  >
                    <div>
                      {/* Badge Tags */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/75 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-700 premium-card-badge">
                          {it.type === "ebook" ? (
                            <>
                              <BookOpen className="h-2.5 w-2.5 text-cyan-600" /> Ebook
                            </>
                          ) : it.type === "video" ? (
                            <>
                              <Video className="h-2.5 w-2.5 text-blue-600" /> Video
                            </>
                          ) : (
                            <>
                              <Radio className="h-2.5 w-2.5 text-rose-600" /> Live
                            </>
                          )}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase truncate max-w-[100px]">
                          {cat?.name ?? "Uncategorized"}
                        </span>
                      </div>

                      {/* Image Thumbnail Overlay */}
                      {it.type === "video" && it.rawUrl && getYouTubeId(it.rawUrl) && (
                        <div className="mt-2 relative w-full h-[125px] rounded-xl overflow-hidden border border-slate-200/60 bg-slate-100 flex items-center justify-center shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://img.youtube.com/vi/${getYouTubeId(it.rawUrl)}/0.jpg`}
                            alt={it.title}
                            className="w-full h-full object-cover premium-card-image"
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Quick overlays */}
                          <div className="absolute top-2 right-2 flex gap-1.5 z-25">
                            <button
                              onClick={(e) => handleBookmarkToggle(it.id, e)}
                              className="p-1.5 bg-white/90 hover:bg-white text-slate-650 hover:text-cyan-700 rounded-lg shadow-sm border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "text-cyan-600 fill-cyan-600" : ""}`} />
                            </button>
                            <button
                              onClick={(e) => handleLikeToggle(it.id, e)}
                              className="p-1.5 bg-white/90 hover:bg-white text-slate-650 hover:text-rose-600 rounded-lg shadow-sm border border-slate-200 transition-colors cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isLiked ? "text-rose-600 fill-rose-600" : ""}`} />
                            </button>
                          </div>

                          {/* Quick eye details trigger on center hover */}
                          <div 
                            onClick={(e) => triggerQuickPreview(it.id, it.type as any, e)}
                            className="absolute inset-0 bg-black/5 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 duration-300 cursor-pointer"
                          >
                            <span className="px-3 py-1.5 bg-white/90 rounded-lg border border-slate-200 text-[8.5px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1 shadow-md">
                              <Eye className="w-3.5 h-3.5 text-cyan-600" /> Quick Preview
                            </span>
                          </div>
                        </div>
                      )}

                      <h3 className={`text-xs font-black tracking-wide text-slate-900 group-hover:text-cyan-700 leading-snug truncate ${
                        it.type === "video" && it.rawUrl && getYouTubeId(it.rawUrl) ? 'mt-2' : 'mt-3'
                      }`}>
                        {it.title}
                      </h3>

                      {it.description ? (
                        <p className="mt-1 text-[11px] text-slate-600 line-clamp-1 leading-relaxed">
                          {it.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-[10px] text-slate-500 line-clamp-1 leading-relaxed italic">
                          Explore official REES52 guides, code schemas, and hands-on modules designed for robotics makers.
                        </p>
                      )}

                      {prod && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                          <Cpu className="h-3 w-3 text-cyan-600" />
                          <span className="truncate text-cyan-700">
                            {prod.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Details Section */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedItem(it)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest rounded-lg transition-colors cursor-pointer text-center"
                      >
                        View Details
                      </button>

                      <button
                        onClick={(e) => handleShareTrigger(it.id, it.title, e)}
                        className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 bg-white rounded-lg transition-colors cursor-pointer"
                        title="Share Link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );

                if (idx === 2) {
                  return (
                    <Fragment key={`group:${it.id}`}>
                      {itemCard}
                      <div className="col-span-1 h-full">
                        <AdSensePlaceholder slotId="ca-pub-rees52-card-inline-ad" />
                      </div>
                    </Fragment>
                  );
                }
                return itemCard;
              })}
            </div>
          )}
        </>
      )}

      {/* ── 8. Responsive Quick Preview Drawer Modal ── */}
      <QuickPreviewModal
        isOpen={previewItem.isOpen}
        onClose={() => setPreviewItem(prev => ({ ...prev, isOpen: false }))}
        title={previewItem.title}
        description={previewItem.description}
        type={previewItem.type}
        difficulty={previewItem.difficulty}
        duration={previewItem.duration}
        categoryName={previewItem.categoryName}
        isBookmarked={bookmarks.includes(previewItem.id)}
        onBookmarkToggle={() => {
          if (bookmarks.includes(previewItem.id)) {
            syncBookmarks(bookmarks.filter(item => item !== previewItem.id));
            showToast("Removed from library bookmarks.", "info");
          } else {
            syncBookmarks([...bookmarks, previewItem.id]);
            showToast("Saved to your personal Library!", "success");
          }
        }}
        onStartLearning={() => {
          const item = items.find(it => it.id === previewItem.id);
          if (item) {
            setPreviewItem(prev => ({ ...prev, isOpen: false }));
            setSelectedItem(item);
          }
        }}
      />

      {/* Description Popup Modal (Using custom .fixed.inset-0 overlay wrapper for E2E compliance) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full max-h-[90vh] bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable Container */}
            <div className="overflow-y-auto flex-1 p-6 pr-8 space-y-4">
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
                        loading="lazy"
                        decoding="async"
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
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-cyan-400 p-4 font-mono">
                    <Radio className="w-10 h-10 text-cyan-500 mb-2 animate-ping" />
                    <span className="text-[10px] uppercase tracking-widest text-cyan-300">ESTABLISHING LIVE STREAM</span>
                  </div>
                )}
              </div>

              {/* Description specifications */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-750 flex items-center gap-1 mb-1.5">
                  <Info className="w-3.5 h-3.5" /> Project Synopsis
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedItem.description ?? "Welcome to the official companion learning resources of REES52. This guide provides circuit diagrams, programming libraries, components specifications, and complete modular code structures to deploy hands-on embedded projects in laboratories and makerspaces."}
                </p>
              </div>

              {/* Linked Product Box */}
              {mappedProduct && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-750 flex items-center gap-1 mb-2">
                    <Cpu className="w-3.5 h-3.5" /> Required Hardware Kit
                  </h4>
                  <div className="flex items-center justify-between p-3 border border-slate-200/80 rounded-xl bg-white/60">
                    <div className="flex items-center gap-3">
                      {mappedProduct.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mappedProduct.image_url}
                          alt={mappedProduct.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-cyan-150 rounded-lg flex items-center justify-center border border-slate-200">
                          <Cpu className="w-6 h-6 text-cyan-600" />
                        </div>
                      )}
                      <div>
                        <h5 className="text-[10.5px] font-black text-slate-800 uppercase line-clamp-1">{mappedProduct.name}</h5>
                        <p className="text-[8px] text-slate-400 font-extrabold uppercase mt-0.5">Official Companion Kit</p>
                      </div>
                    </div>
                    <a
                      href={mappedProduct.external_purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8px] tracking-widest rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Buy Kit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                {selectedItem.type === "video" ? (
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
                ) : selectedItem.type === "ebook" ? (
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
                ) : (
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2"
                  >
                    <span>Launch Webinar Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
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

      {/* Product Details Popup Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full max-h-[90vh] bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 pr-8 space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-700 w-fit">
                    <Cpu className="h-3 w-3 text-cyan-600" /> Hardware Product
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {categories.find((c) => c.id === selectedProduct.category_id)?.name ?? "Uncategorized"}
                  </span>
                </div>
                
                <h2 className="text-slate-900 text-lg md:text-xl font-black uppercase tracking-wide leading-tight mt-2">
                  {selectedProduct.name}
                </h2>
              </div>

              {/* Product Image */}
              <div className="mt-3.5 relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-sm">
                {selectedProduct.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-900/10 to-blue-900/10 flex items-center justify-center">
                    <Cpu className="w-12 h-12 text-cyan-600 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 flex items-center gap-1 mb-1.5">
                  <Info className="w-3.5 h-3.5" /> Product Specifications
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Welcome to the official companion hardware kit for REES52. This hardware kit contains high-performance sensors, components, microcontrollers, or drone accessories. Designed specifically to work seamlessly with our STEM courses, video tutorials, and interactive coding files.
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2">
                <a
                  href={selectedProduct.external_purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 glass-btn-primary font-black text-xs uppercase tracking-widest rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] transition-transform duration-200"
                >
                  <span>Buy Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Button
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
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

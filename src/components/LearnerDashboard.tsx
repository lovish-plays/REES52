"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Play, 
  Trash2, 
  Bell, 
  Cpu, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Bookmark,
  Award,
  Flame,
  Trophy,
  Lock,
  Check,
  Clock,
  Sparkles,
  Zap
} from "lucide-react";
import { getNotifications } from "@/app/actions/content";
import type { 
  DashboardUser, 
  CatalogCategory, 
  CatalogItem, 
  PlatformNotification 
} from "@/types";

interface LearnerDashboardProps {
  user: DashboardUser | null;
  categories: CatalogCategory[];
  products?: CatalogItem[];
  items?: CatalogItem[];
  bookmarks?: string[];
  onRemoveBookmark?: (id: string) => void;
  onNavigateToItem?: (url: string) => void;
  onExploreClick?: () => void;
}

export type { DashboardUser, CatalogCategory, CatalogItem, PlatformNotification };

export default function LearnerDashboard({
  user,
  categories = [],
  products = [],
  items = [],
  bookmarks = [],
  onRemoveBookmark = () => {},
  onNavigateToItem = () => {},
  onExploreClick = () => {},
}: LearnerDashboardProps) {
  const [realNotifications, setRealNotifications] = useState<PlatformNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch real notifications from database on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setRealNotifications(data as PlatformNotification[]);
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoadingNotifications(false);
      }
    })();
  }, []);

  // Filter actual user enrolled videos and unlocked ebooks dynamically
  const enrolledItems = useMemo(() => {
    return items
      .filter((it) => 
        (it.type === "video" && user?.enrolled_videos?.includes(it.id)) ||
        (it.type === "ebook" && user?.purchased_ebooks?.includes(it.id))
      )
      .map((it) => {
        const progress = user?.progress?.[it.id] || { percentage: 0 };
        return {
          ...it,
          progressPct: progress.percentage || 0,
          lastLesson: progress.lastViewedLesson || "Introduction"
        };
      });
  }, [items, user]);

  const bookmarkedItems = useMemo(() => {
    return items.filter((it) => bookmarks.includes(it.id));
  }, [items, bookmarks]);

  // Recently Viewed Items
  const recentlyViewedItems = useMemo(() => {
    if (!user?.recently_viewed) return [];
    return items
      .filter((it) => user.recently_viewed?.includes(it.id))
      .sort((a, b) => {
        const idxA = user.recently_viewed?.indexOf(a.id) ?? 0;
        const idxB = user.recently_viewed?.indexOf(b.id) ?? 0;
        return idxA - idxB;
      });
  }, [items, user]);

  // Recommended Projects
  const recommendedItems = useMemo(() => {
    if (items.length === 0) return [];
    
    // Filter out already completed items safely
    const userProgressMap = user?.progress || {};
    const completedIds = Object.keys(userProgressMap).filter(
      (id) => userProgressMap[id]?.percentage === 100
    );

    const activePrefIds = (bookmarkedIds: string[]) => {
      const ids: string[] = [];
      bookmarkedIds.forEach((id) => {
        const item = items.find((it) => it.id === id);
        const catId = item?.categoryId || item?.category;
        if (catId && !ids.includes(catId)) ids.push(catId);
      });
      return ids;
    };

    const preferredCategoryIds = [
      ...activePrefIds(bookmarks),
      ...activePrefIds(user?.enrolled_videos || [])
    ];

    let list = items.filter(
      (it) => !bookmarks.includes(it.id) && !completedIds.includes(it.id)
    );

    if (preferredCategoryIds.length > 0) {
      list = [...list].sort((a, b) => {
        const catA = a.categoryId || a.category || "";
        const catB = b.categoryId || b.category || "";
        const aMatch = preferredCategoryIds.includes(catA) ? 1 : 0;
        const bMatch = preferredCategoryIds.includes(catB) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    return list.slice(0, 3);
  }, [items, bookmarks, user]);

  // Latest Content matching newest arrivals
  const latestContent = useMemo(() => {
    if (items.length === 0) return [];
    return [...items]
      .sort((a, b) => {
        const dateA = a.date || a.created_at || "";
        const dateB = b.date || b.created_at || "";
        return new Date(dateB || 0).getTime() - new Date(dateA || 0).getTime();
      })
      .slice(0, 3);
  }, [items]);

  // Continue Learning Logic
  const primaryContinueItem = useMemo(() => {
    if (enrolledItems.length === 0) return null;
    
    // 1. Try to find the most recently viewed item that is enrolled and not completed
    const activeRecent = recentlyViewedItems.find((r) => 
      enrolledItems.some((e) => e.id === r.id && e.progressPct < 100)
    );
    if (activeRecent) {
      return enrolledItems.find((e) => e.id === activeRecent.id);
    }
    
    // 2. Try to find any enrolled item with progress > 0 and < 100
    const inProgress = enrolledItems.find((e) => e.progressPct > 0 && e.progressPct < 100);
    if (inProgress) return inProgress;
    
    // 3. Try to find any enrolled item < 100
    const notCompleted = enrolledItems.find((e) => e.progressPct < 100);
    if (notCompleted) return notCompleted;
    
    // 4. Default to first enrolled item
    return enrolledItems[0];
  }, [enrolledItems, recentlyViewedItems]);

  const otherContinueItems = useMemo(() => {
    if (!primaryContinueItem) return [];
    return enrolledItems.filter((e) => e.id !== primaryContinueItem.id);
  }, [enrolledItems, primaryContinueItem]);

  // Gamification Badges List Setup
  const badgesData = useMemo(() => {
    const defaultBadges = [
      {
        id: "first-project",
        badgeId: "first-project",
        title: "First Spark",
        name: "First Spark",
        description: "Enrolled in your first REES52 hardware module",
        icon: Zap,
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: "arduino-beginner",
        badgeId: "arduino-beginner",
        title: "Microcontroller Pioneer",
        name: "Microcontroller Pioneer",
        description: "Completed an Arduino R3 or ESP32 circuit lab",
        icon: Cpu,
        color: "from-emerald-500 to-teal-500",
      },
      {
        id: "iot-explorer",
        badgeId: "iot-explorer",
        title: "IoT Systems Architect",
        name: "IoT Systems Architect",
        description: "Studied 3 or more hardware/sensor documentation guides",
        icon: BookOpen,
        color: "from-amber-500 to-orange-500",
      },
      {
        id: "robotics-builder",
        badgeId: "robotics-builder",
        title: "Master Robotist",
        name: "Master Robotist",
        description: "Completed the 4WD Smart Robot Car assembly course",
        icon: Trophy,
        color: "from-purple-500 to-indigo-500",
      },
    ];

    const userBadges = user?.badges || [];
    return defaultBadges.map((b) => {
      const isUnlocked = userBadges.some((ub) => ub.badgeId === b.badgeId || ub.id === b.id);
      return {
        ...b,
        unlocked: isUnlocked,
      };
    });
  }, [user]);

  const currentStreak = user?.streak?.current ?? 0;
  const longestStreak = user?.streak?.longest ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── 1. Welcoming Banner Panel ── */}
      <div className="relative p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 text-white rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/15">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/25 shadow-sm">
              Maker Workspace
            </span>
            {currentStreak > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-500/25 shadow-sm flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                {currentStreak} Day Streak!
              </span>
            )}
          </div>
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-slate-100">
            Welcome back, {user?.name || "Maker"}!
          </h3>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed font-semibold">
            Track your hardware progress, claim certified credentials, and check your achievement milestones.
          </p>
        </div>

        {/* Real counts dashboard */}
        <div className="flex items-center gap-6 md:gap-8 flex-shrink-0 z-10 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Enrolled</span>
            <span className="text-2xl font-black text-cyan-400 mt-1">
              {user?.enrolled_videos?.length || 0}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Unlocked</span>
            <span className="text-2xl font-black text-cyan-400 mt-1">
              {user?.purchased_ebooks?.length || 0}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">Streaks</span>
            <span className="text-2xl font-black text-orange-400 mt-1 flex items-center gap-1">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              {currentStreak}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Streaks & Gamification Achievements Grid ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-cyan-600" /> Achievement Badges & Streaks
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Badge Grid (3 cols on desktop) */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badgesData.map((badge) => {
              const IconComp = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    badge.unlocked
                      ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                      : "bg-slate-50/70 border-slate-200/60 opacity-60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${
                      badge.unlocked ? badge.color : "from-slate-400 to-slate-500 grayscale"
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-slate-900 leading-tight">
                        {badge.title}
                      </h4>
                      <p className="text-[8.5px] text-slate-500 font-semibold line-clamp-2 mt-1 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-150/60 flex items-center justify-between">
                    <span className={`text-[8px] font-black uppercase tracking-wider ${
                      badge.unlocked ? "text-cyan-600" : "text-slate-400"
                    }`}>
                      {badge.unlocked ? "Unlocked" : "Locked"}
                    </span>
                    {badge.unlocked ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Streak Card (1 col on desktop) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Activity Streak</span>
                <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
              <div>
                <span className="text-3xl font-black text-orange-400 tracking-tight">{currentStreak} Days</span>
                <p className="text-[8.5px] text-slate-400 font-medium mt-0.5">
                  Best Record: <strong className="text-slate-200">{longestStreak} Days</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <p className="text-[8.5px] text-slate-300 font-semibold leading-relaxed">
                Log in daily and complete hardware lessons to maintain your streak!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Active Learning workbench ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-600" /> Current Learning Workbench
          </h3>
          {enrolledItems.length > 0 && (
            <span className="text-[9px] font-black text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200/60">
              {enrolledItems.length} Enrolled Module{enrolledItems.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {enrolledItems.length === 0 ? (
          <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-black uppercase text-slate-900">Workbench is empty</h4>
              <p className="text-xs text-slate-500 font-medium">
                Enroll in video courses or unlock eBook building guides to start tracking active progress here.
              </p>
            </div>
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Main Active Module Highlight (2 cols) */}
            {primaryContinueItem && (
              <div className="lg:col-span-2 p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-cyan-500/20 rounded-3xl shadow-md relative overflow-hidden flex flex-col justify-between min-h-[260px]">
                <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5">
                  <Cpu className="w-48 h-48 text-cyan-400" />
                </div>

                <div className="space-y-3 z-10">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-[8.5px] font-black uppercase tracking-widest rounded-md">
                      Active Target
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {primaryContinueItem.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg md:text-xl font-black text-white leading-snug">
                      {primaryContinueItem.title}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1 font-medium">
                      {primaryContinueItem.description || "Hardware step-by-step module"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/80 z-10">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 text-[9px] uppercase tracking-wider">
                      Current Lesson: <strong className="text-cyan-300">{primaryContinueItem.lastLesson}</strong>
                    </span>
                    <span className="text-cyan-400 text-[10px] font-black">
                      {primaryContinueItem.progressPct}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 w-full h-3 bg-slate-950 border border-white/10 rounded-full p-0.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          primaryContinueItem.progressPct === 100 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        }`}
                        style={{ width: `${primaryContinueItem.progressPct}%` }}
                      />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                      <button
                        onClick={() => onNavigateToItem(primaryContinueItem.url || primaryContinueItem.external_purchase_url || "")}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[9px] tracking-widest rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                      >
                        <span>{primaryContinueItem.progressPct === 100 ? "Review Module" : "Resume"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      
                      {primaryContinueItem.progressPct === 100 && (
                        <Link
                          href={`/certificate/${primaryContinueItem.id}`}
                          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-[9px] tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Certificate</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other Enrolled Modules List (1 col) */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between min-h-[260px]">
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
                  <span>Other Enrolled Modules</span>
                  <span className="text-slate-400">({otherContinueItems.length})</span>
                </h5>

                {otherContinueItems.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <Cpu className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[9px] text-slate-400 font-extrabold uppercase leading-relaxed max-w-[150px] mx-auto">
                      Workbench is clear. Start another hardware tutorial to stack modules!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1.5 no-scrollbar">
                    {otherContinueItems.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => onNavigateToItem(item.url || item.external_purchase_url || "")}
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h6 className="text-[10px] font-black text-slate-900 truncate">
                            {item.title}
                          </h6>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-cyan-600 font-extrabold">{item.progressPct}% done</span>
                            <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden p-[0.5px]">
                              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${item.progressPct}%` }} />
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={onExploreClick}
                className="w-full mt-4 py-2 border border-slate-200 hover:border-slate-350 text-slate-700 font-black uppercase text-[8.5px] tracking-widest rounded-xl transition-colors cursor-pointer text-center bg-white"
              >
                Find More Projects
              </button>
            </div>

          </div>
        )}
      </div>

      {/* ── 4. Recently Viewed: Horizontal Scrollable Row ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-600 animate-pulse" /> Recently Viewed
        </h3>

        {recentlyViewedItems.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center py-10">
            <Clock className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-[10px] text-slate-550 font-bold uppercase">No recently viewed modules</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">As you study projects, they will be saved here for rapid access.</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth snap-x no-scrollbar">
            {recentlyViewedItems.map((item) => {
              const catId = item.categoryId || item.category;
              const cat = categories.find((c) => c.id === catId);
              const progress = user?.progress?.[item.id] || { percentage: 0 };
              const progressPct = progress.percentage || 0;
              
              return (
                <div 
                  key={`recent:${item.id}`}
                  onClick={() => onNavigateToItem(item.url || item.external_purchase_url || "")}
                  className="snap-start w-72 flex-shrink-0 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[120px]"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                        item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[8.5px] font-black text-slate-400 uppercase truncate">
                        {cat?.name ?? "Academy"}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                    <span className="text-[8px] font-extrabold uppercase text-slate-500">
                      {progressPct === 100 ? "Completed" : progressPct > 0 ? `${progressPct}% complete` : "Not Started"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 5. Recommendations & Content Discovery Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended for You (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-600" /> Recommended For You
            </h3>
            <button
              onClick={onExploreClick}
              className="text-[9px] font-black text-cyan-700 hover:text-cyan-800 uppercase tracking-widest"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedItems.map((item) => {
              const catId = item.categoryId || item.category;
              const cat = categories.find((c) => c.id === catId);
              return (
                <div
                  key={`rec:${item.id}`}
                  onClick={() => onNavigateToItem(item.url || item.external_purchase_url || "")}
                  className="bg-white border border-slate-200 hover:border-cyan-500/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[160px]"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200/50">
                        {item.type}
                      </span>
                      <span className="text-[8px] font-extrabold text-slate-400 truncate">
                        {cat?.name ?? "Academy"}
                      </span>
                    </div>

                    <h4 className="text-[11px] font-black text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[9px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {item.description || "Hands-on project and hardware building tutorial."}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase text-cyan-600 flex items-center gap-1">
                      Explore Module <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Newest Arrivals Column (1 col) */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-600" /> Newest Arrivals
          </h3>

          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3">
            {latestContent.map((item) => (
              <div
                key={`latest:${item.id}`}
                onClick={() => onNavigateToItem(item.url || item.external_purchase_url || "")}
                className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[7.5px] font-black uppercase text-cyan-700">
                    {item.type}
                  </span>
                  <h5 className="text-[10px] font-black text-slate-900 truncate">
                    {item.title}
                  </h5>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── 6. Saved Library & Real Database Notifications ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Saved Library (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-cyan-600" /> Saved Library ({bookmarkedItems.length})
            </h3>
          </div>

          {bookmarkedItems.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-2">
              <Bookmark className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-[10px] text-slate-500 font-bold uppercase">Library is empty</p>
              <p className="text-[9px] text-slate-400 font-medium">Bookmark projects and courses across the catalog to store them for offline review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bookmarkedItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[7.5px] font-black uppercase tracking-wider text-cyan-700">
                      {item.type}
                    </span>
                    <h5 className="text-[10.5px] font-black text-slate-900 truncate mt-0.5">
                      {item.title}
                    </h5>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onNavigateToItem(item.url || item.external_purchase_url || "")}
                      className="p-1.5 bg-slate-950 hover:bg-slate-855 text-white rounded-lg cursor-pointer"
                      title="View resource"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={() => onRemoveBookmark(item.id)}
                      className="p-1.5 border border-slate-200 hover:border-rose-400 text-slate-500 hover:text-rose-600 bg-white rounded-lg cursor-pointer transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Database Notifications Center */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-cyan-600" /> Notifications
            </span>
            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[165px] pr-1.5 no-scrollbar">
            {loadingNotifications ? (
              <p className="text-[9px] text-slate-400 font-extrabold uppercase text-center py-4">Checking database...</p>
            ) : realNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Info className="w-5 h-5 text-slate-350 mb-1" />
                <p className="text-[9px] text-slate-400 font-extrabold uppercase">No new alerts</p>
              </div>
            ) : (
              realNotifications.map((notif) => (
                <div key={notif.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-700 font-semibold leading-relaxed">{notif.message}</p>
                    <span className="text-[7.5px] text-slate-400 font-extrabold uppercase mt-1 block">
                      {new Date(notif.created_at || Date.now()).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

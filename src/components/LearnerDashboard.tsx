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

interface LearnerDashboardProps {
  user: any;
  categories: any[];
  products: any[];
  items: any[];
  bookmarks: string[];
  onRemoveBookmark: (id: string) => void;
  onNavigateToItem: (url: string) => void;
  onExploreClick: () => void;
}

export default function LearnerDashboard({
  user,
  categories,
  products,
  items,
  bookmarks,
  onRemoveBookmark,
  onNavigateToItem,
  onExploreClick,
}: LearnerDashboardProps) {
  const [realNotifications, setRealNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch real notifications from database
  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setRealNotifications(data);
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoadingNotifications(false);
      }
    })();
  }, []);

  // Filter actual user enrolled videos and unlocked ebooks dynamically from real Supabase states
  const enrolledItems = useMemo(() => {
    return items.filter(it => 
      (it.type === "video" && user?.enrolled_videos?.includes(it.id)) ||
      (it.type === "ebook" && user?.purchased_ebooks?.includes(it.id))
    ).map(it => {
      const progress = user?.progress?.[it.id] || { percentage: 0 };
      return {
        ...it,
        progressPct: progress.percentage || 0,
        lastLesson: progress.lastViewedLesson || "Introduction"
      };
    });
  }, [items, user]);

  const bookmarkedItems = useMemo(() => {
    return items.filter(it => bookmarks.includes(it.id));
  }, [items, bookmarks]);

  // Recently Viewed Items
  const recentlyViewedItems = useMemo(() => {
    if (!user?.recently_viewed) return [];
    return items.filter(it => user.recently_viewed.includes(it.id))
      .sort((a, b) => {
        const idxA = user.recently_viewed.indexOf(a.id);
        const idxB = user.recently_viewed.indexOf(b.id);
        return idxA - idxB;
      });
  }, [items, user]);

  // Recommended Projects
  const recommendedItems = useMemo(() => {
    if (items.length === 0) return [];
    // Filter out already completed items
    const completedIds = Object.keys(user?.progress || {}).filter(
      id => user.progress[id]?.percentage === 100
    );
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
      ...activePrefIds(user?.enrolled_videos || [])
    ];
    let list = items.filter(it => !bookmarks.includes(it.id) && !completedIds.includes(it.id));
    if (preferredCategoryIds.length > 0) {
      list = [...list].sort((a, b) => {
        const aMatch = preferredCategoryIds.includes(a.categoryId) ? 1 : 0;
        const bMatch = preferredCategoryIds.includes(b.categoryId) ? 1 : 0;
        return bMatch - aMatch;
      });
    }
    return list.slice(0, 3);
  }, [items, bookmarks, user]);

  // Gamification Badges List Setup
  const badgesData = [
    {
      id: "first-project",
      name: "First Project",
      description: "Completed your first learning module on REES52!",
      icon: Trophy,
      color: "from-amber-400 to-orange-500",
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-700"
    },
    {
      id: "arduino-beginner",
      name: "Arduino Beginner",
      description: "Completed an Arduino microcontroller project!",
      icon: Cpu,
      color: "from-cyan-400 to-blue-500",
      bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-700"
    },
    {
      id: "iot-explorer",
      name: "IoT Explorer",
      description: "Completed an IoT and sensor telemetry project!",
      icon: Zap,
      color: "from-purple-400 to-indigo-500",
      bg: "bg-purple-500/10 border-purple-500/20 text-purple-700"
    },
    {
      id: "robotics-builder",
      name: "Robotics Builder",
      description: "Completed a Robotics mechanical assembly project!",
      icon: Award,
      color: "from-emerald-400 to-teal-500",
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
    }
  ];

  const unlockedBadges = user?.badges || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* ── 1. Welcoming Banner Panel ── */}
      <div className="relative p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950 text-white rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/15">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/25 shadow-sm">
              Maker Workspace
            </span>
            {user?.streak?.current > 0 && (
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 bg-orange-950/80 px-2.5 py-1 rounded-md border border-orange-500/25 shadow-sm flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                {user.streak.current} Day Streak!
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
              {user?.streak?.current || 0}
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
            {badgesData.map(badge => {
              const isUnlocked = unlockedBadges.some((b: any) => b.badgeId === badge.id);
              const BadgeIcon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`relative p-4 rounded-2xl border flex flex-col items-center text-center justify-between transition-all duration-300 ${
                    isUnlocked 
                      ? "bg-white border-slate-200/80 shadow-md hover:scale-[1.03]" 
                      : "bg-slate-100/50 border-slate-200/40 opacity-60"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                      isUnlocked 
                        ? `bg-gradient-to-br ${badge.color} text-white shadow-md` 
                        : "bg-slate-200 text-slate-400"
                    }`}>
                      <BadgeIcon className="w-6 h-6" />
                      {isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 border border-white rounded-full p-0.5">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-900 leading-tight block mt-1 uppercase tracking-wide">
                      {badge.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 leading-relaxed max-w-[120px] block mt-0.5">
                      {badge.description}
                    </span>
                  </div>

                  {!isUnlocked && (
                    <div className="absolute top-2 right-2 bg-slate-200/80 p-1 rounded-md text-slate-400 border border-slate-300/30">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Streaks Summary Card (1 col on desktop) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 flex flex-col justify-between items-center text-center shadow-sm">
            <div className="flex flex-col items-center gap-2 mt-1">
              <Flame className="w-10 h-10 fill-orange-500 text-orange-500 animate-bounce" />
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-950">Learning Streak</h4>
              <p className="text-[10px] text-orange-800 font-semibold leading-relaxed max-w-[180px] uppercase">
                Active days in a row: <span className="font-black text-orange-950 text-xs">{user?.streak?.current || 0}</span>.
              </p>
            </div>
            
            <div className="w-full border-t border-orange-500/15 pt-2 mt-4 flex justify-between text-[9px] font-black uppercase tracking-widest text-orange-800">
              <span>Longest Streak:</span>
              <span className="text-orange-950">{user?.streak?.longest || 0} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Continue Learning Grid ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
          <Play className="w-4 h-4 text-cyan-600 fill-cyan-600" /> Continue Learning ({enrolledItems.length})
        </h3>
        
        {enrolledItems.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center justify-center space-y-3">
            <Play className="w-8 h-8 text-slate-350" />
            <div>
              <p className="text-xs font-black text-slate-800 uppercase">No active courses yet</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Enroll in video lectures or unlock ebooks in the explorer feed to start tracking your progress.</p>
            </div>
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8.5px] tracking-widest rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              Browse Explorer Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledItems.map((item) => (
              <div 
                key={item.id}
                className="group p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/30 rounded-2xl shadow-sm transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                      item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}>
                      {item.type === "video" ? "Video Lecture" : "Ebook"}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {item.progressPct === 100 ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-cyan-700 leading-snug truncate">
                    {item.title}
                  </h4>

                  {/* Progress bar info */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-500 uppercase">
                      <span>Last: {item.lastLesson}</span>
                      <span>{item.progressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.progressPct === 100 ? "bg-emerald-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${item.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToItem(item.url)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8.5px] tracking-widest rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all flex-shrink-0"
                  >
                    <span>{item.progressPct === 100 ? "Review Module" : "Resume"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {item.progressPct === 100 && (
                    <Link
                      href={`/certificate/${item.id}`}
                      className="py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[8.5px] tracking-widest rounded-lg flex items-center justify-center gap-1 transition-all flex-shrink-0"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Recently Viewed & Recommended Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recently Viewed */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-cyan-600" /> Recently Viewed
            </h3>

            {recentlyViewedItems.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center py-8">
                <Clock className="w-6 h-6 text-slate-350 mb-2" />
                <p className="text-[10px] text-slate-550 font-bold uppercase">No recently viewed modules</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                {recentlyViewedItems.map((item) => (
                  <div 
                    key={`recent:${item.id}`}
                    onClick={() => onNavigateToItem(item.url)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider mb-0.5 ${
                        item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-[11px] font-black text-slate-900 truncate leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Next Projects */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-cyan-600" /> Recommended For You
            </h3>

            {recommendedItems.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center py-8">
                <Sparkles className="w-6 h-6 text-slate-350 mb-2" />
                <p className="text-[10px] text-slate-550 font-bold uppercase">No recommendations found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {recommendedItems.map((item) => (
                  <div 
                    key={`rec:${item.id}`}
                    onClick={() => onNavigateToItem(item.url)}
                    className="p-2.5 bg-cyan-50/20 hover:bg-cyan-50/50 border border-cyan-200/40 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider mb-0.5 ${
                        item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-[11px] font-black text-cyan-900 truncate leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── 5. Saved Blueprints (Bookmarks) & Notifications ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bookmarked Library */}
        <div className="md:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Bookmark className="w-4 h-4 text-cyan-600" /> My Saved blueprints ({bookmarks.length})
          </h3>

          {bookmarkedItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-xs font-black text-slate-800 uppercase">Your library is empty</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Click the bookmark icon on any explorer card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar animate-fade-in">
              {bookmarkedItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider mb-1 ${
                      item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                    }`}>
                      {item.type}
                    </span>
                    <h4 className="text-[11px] font-black text-slate-900 truncate leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onNavigateToItem(item.url)}
                      className="p-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg cursor-pointer"
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
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-550 flex items-center gap-1.5">
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
                    <p className="text-[10px] text-slate-750 font-semibold leading-relaxed">{notif.message}</p>
                    <span className="text-[7.5px] text-slate-400 font-extrabold uppercase mt-1 block">
                      {new Date(notif.created_at).toLocaleDateString(undefined, {
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

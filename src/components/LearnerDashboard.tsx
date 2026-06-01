"use client";

import { useEffect, useState } from "react";
import { BookOpen, Play, Trash2, Bell, Cpu, ChevronRight, Info, CheckCircle2, Bookmark } from "lucide-react";
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
  const enrolledItems = items.filter(it => 
    (it.type === "video" && user?.enrolled_videos?.includes(it.id)) ||
    (it.type === "ebook" && user?.purchased_ebooks?.includes(it.id))
  );

  const bookmarkedItems = items.filter(it => bookmarks.includes(it.id));

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* ── 1. Clean welcoming banner panel (Real user profile telemetry) ── */}
      <div className="relative p-6 bg-gradient-to-br from-slate-900 to-cyan-950 text-white rounded-3xl overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/10">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/20">
            Learner Workspace
          </span>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide">
            Welcome back, {user?.name || "Maker"}!
          </h3>
          <p className="text-xs text-slate-350 max-w-md leading-relaxed font-semibold">
            Track your active hardware courses, unlocked guides, and saved blueprints. Explore resources in the catalog to expand your lab.
          </p>
        </div>

        {/* Real counts dashboard */}
        <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled</span>
            <span className="text-2xl font-black text-white mt-1">
              {user?.enrolled_videos?.length || 0}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unlocked</span>
            <span className="text-2xl font-black text-white mt-1">
              {user?.purchased_ebooks?.length || 0}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saved</span>
            <span className="text-2xl font-black text-white mt-1">
              {bookmarks.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Real Enrolled Courses Grid (Netflix Style) ── */}
      <div className="space-y-3">
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
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8.5px] tracking-widest rounded-lg cursor-pointer transition-colors"
            >
              Browse Explorer Feed
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledItems.map((item) => (
              <div 
                key={item.id}
                className="group p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/30 rounded-2xl shadow-sm transition-all flex items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-1 min-w-0">
                  <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider mb-1 ${
                    item.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                  }`}>
                    {item.type === "video" ? "Video Lecture" : "Ebook"}
                  </span>
                  
                  <h4 className="text-xs font-black text-slate-900 group-hover:text-cyan-700 leading-snug truncate">
                    {item.title}
                  </h4>
                </div>

                <button
                  onClick={() => onNavigateToItem(item.url)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8px] tracking-widest rounded-lg flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0"
                >
                  <span>Resume</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Real Library Bookmarks & Real Notifications Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bookmarked Library */}
        <div className="md:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Bookmark className="w-4 h-4 text-cyan-600" /> My Library ({bookmarks.length})
          </h3>

          {bookmarkedItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-150 flex flex-col items-center justify-center">
              <BookOpen className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-xs font-black text-slate-800 uppercase">Your library is empty</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Click the bookmark icon on any explorer card to save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {bookmarkedItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
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

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[160px] pr-1.5 no-scrollbar">
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

"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy, Award, BookOpen, Clock, Play, Trash2, Bell, Users, CheckCircle2, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LearnerDashboardProps {
  user: any;
  categories: any[];
  products: any[];
  items: any[];
  bookmarks: string[];
  onRemoveBookmark: (id: string) => void;
  onNavigateToItem: (url: string) => void;
  likes: string[];
}

export default function LearnerDashboard({
  user,
  categories,
  products,
  items,
  bookmarks,
  onRemoveBookmark,
  onNavigateToItem,
  likes,
}: LearnerDashboardProps) {
  const [streak, setStreak] = useState(3); // Default simulated learning streak (days)
  const [points, setPoints] = useState(380); // Default learning points
  const [notifications, setNotifications] = useState<string[]>([
    "🎉 Welcome to Infinity Hub! Access all robotics schemas.",
    "🔥 Warning: Your 3-day learning streak expires in 8 hours! Watch a lecture to keep it active.",
    "💡 Recommendation: Based on your Arduino preference, try 'Mechanical Spider Robot'!",
  ]);

  // Social feed logs with auto refresh simulation
  const [activities, setActivities] = useState<string[]>([
    "Aman Singh completed 'Mechanical Spider Gait Calibration'",
    "Priya earned the 'IoT Explorer' Badge",
    "Rahul Sharma enrolled in 'ESP8266 IoT Moisture v1.2'",
    "Vikram Goel unlocked 'Arduino Nano' Ebook",
  ]);

  const socialPool = [
    "Simranpreet unlocked the 'STEM Innovator' Badge",
    "Karan Johar completed 'Ultrasonic Obstacle Avoidance Course'",
    "Aditi Roy likes 'Mechanical Spider Robot Kit'",
    "Harsh Vardhan unlocked 'Arduino Nano Specs Guide'",
    "Nisha Gupta watch 'Soil Humidity ESP8266 telemetry'",
    "Deepak Verma started 'Robotics Coaxial Accelerators'",
  ];

  // Netflix-style continue learning list
  const activeLectures = [
    {
      id: "video-spider-robot",
      title: "Mechanical Spider Robot Kit",
      progress: 68,
      type: "video" as const,
      url: "/videos/video-spider-robot",
    },
    {
      id: "ebook-obstacle-detector",
      title: "Ultrasonic Obstacle Detector",
      progress: 40,
      type: "ebook" as const,
      url: "/ebooks/ebook-obstacle-detector",
    },
  ];

  // Leaderboard data
  const leaderBoardList = [
    { name: "Lovi Mittal", completed: 18, streak: 12, points: 1980, rank: 1 },
    { name: "Aman Singh", completed: 14, streak: 8, points: 1420, rank: 2 },
    { name: "Priya Roy", completed: 11, streak: 6, points: 1150, rank: 3 },
    { name: "Rahul Sharma", completed: 9, streak: 4, points: 920, rank: 4 },
    { name: "You", completed: 4, streak: 3, points: 380, rank: 5 },
  ];

  // Auto-slide social feed pings
  useEffect(() => {
    const timer = setInterval(() => {
      const randomMsg = socialPool[Math.floor(Math.random() * socialPool.length)];
      setActivities((prev) => [randomMsg, ...prev.slice(0, 3)]);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Sync points dynamically with likes and bookmarks
  useEffect(() => {
    const calculatedPoints = 380 + likes.length * 30 + bookmarks.length * 50;
    setPoints(calculatedPoints);
  }, [likes, bookmarks]);

  // Achievement Badges evaluation
  const badgeList = [
    {
      name: "Robotics Beginner",
      description: "Unlocked on enrolling in first lecture",
      unlocked: true,
      iconColor: "text-cyan-600 border-cyan-200 bg-cyan-50",
    },
    {
      name: "IoT Explorer",
      description: "Unlocked by liking or saving IoT resources",
      unlocked: likes.length > 0 || bookmarks.length > 0,
      iconColor: "text-orange-600 border-orange-200 bg-orange-50",
    },
    {
      name: "Embedded Engineer",
      description: "Unlocked with 300+ learning points",
      unlocked: points >= 450,
      iconColor: "text-blue-600 border-blue-200 bg-blue-50",
    },
    {
      name: "Arduino Expert",
      description: "Unlocked by bookmarking 3+ resources",
      unlocked: bookmarks.length >= 3,
      iconColor: "text-indigo-600 border-indigo-200 bg-indigo-50",
    },
    {
      name: "STEM Innovator",
      description: "Unlocked with active 3-day learning streak",
      unlocked: streak >= 3,
      iconColor: "text-rose-600 border-rose-200 bg-rose-50",
    },
  ];

  const bookmarkedItems = items.filter((it) => bookmarks.includes(it.id));

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* ── Dynamic Top Gamification Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak Stats Panel */}
        <div className="md:col-span-2 relative p-6 bg-gradient-to-br from-slate-900 to-cyan-950 text-white rounded-3xl overflow-hidden shadow-md flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-500/10">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:16px_16px]" />
          
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/20">
              Personal Progress Tracker
            </span>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide">
              Keep the Spark Alive, Lovi
            </h3>
            <p className="text-xs text-slate-350 max-w-sm leading-relaxed">
              Earn badge updates, like pings, and track cloud analytics telemetry. Watch 1 resource daily to save your learning metrics.
            </p>
          </div>

          {/* Interactive Gamification Gauges */}
          <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className="relative p-4 bg-orange-500/15 border border-orange-500/35 rounded-2xl flex items-center justify-center animate-streak-pulse">
                <Flame className="w-8 h-8 text-orange-500 fill-orange-500" />
              </div>
              <span className="text-xs font-extrabold text-slate-350 mt-1.5 uppercase">STREAK</span>
              <span className="text-xl font-black text-white">{streak} Days</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-4 bg-yellow-500/15 border border-yellow-500/35 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <span className="text-xs font-extrabold text-slate-350 mt-1.5 uppercase">POINTS</span>
              <span className="text-xl font-black text-white">{points} pts</span>
            </div>
          </div>
        </div>

        {/* Dynamic Notification Center */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-cyan-600 animate-bounce" /> Alerts & Notifications
            </span>
            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[140px] pr-1.5 no-scrollbar">
            {notifications.map((msg, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 flex items-start gap-2">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-600 flex-shrink-0" />
                <p className="text-[10px] text-slate-650 font-semibold leading-relaxed">{msg}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Continue Learning (Netflix-style) ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
          <Play className="w-4 h-4 text-cyan-600 fill-cyan-600" /> Continue Learning
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeLectures.map((lec) => (
            <div 
              key={lec.id}
              className="group p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/30 rounded-2xl shadow-sm transition-all flex items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-1">
                <span className={`inline-flex rounded-full border px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                  lec.type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
                }`}>
                  {lec.type === "video" ? "Video Lecture" : "Ebook"}
                </span>
                
                <h4 className="text-xs font-black text-slate-900 group-hover:text-cyan-700 leading-snug truncate max-w-[200px]">
                  {lec.title}
                </h4>

                {/* Progress bar */}
                <div className="space-y-1 pt-1.5">
                  <div className="flex justify-between text-[8px] font-extrabold text-slate-400">
                    <span>PROGRESS</span>
                    <span>{lec.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                      style={{ width: `${lec.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToItem(lec.url)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8px] tracking-widest rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Resume</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Unlocked Achievement Badges ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-cyan-600" /> Achievement Badges
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {badgeList.map((badge, idx) => (
            <div 
              key={idx}
              className={`p-4 border rounded-2xl flex flex-col items-center text-center justify-between space-y-2.5 transition-all shadow-sm ${
                badge.unlocked 
                  ? `${badge.iconColor} animate-badge-glow border-cyan-500/20` 
                  : "bg-slate-100/40 border-slate-200/60 opacity-40 select-none"
              }`}
            >
              <div className="p-3 bg-white rounded-full border border-slate-100 shadow-sm">
                <Trophy className={`w-6 h-6 ${badge.unlocked ? "text-yellow-500 fill-yellow-500 animate-pulse" : "text-slate-400"}`} />
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-900 uppercase leading-snug">{badge.name}</h4>
                <p className="text-[8px] text-slate-500 font-semibold leading-relaxed mt-1">{badge.description}</p>
              </div>
              <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                badge.unlocked ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
              }`}>
                {badge.unlocked ? "UNLOCKED" : "LOCKED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── My Library & Community Leaderboard Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bookmarked Library */}
        <div className="md:col-span-2 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <BookOpen className="w-4 h-4 text-cyan-600" /> My Library ({bookmarks.length})
          </h3>

          {bookmarkedItems.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-150">
              <BookOpen className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-800 uppercase">Your library is empty</p>
              <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Bookmark lectures or ebooks in explorer feed to sync here.</p>
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

        {/* Social Feed + Leaderboard Space */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Users className="w-4 h-4 text-cyan-600" /> Community Activity
          </h3>

          <div className="space-y-3">
            {activities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-150 animate-fade-in-up">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-850 font-bold leading-normal">{act}</p>
                  <span className="text-[7.5px] text-slate-400 font-extrabold uppercase">Just now</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── High-Contrast Global Leaderboard ── */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-850 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Global Top Learners
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-semibold text-slate-650 border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Learner</th>
                <th className="py-2.5 px-3 text-center">Completed Projects</th>
                <th className="py-2.5 px-3 text-center">Current Streak</th>
                <th className="py-2.5 px-3 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderBoardList.map((learner, idx) => (
                <tr 
                  key={idx}
                  className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                    learner.name === "You" ? "bg-cyan-50/40 font-extrabold border-cyan-100/50 text-slate-900" : ""
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      learner.rank === 1 ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                      learner.rank === 2 ? "bg-slate-150 text-slate-700 border border-slate-200" :
                      learner.rank === 3 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-slate-50 text-slate-600 border border-slate-100"
                    }`}>
                      #{learner.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 uppercase tracking-wide">{learner.name}</td>
                  <td className="py-3 px-3 text-center">{learner.completed}</td>
                  <td className="py-3 px-3 text-center text-orange-600 font-extrabold flex items-center justify-center gap-0.5">
                    🔥 {learner.streak} Days
                  </td>
                  <td className="py-3 px-3 text-right text-cyan-700 font-black">{learner.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

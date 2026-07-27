"use client";

import { useEffect, useState } from "react";
import { Users, Video, BookOpen, Cpu, Clock } from "lucide-react";

export default function MetricsSection() {
  const [studentsCount, setStudentsCount] = useState(0);
  const [tutorialsCount, setTutorialsCount] = useState(0);
  const [ebooksCount, setEbooksCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [hoursCount, setHoursCount] = useState(0);

  useEffect(() => {
    let active = true;
    const duration = 2000; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    
    let frame = 0;
    const timer = setInterval(() => {
      if (!active) return;
      frame++;
      
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(2, -10 * progress); // Ease-out exponential
      
      setStudentsCount(Math.round(easeProgress * 15000));
      setTutorialsCount(Math.round(easeProgress * 150));
      setEbooksCount(Math.round(easeProgress * 25));
      setProjectsCount(Math.round(easeProgress * 52));
      setHoursCount(Math.round(easeProgress * 10000));

      if (frame >= totalFrames) {
        clearInterval(timer);
        setStudentsCount(15000);
        setTutorialsCount(150);
        setEbooksCount(25);
        setProjectsCount(52);
        setHoursCount(10000);
      }
    }, frameRate);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const cardStyle = "flex flex-col items-center justify-center p-5 rounded-2xl bg-white/70 border border-slate-200/80 backdrop-blur-xl shadow-sm hover:border-cyan-500/35 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 text-center";

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full my-6 animate-fade-in">
      
      {/* Total Students */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-cyan-600 mb-2">
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Students</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {studentsCount.toLocaleString()}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Active Learners
        </span>
      </div>

      {/* Total Tutorials */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-blue-600 mb-2">
          <Video className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Tutorials</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {tutorialsCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Video Lessons
        </span>
      </div>

      {/* Total Ebooks */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-indigo-600 mb-2">
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Ebooks</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {ebooksCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Project Guides
        </span>
      </div>

      {/* Projects Covered */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-purple-600 mb-2">
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Projects</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {projectsCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Hands-on Builds
        </span>
      </div>

      {/* Learning Hours */}
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Hours</span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {hoursCount.toLocaleString()}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Study Time
        </span>
      </div>

    </div>
  );
}

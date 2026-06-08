"use client";

import { useEffect, useState } from "react";
import { Cpu, BookOpen, Compass, Calendar, Award } from "lucide-react";

export default function MetricsSection() {
  const [projectsCount, setProjectsCount] = useState(0);
  const [resourcesCount, setResourcesCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [yearCount, setYearCount] = useState(2000);

  useEffect(() => {
    let active = true;
    const duration = 1500; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    
    let frame = 0;
    const timer = setInterval(() => {
      if (!active) return;
      frame++;
      
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(2, -10 * progress); // Ease-out exponential
      
      setProjectsCount(Math.round(easeProgress * 52));
      setResourcesCount(Math.round(easeProgress * 100));
      setCategoriesCount(Math.round(easeProgress * 10));
      setYearCount(Math.round(2000 + easeProgress * 13)); // From 2000 to 2013

      if (frame >= totalFrames) {
        clearInterval(timer);
        setProjectsCount(52);
        setResourcesCount(100);
        setCategoriesCount(10);
        setYearCount(2013);
      }
    }, frameRate);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const cardStyle = "flex flex-col items-center justify-center p-6 rounded-2xl bg-white/60 border border-slate-200/60 backdrop-blur-md shadow-sm hover:border-cyan-500/35 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full my-6 animate-fade-in">
      
      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-cyan-600 mb-2">
          <Cpu className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Projects</span>
        </div>
        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {projectsCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Hands-on Build Guides
        </span>
      </div>

      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-blue-600 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Resources</span>
        </div>
        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {resourcesCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Ebooks & Video Modules
        </span>
      </div>

      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-indigo-600 mb-2">
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Categories</span>
        </div>
        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {categoriesCount}+
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          STEM & Prototyping
        </span>
      </div>

      <div className={cardStyle}>
        <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Since</span>
        </div>
        <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          {yearCount}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          Empowering Builders
        </span>
      </div>

    </div>
  );
}

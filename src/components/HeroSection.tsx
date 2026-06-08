"use client";

import { Cpu, Rocket, Compass, Play } from "lucide-react";

interface HeroSectionProps {
  onStartLearning: () => void;
  onExploreProjects: () => void;
}

export default function HeroSection({ onStartLearning, onExploreProjects }: HeroSectionProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/90 to-slate-50/50 p-6 md:p-12 lg:p-16 backdrop-blur-2xl shadow-xl animate-fade-in-up glow-ambient-cyan">
      {/* Decorative vector background grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Floating live tag */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.15)]">
          <Rocket className="h-3 w-3" /> REES52 LEARNING HUB v3.0
        </span>

        {/* Dynamic Bold Typography Headline */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
          Master <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">Robotics, IoT & Embedded Systems</span> Through Real Projects
        </h1>

        {/* Engaging descriptive subheadline */}
        <p className="text-slate-600 text-sm md:text-lg max-w-2xl leading-relaxed font-semibold">
          Build real-world robotics, Arduino, ESP32, IoT, drone, and embedded systems projects with hands-on learning.
        </p>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={onStartLearning}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 premium-btn-interactive"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Start Learning</span>
          </button>
          
          <button
            onClick={onExploreProjects}
            className="w-full sm:w-auto px-8 py-3.5 bg-white/80 border border-slate-200 hover:border-cyan-500/30 hover:bg-white text-slate-800 font-black uppercase text-xs tracking-widest rounded-xl shadow-sm transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 premium-btn-interactive"
          >
            <Compass className="w-4 h-4 text-slate-600" />
            <span>Explore Projects</span>
          </button>
        </div>

      </div>
    </div>
  );
}

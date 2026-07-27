"use client";

import { Cpu, Rocket, BookOpen, Play } from "lucide-react";

interface HeroSectionProps {
  onStartLearning: () => void;
  onExploreProjects: () => void; // Map this to Browse Tutorials
}

export default function HeroSection({ onStartLearning, onExploreProjects }: HeroSectionProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white/95 to-slate-50/70 p-8 md:p-12 lg:p-16 backdrop-blur-2xl shadow-xl animate-fade-in-up glow-ambient-cyan">
      {/* Decorative vector background grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px] rounded-3xl" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Educational Content */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
          
          {/* Floating live tag */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <Rocket className="h-3 w-3 text-cyan-600 animate-bounce" /> REES52 ACADEMY
          </span>

          {/* Premium Headlines */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Learn <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-650 bg-clip-text text-transparent">Robotics, AI, Electronics</span> & IoT Through Real Projects
          </h1>

          {/* Subheadline */}
          <p className="text-slate-600 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed font-semibold">
            Master Arduino, Raspberry Pi, Embedded Systems, AI, STEM, and IoT with tutorials, ebooks, and hands-on project learning.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onStartLearning}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg shadow-cyan-600/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start Learning</span>
            </button>
            
            <button
              onClick={onExploreProjects}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/80 border border-slate-200 hover:border-cyan-500/30 hover:bg-white text-slate-800 font-black uppercase text-xs tracking-widest rounded-xl shadow-sm transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>Browse Tutorials</span>
            </button>
          </div>
        </div>

        {/* Right Column: High-Fidelity STEM Visual Illustration (SVG) */}
        <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
          <div className="w-full max-w-[420px] aspect-square rounded-3xl bg-slate-900/5 border border-slate-200/50 p-6 flex items-center justify-center relative shadow-inner overflow-hidden">
            {/* Animated neon grid background inside illustration frame */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:16px_16px]" />
            
            <svg
              className="w-full h-full text-slate-850"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Circuit Tracks */}
              <path d="M20 50 H180 M20 150 H180 M50 20 V180 M150 20 V180" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              <path d="M20 50 L50 80 V120 L20 150 M180 50 L150 80 V120 L180 150" stroke="currentColor" strokeWidth="0.75" />
              
              {/* Microcontroller main base */}
              <rect x="65" y="65" width="70" height="70" rx="12" fill="white" stroke="#0891b2" strokeWidth="2.5" className="shadow-lg" />
              <rect x="75" y="75" width="50" height="50" rx="8" fill="#0f172a" />
              
              {/* Circuit leads (microchip pins) */}
              <path d="M65 80 H57 M65 92 H57 M65 104 H57 M65 116 H57" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
              <path d="M135 80 H143 M135 92 H143 M135 104 H143 M135 116 H143" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
              <path d="M80 65 V57 M92 65 V57 M104 65 V57 M116 65 V57" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
              <path d="M80 135 V143 M92 135 V143 M104 135 V143 M116 135 V143" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />
              
              {/* CPU Core details */}
              <circle cx="100" cy="100" r="16" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <path d="M100 88 V94 M100 106 V112 M88 100 H94 M106 100 H112" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
              
              {/* Glowing nodes / pulsing circles */}
              <circle cx="50" cy="80" r="3" fill="#0ea5e9" />
              <circle cx="50" cy="80" r="6" stroke="#0ea5e9" strokeWidth="0.5" className="animate-ping" style={{ transformOrigin: "50px 80px" }} />
              
              <circle cx="150" cy="120" r="3" fill="#6366f1" />
              <circle cx="150" cy="120" r="6" stroke="#6366f1" strokeWidth="0.5" className="animate-ping" style={{ transformOrigin: "150px 120px" }} />

              {/* Robotics Arm representation line */}
              <path d="M25 100 L55 70 L90 85" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="55" cy="70" r="2.5" fill="#f59e0b" />
              <circle cx="90" cy="85" r="2.5" fill="#f59e0b" />

              {/* AI Synapses representing lines */}
              <path d="M175 100 L145 90 L115 105" stroke="#ec4899" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
              <circle cx="145" cy="90" r="2" fill="#ec4899" />
            </svg>
            
            {/* Overlay indicators */}
            <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-800">Hardware Synced</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

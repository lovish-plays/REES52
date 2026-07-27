"use client";

import { Award, ShieldAlert, Cpu, Heart, CheckCircle2 } from "lucide-react";

export default function AboutAcademy() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 p-8 md:p-12 lg:p-16 text-white shadow-xl my-10 border-cyan-500/15">
      {/* Background vector decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:20px_20px]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left column: Vision & Mission */}
        <div className="lg:col-span-6 space-y-6">
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/25 shadow-sm w-fit block">
            About REES52 Academy
          </span>
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight uppercase">
            Empowering the Next Generation of Makers & Engineers
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-semibold">
            REES52 Academy exists to bridge the gap between theoretical software coding and tangible physical hardware engineering. We believe the best way to master electronics, robotics, and artificial intelligence is by building real, working systems with your hands.
          </p>
          <p className="text-slate-350 text-xs leading-relaxed font-medium">
            Our structured video walkthroughs and comprehensive ebooks are calibrated by professional embedders to fast-track classroom lessons, engineering labs, and hobbyist workshops into fully functioning DIY models.
          </p>
        </div>

        {/* Right column: Highlights Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Hardware Ecosystem */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Hardware Integration</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
              Every tutorial maps directly to physical REES52 prototyping kits. No virtual abstraction—only real circuits.
            </p>
          </div>

          {/* Card 2: Industry Expertise */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Industry Calibrated</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
              Curriculum engineered by robotics professionals, covering ESP32, Raspberry Pi, OpenCV, and telemetry.
            </p>
          </div>

          {/* Card 3: School Integration */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">STEM Focused</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
              Built for schools, colleges, and makerspaces. Simple step-by-step schemas with zero friction.
            </p>
          </div>

          {/* Card 4: Complete Support */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Self-Paced Learning</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
              Free lifetime guides, code files, and video libraries. Track your progress dynamically in your dashboard.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

import Image from "next/image";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

export default function HeroLmsGraphicCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900/90 p-2.5 shadow-[0_20px_80px_rgba(2,132,199,0.25)] backdrop-blur-2xl">
      {/* Background ambient glowing spheres */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-cyan-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-[100px]" />

      {/* Main LMS Image Showcase Frame */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10">
        <Image
          src="/hero-lms-graphic.png"
          alt="REES52 Tech LMS Platform Showcase - Robotics, AI & Electronics"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />

        {/* Floating Top Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/85 px-3 py-1.5 backdrop-blur-md shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
            REES52 Tech Academy
          </span>
        </div>

        {/* Floating Bottom Info Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/90 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                Robotics, AI, IoT & STEM
              </p>
              <p className="text-xs font-bold text-white">
                Practical Hardware & Code Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border-l border-white/15 pl-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

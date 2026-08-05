import Image from "next/image";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

export default function HeroLmsGraphicCard() {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-indigo-400/40 bg-gradient-to-br from-indigo-950 via-slate-950 to-indigo-900 p-3 shadow-[0_20px_80px_rgba(79,70,229,0.3)] backdrop-blur-2xl">
      {/* Background ambient glowing spheres */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-amber-500/20 blur-[100px]" />

      {/* Main LMS Image Showcase Frame */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-indigo-300/20 shadow-inner">
        <Image
          src="/hero-lms-graphic.png"
          alt="REES52 Tech LMS Platform Showcase - Robotics, AI & Electronics"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/20" />

        {/* Floating Top Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-xl border border-amber-400/50 bg-indigo-950/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
            REES52 Tech Academy
          </span>
        </div>

        {/* Floating Bottom Info Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-indigo-950/90 p-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-indigo-600 text-white shadow-md shadow-amber-500/20 border border-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-300">
                Robotics, AI, IoT &amp; STEM
              </p>
              <p className="text-xs font-bold text-white">
                Practical Hardware &amp; Code Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-400 border-l border-white/15 pl-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Verified Courses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

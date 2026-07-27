"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, GraduationCap, ShieldCheck } from "lucide-react";

const LOAD_STEPS = [
  { threshold: 0, text: "Preparing learning paths" },
  { threshold: 28, text: "Loading project guides" },
  { threshold: 54, text: "Syncing kits and components" },
  { threshold: 78, text: "Warming up your workspace" },
  { threshold: 96, text: "Ready to build" },
];

export default function SplashLoader() {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 420 : 1450;
    let frame = 0;
    let fadeTimer = 0;
    let destroyTimer = 0;
    let startedAt = 0;

    const tick = (timestamp: number) => {
      if (!startedAt) {
        startedAt = timestamp;
      }

      const elapsed = timestamp - startedAt;
      const percent = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - percent, 3);
      setProgress(Math.round(eased * 100));

      if (percent < 1) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      fadeTimer = window.setTimeout(() => setFadeOut(true), 180);
      destroyTimer = window.setTimeout(() => setDestroyed(true), 760);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(destroyTimer);
    };
  }, []);

  const activeStep = useMemo(() => {
    return [...LOAD_STEPS].reverse().find((step) => progress >= step.threshold) ?? LOAD_STEPS[0];
  }, [progress]);

  if (destroyed) return null;

  return (
    <div className={`premium-splash-overlay ${fadeOut ? "fade-out" : ""}`} role="status" aria-live="polite">
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
          <svg className="absolute h-full w-full text-cyan-400 animate-spin-clockwise" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="170 86" fill="none" />
          </svg>
          <svg className="absolute h-[78%] w-[78%] text-emerald-300 animate-spin-counter" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="86 120" fill="none" opacity="0.78" />
          </svg>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-[0_0_28px_rgba(14,165,233,0.28)] backdrop-blur-md">
            <Cpu className="h-7 w-7 text-cyan-200" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase text-cyan-100">
          <GraduationCap className="h-3.5 w-3.5" />
          REES52 Academy
        </div>

        <h1 className="mt-4 text-2xl font-black leading-tight text-white text-balance">
          Setting up your robotics workspace
        </h1>
        <p className="mt-2 max-w-xs text-sm font-medium leading-relaxed text-slate-300 text-pretty">
          Courses, projects, ebooks, and component paths are getting ready.
        </p>

        <div className="mt-8 w-full rounded-lg border border-white/10 bg-white/10 p-3 text-left shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase text-slate-300">
            <span>{activeStep.text}</span>
            <span className="text-cyan-200">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-950/55 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-300 shadow-[0_0_18px_rgba(14,165,233,0.55)] transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
          Secure learning session
        </div>
      </div>
    </div>
  );
}

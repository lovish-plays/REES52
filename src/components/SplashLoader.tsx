"use client";

import { useEffect, useState } from "react";
import { Cpu, Terminal, ShieldCheck } from "lucide-react";

const TELEMETRY_LOGS = [
  { threshold: 0, text: "INIT >> Engaging REES52 Coaxial Boot Sequence..." },
  { threshold: 18, text: "SERV >> Calibrating humanoid actuators [17/17 Servos OK]" },
  { threshold: 38, text: "GYRO >> Stabilizing 6-Axis kinematic balance struts..." },
  { threshold: 58, text: "DB   >> Fetching IoT masterclass schemas & curriculum PDFs..." },
  { threshold: 78, text: "SEC  >> Establishing Supabase encrypted relational tunnels..." },
  { threshold: 95, text: "SYS  >> Calibration complete. Learning Hub workspace active." }
];

export default function SplashLoader() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string[]>([]);
  const [fadeOut, setFadeOut] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Fast but organic loading increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Trigger fade-out transition after 300ms
          setTimeout(() => {
            setFadeOut(true);
            
            // Destroy loader entirely after transition finishes (750ms)
            setTimeout(() => {
              setDestroyed(true);
            }, 750);
          }, 450);
          
          return 100;
        }
        
        // Random organic jumps
        const increment = Math.floor(Math.random() * 8) + 6;
        return Math.min(prev + increment, 100);
      });
    }, 90);

    return () => clearInterval(interval);
  }, [mounted]);

  // Handle appending logs as progress matches thresholds
  useEffect(() => {
    const matched = TELEMETRY_LOGS.filter(log => progress >= log.threshold);
    const logTexts = matched.map(log => log.text);
    setActiveLogs(logTexts);
  }, [progress]);

  if (!mounted || destroyed) return null;

  return (
    <div className={`premium-splash-overlay ${fadeOut ? "fade-out" : ""}`}>
      {/* Dynamic Hexagon Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.15)_0%,transparent_70%)] animate-pulse pointer-events-none" />

      <div className="flex flex-col items-center justify-center max-w-md w-full px-6 text-center z-20">
        
        {/* Hardware concentric mechanical vector loader */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Outer Ring */}
          <svg className="absolute w-full h-full text-cyan-500 animate-spin-clockwise" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="180 80" fill="none" />
          </svg>
          
          {/* Inner Opposing Ring */}
          <svg className="absolute w-[80%] h-[80%] text-blue-500 animate-spin-counter" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="90 120" fill="none" className="opacity-70" />
          </svg>

          {/* Innermost Core Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-900/40 to-blue-900/40 rounded-2xl flex items-center justify-center border border-cyan-400/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Brand Banner */}
        <h1 className="text-xl md:text-2xl font-black tracking-widest text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.25)] uppercase font-mono">
          REES<span className="text-cyan-400">52</span> // LEARNING
        </h1>
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
          Robotics Embedded Calibration Core
        </p>

        {/* Telemetry log terminal window */}
        <div className="mt-8 w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-left font-mono text-[9px] leading-relaxed shadow-2xl relative overflow-hidden h-36 flex flex-col justify-end backdrop-blur-md">
          <div className="absolute top-2.5 left-3 flex items-center gap-1.5 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-900 w-full pb-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-500" />
            <span>ROBOTIC_BOOT_TELEMETRY.LOG</span>
          </div>
          
          <div className="space-y-1.5 overflow-hidden flex flex-col justify-end">
            {activeLogs.map((logText, idx) => (
              <p 
                key={idx} 
                className={`truncate ${
                  logText.startsWith("INIT") ? "text-cyan-400 font-bold" :
                  logText.startsWith("SYS") ? "text-emerald-400 font-black" : "text-slate-300"
                } animate-log-appear`}
              >
                {logText}
              </p>
            ))}
            
            {progress < 100 && (
              <p className="text-cyan-400 flex items-center gap-0.5 font-black">
                <span>CONNECTING</span>
                <span className="animate-cursor-blink">_</span>
              </p>
            )}
          </div>
        </div>

        {/* Progress tracks */}
        <div className="mt-6 w-full space-y-2">
          <div className="flex justify-between text-[9px] uppercase font-black tracking-widest text-cyan-400/80">
            <span>BOOSTING_COAXIAL_MEMORIES</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950/80 border border-slate-800 rounded-full p-0.5 overflow-hidden flex items-center">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-[0_0_14px_rgba(6,182,212,0.7)] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Small security footer */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[8px] text-slate-500 font-black uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>AES-256 SECURED HUB GATEWAY</span>
        </div>

      </div>
    </div>
  );
}

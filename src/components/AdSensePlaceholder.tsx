"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, BarChart2 } from "lucide-react";

interface AdSensePlaceholderProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1234567890123456";

export default function AdSensePlaceholder({
  slotId = "default-slot",
  format = "auto",
  className = "",
}: AdSensePlaceholderProps) {
  const [mounted, setMounted] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn("Google AdSense load block or pending approval:", e);
    }
  }, [mounted]);

  if (!mounted) return null;

  const triggerGtagAdClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "adsense_slot_clicked", {
        slot_id: slotId,
        format: format,
      });
    }
  };

  const isVertical = format === "vertical";
  const isHorizontal = format === "horizontal";

  return (
    <div 
      onClick={triggerGtagAdClick}
      className={`glassmorphism bg-[#F7F4EB]/40 border border-dashed border-cyan-500/30 p-5 rounded-2xl flex flex-col justify-between items-center text-center select-none cursor-pointer relative overflow-hidden group ${
        isVertical ? "h-96 w-full" : isHorizontal ? "w-full py-4 px-6 flex-row gap-4" : "w-full min-h-[180px]"
      } ${className}`}
    >
      {/* Tiny decorative cyber lights */}
      <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-cyan-500/40" />
      <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-blue-500/40" />
      <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-cyan-500/40" />
      <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-blue-500/40" />
      
      {/* Background sweep sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      {/* Live Google AdSense INS tag */}
      <div className="w-full relative z-10 overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            minWidth: "250px",
          }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>

      {/* Premium Visual Fallback Elements */}
      <div className="flex flex-col items-center justify-center gap-2 mt-2">
        <div className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/20 group-hover:scale-105 transition-transform duration-300">
          <Sparkles className="w-5 h-5 text-cyan-600 animate-pulse" />
        </div>
        <div>
          <span className="text-[8px] font-black uppercase tracking-widest text-cyan-700 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">
            Sponsored Program
          </span>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-1.5 group-hover:text-cyan-700 transition-colors">
            ROBOTICS COAXIAL ACCELERATOR
          </h4>
          <p className="text-[10px] text-slate-500 font-semibold max-w-[200px] mt-0.5 mx-auto leading-relaxed">
            Configure high-speed IoT automation libraries and Starter Kits.
          </p>
        </div>
      </div>

      <div className={`flex flex-col items-center gap-2 w-full mt-4 border-t border-slate-200/50 pt-3 ${isHorizontal ? "mt-0 border-t-0 border-l pl-4 pt-0 w-auto" : ""}`}>
        <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-extrabold uppercase tracking-widest">
          <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Slot ID: {slotId}</span>
        </div>
        <span className="px-3.5 py-1.5 text-[8.5px] font-black uppercase tracking-widest bg-cyan-600 text-white rounded-lg shadow-sm group-hover:bg-cyan-500 transition-colors text-center w-full block">
          Learn More
        </span>
      </div>
    </div>
  );
}

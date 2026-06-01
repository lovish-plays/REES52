"use client";

import { useEffect, useRef, useState } from "react";

interface AdSensePlaceholderProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1234567890123456";

export default function AdSensePlaceholder({
  slotId,
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

  const isVertical = format === "vertical";
  const isHorizontal = format === "horizontal";

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center overflow-hidden my-2 max-w-full ${className}`}
    >
      {/* Clean, completely empty dashed live ad container */}
      <div className="w-full h-[307px] border border-dashed border-slate-350 bg-slate-400/5 px-4 py-3 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        
        {/* Live Active Ad Ins Element */}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            minWidth: "250px",
          }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* Minimal status indicator when empty (e.g. on localhost) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[#F7F4EB]/90">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-1.5 py-0.5 rounded border border-slate-300">
            AdSense Live Unit
          </span>
          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-1 truncate max-w-[200px]">
            Slot ID: <span className="text-cyan-700 font-black">{slotId}</span>
          </p>
        </div>
      </div>
      
      {/* Standard Compliance Advertisement Label */}
      <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
        Advertisement
      </span>
    </div>
  );
}

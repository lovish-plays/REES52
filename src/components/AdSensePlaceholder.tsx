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

  return (
    <div 
      className={`w-full flex flex-col items-center justify-center overflow-hidden my-2 max-w-full ${className}`}
    >
      {/* Compact Dashed Container (Max 90px tall on dev to keep it short & neat!) */}
      <div className="w-full border border-dashed border-slate-200/80 bg-slate-400/5 px-3 py-2.5 rounded-xl flex flex-col items-center justify-center text-center relative min-h-[76px] max-h-[84px] overflow-hidden">
        {/* Live Active Ad Ins tag */}
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

        {/* Clean, minimalist overlay readout for local developer visual verification */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-[#F7F4EB]/90">
          <span className="text-[6.5px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/40 px-1.5 py-0.5 rounded border border-slate-300">
            Ad Placement
          </span>
          <p className="text-[8px] text-slate-500 font-extrabold uppercase mt-0.5 truncate max-w-[200px]">
            Slot ID: <span className="text-cyan-700 font-black">{slotId}</span>
          </p>
        </div>
      </div>
      
      {/* Compliance Advertisement Label */}
      <span className="text-[7px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
        Advertisement
      </span>
    </div>
  );
}

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
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      // Initialize the AdSense ad unit through the global Google push window function
      if (typeof window !== "undefined") {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
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
      className={`w-full flex flex-col items-center justify-center overflow-hidden my-4 transition-all duration-300 ${
        isVertical ? "min-h-[250px]" : isHorizontal ? "min-h-[90px]" : "min-h-[120px]"
      } ${className}`}
    >
      {/* Live Google AdSense Ins Element */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          minWidth: "250px",
          minHeight: isVertical ? "250px" : "90px",
        }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />

      {/* Standard Outlined Fallback for Local Development & Telemetry Auditing */}
      <div className="w-full flex flex-col items-center justify-center pointer-events-none mt-2">
        <div className="w-full border border-dashed border-slate-300 bg-slate-500/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded border border-slate-350">
            AdSense Active Unit
          </span>
          <p className="text-[9px] text-slate-500 font-extrabold uppercase mt-1">
            Slot: <span className="text-cyan-700 font-black">{slotId}</span>
          </p>
          <p className="text-[7.5px] text-slate-400 font-semibold mt-0.5 leading-relaxed max-w-[200px]">
            Served via {ADSENSE_CLIENT_ID.substring(0, 10)}... (Live Production tags enabled)
          </p>
        </div>
        
        {/* Compliance Advertisement Label */}
        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5">
          Advertisement
        </span>
      </div>
    </div>
  );
}

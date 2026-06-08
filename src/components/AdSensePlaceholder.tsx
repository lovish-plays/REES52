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

        {/* Premium SaaS Sponsorship Call-to-Action Panel (Replaces blank grey boxes) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950 p-4 border border-cyan-500/20 text-white select-none">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:12px_12px]" />
          
          <span className="text-[7px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
            Sponsorship Active
          </span>
          
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-100 mt-2 text-center">
            Sponsor REES52
          </h4>
          
          <p className="text-[7.5px] text-slate-400 font-bold uppercase mt-1 text-center max-w-[180px] leading-relaxed">
            Empower the next generation of robotics makers. Reach 20k+ monthly developers.
          </p>

          <a
            href="mailto:info@rees52.in?subject=Sponsorship%20Inquiry%20-%20REES52%20Learning"
            className="mt-3.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[7.5px] tracking-widest rounded transition-colors shadow-md pointer-events-auto"
          >
            Advertise With Us
          </a>
        </div>
      </div>
      
      {/* Standard Compliance Advertisement Label */}
      <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
        Advertisement
      </span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function CyberBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-[-1] overflow-hidden bg-[#F7F4EB]">
      {/* Dynamic Digital Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 10%, #0891B2 2px, transparent 2px),
            radial-gradient(circle at 90% 10%, #2563EB 2px, transparent 2px),
            radial-gradient(circle at 90% 90%, #0891B2 2px, transparent 2px),
            radial-gradient(circle at 10% 90%, #2563EB 2px, transparent 2px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      {/* ================= HEADER BINDING GRAPHICS (Top Horizontal Tech Band) ================= */}
      <div className="absolute top-[80px] left-0 right-0 h-10 opacity-[0.10] text-cyan-600 border-b border-dashed border-cyan-400 flex items-center justify-between px-12">
        <svg className="w-48 h-full" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 0 20 H 100 L 120 40" />
          <path d="M 40 10 H 120 L 130 20" strokeDasharray="3,3" />
          <circle cx="100" cy="20" r="3" fill="currentColor" />
          <circle cx="120" cy="40" r="3" fill="currentColor" />
        </svg>
        <span className="font-mono text-[7px] tracking-widest text-cyan-700 font-extrabold uppercase">AELOS_HEADER_CONN.ACTIVE</span>
        <svg className="w-48 h-full" viewBox="0 0 200 40" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 200 20 H 100 L 80 40" />
          <path d="M 160 10 H 80 L 70 20" strokeDasharray="3,3" />
          <circle cx="100" cy="20" r="3" fill="currentColor" />
          <circle cx="80" cy="40" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* ================= CARDS BACKING GRAPHICS (Mid-Screen Tech Node Canvas) ================= */}
      
      {/* Left Central Column Circuit */}
      <svg className="absolute left-[8%] top-[25%] w-96 h-[500px] opacity-[0.09] text-cyan-600" viewBox="0 0 300 500" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 50 50 V 200 L 120 270 H 220 L 250 300 V 450" />
        <path d="M 100 80 V 180 L 140 220 H 180" strokeDasharray="4,4" />
        <path d="M 20 150 H 110 L 160 200 V 380 L 190 410 H 280" />
        
        {/* Nodes */}
        <circle cx="50" cy="50" r="4" fill="currentColor" />
        <circle cx="120" cy="270" r="3.5" fill="currentColor" />
        <circle cx="250" cy="300" r="4" fill="currentColor" />
        <circle cx="160" cy="200" r="3" fill="currentColor" />
        <circle cx="190" cy="410" r="3" fill="currentColor" />
        
        {/* Chips */}
        <rect x="15" y="140" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        
        <text x="60" y="70" fontSize="7" fontFamily="monospace" className="fill-current font-black">SYS.PORTAL_FEED_A</text>
        <text x="175" y="215" fontSize="6" fontFamily="monospace" className="fill-current">BUS:UART</text>
      </svg>

      {/* Right Central Column Circuit */}
      <svg className="absolute right-[8%] top-[22%] w-96 h-[550px] opacity-[0.09] text-blue-600" viewBox="0 0 300 550" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 250 50 V 220 L 180 290 H 80 L 50 320 V 480" />
        <path d="M 200 100 V 200 L 160 240 H 120" strokeDasharray="4,4" />
        <path d="M 280 180 H 190 L 140 230 V 410 L 110 440 H 20" />
        
        {/* Nodes */}
        <circle cx="250" cy="50" r="4" fill="currentColor" />
        <circle cx="180" cy="290" r="3.5" fill="currentColor" />
        <circle cx="50" cy="320" r="4" fill="currentColor" />
        <circle cx="140" cy="230" r="3" fill="currentColor" />
        <circle cx="110" cy="440" r="3" fill="currentColor" />
        
        {/* Chips */}
        <rect x="265" y="170" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        
        <text x="140" y="90" fontSize="7" fontFamily="monospace" className="fill-current font-black">SYS.PORTAL_FEED_B</text>
        <text x="60" y="430" fontSize="6" fontFamily="monospace" className="fill-current">BAUD:115200</text>
      </svg>

      {/* Center Background Tech Gear (Pulsing underneath center page cards) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.065] flex items-center justify-center">
        <svg className="w-full h-full text-cyan-600 animate-spin" style={{ animationDuration: '60s' }} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.8">
          <circle cx="100" cy="100" r="95" />
          <circle cx="100" cy="100" r="85" strokeDasharray="6,8" />
          <circle cx="100" cy="100" r="60" />
          <circle cx="100" cy="100" r="50" strokeDasharray="2,4" />
          <path d="M 100 5 L 100 195" />
          <path d="M 5 100 L 195 100" />
          
          {/* Concentric Coordinate accents */}
          <path d="M 100 40 A 60 60 0 0 1 160 100" strokeWidth="1.5" />
          <path d="M 100 160 A 60 60 0 0 1 40 100" strokeWidth="1.5" />
          
          <text x="105" y="15" fontSize="5" fontFamily="monospace" className="fill-current font-bold">AZIMUTH.00</text>
          <text x="155" y="95" fontSize="5" fontFamily="monospace" className="fill-current font-bold">ELEVATION.90</text>
        </svg>
      </div>

      {/* ================= FOOTER BINDING GRAPHICS (Bottom Horizontal Tech Band) ================= */}
      <div className="absolute bottom-[240px] left-0 right-0 h-12 opacity-[0.10] text-blue-600 border-t border-dashed border-blue-400 flex items-center justify-between px-12">
        <svg className="w-48 h-full" viewBox="0 0 200 48" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 0 28 H 80 L 100 8 V 0" />
          <path d="M 30 38 H 90 L 110 18" strokeDasharray="4,4" />
          <circle cx="80" cy="28" r="3" fill="currentColor" />
          <circle cx="100" cy="8" r="3" fill="currentColor" />
        </svg>
        <span className="font-mono text-[7px] tracking-widest text-blue-750 font-extrabold uppercase">AELOS_FOOTER_SHIELD.STABLE</span>
        <svg className="w-48 h-full" viewBox="0 0 200 48" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 200 28 H 120 L 100 8 V 0" />
          <path d="M 170 38 H 110 L 90 18" strokeDasharray="4,4" />
          <circle cx="120" cy="28" r="3" fill="currentColor" />
          <circle cx="100" cy="8" r="3" fill="currentColor" />
        </svg>
      </div>

      {/* Faint coordinates along margins */}
      <div className="absolute left-6 top-[40%] -translate-y-1/2 flex flex-col gap-16 font-mono text-[7px] text-slate-600 opacity-30 uppercase tracking-widest leading-none">
        <div>SYS: ONLINE</div>
        <div>IP: 192.168.1.52</div>
        <div>BAUD: 115200</div>
      </div>

      <div className="absolute right-6 top-[40%] -translate-y-1/2 flex flex-col gap-16 font-mono text-[7px] text-slate-600 opacity-30 uppercase tracking-widest leading-none text-right">
        <div>CORE: V4.2.0</div>
        <div>LINK: EXCELLENT</div>
        <div>D-LINK: ACTIVE</div>
      </div>
    </div>
  );
}

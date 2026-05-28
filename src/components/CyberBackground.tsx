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
      {/* Subtle background grids and coordinates */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
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

      {/* Top Left Circuit Board Patch */}
      <svg className="absolute -left-12 -top-12 w-96 h-96 opacity-[0.045] text-cyan-600 animate-pulse" style={{ animationDuration: '8s' }} viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 50 100 L 150 100 L 200 150 L 200 250 L 250 300 H 350" />
        <path d="M 100 50 L 100 150 L 130 180 V 280 L 160 310" />
        <path d="M 50 200 L 120 200 L 150 230 H 220 L 270 280 V 380" strokeDasharray="4,4" />
        
        {/* Connection points / Nodes */}
        <circle cx="150" cy="100" r="4" fill="currentColor" />
        <circle cx="200" cy="150" r="4" fill="currentColor" />
        <circle cx="250" cy="300" r="4" fill="currentColor" />
        <circle cx="130" cy="180" r="3" fill="currentColor" />
        <circle cx="220" cy="230" r="3" fill="currentColor" />
        
        {/* Coordinate Text */}
        <text x="60" y="90" fontSize="8" fontFamily="monospace" fontWeight="bold" className="fill-current">SYS.AELOS_LOC.01A</text>
        <text x="260" y="295" fontSize="8" fontFamily="monospace" fontWeight="bold" className="fill-current">BUS_TYPE:IC2</text>
      </svg>

      {/* Top Right Tech Radar Widget */}
      <div className="absolute right-8 top-28 w-44 h-44 opacity-[0.035] flex items-center justify-center">
        <svg className="w-full h-full text-cyan-700 animate-spin" style={{ animationDuration: '40s' }} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="100" cy="100" r="90" />
          <circle cx="100" cy="100" r="60" strokeDasharray="3,6" />
          <circle cx="100" cy="100" r="30" />
          <line x1="100" y1="10" x2="100" y2="190" />
          <line x1="10" y1="100" x2="190" y2="100" />
          <path d="M 100 100 L 164 36" strokeWidth="1.5" />
          {/* Faint degree marks */}
          <text x="105" y="20" fontSize="6" fontFamily="monospace" className="fill-current">000°</text>
          <text x="175" y="105" fontSize="6" fontFamily="monospace" className="fill-current">090°</text>
          <text x="105" y="188" fontSize="6" fontFamily="monospace" className="fill-current">180°</text>
        </svg>
      </div>

      {/* Bottom Right Circuit board connection */}
      <svg className="absolute -right-20 -bottom-20 w-[450px] h-[450px] opacity-[0.045] text-blue-600" viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M 450 400 L 350 400 L 300 350 L 300 250 L 250 200 H 100" />
        <path d="M 400 450 L 400 350 L 370 320 V 220 L 320 170 H 150" strokeDasharray="6,4" />
        <path d="M 450 250 L 380 250 L 350 220 H 280 L 230 170 V 50" />
        
        {/* Nodes */}
        <circle cx="350" cy="400" r="4" fill="currentColor" />
        <circle cx="300" cy="350" r="4" fill="currentColor" />
        <circle cx="250" cy="200" r="4" fill="currentColor" />
        <circle cx="370" cy="320" r="3" fill="currentColor" />
        <circle cx="280" cy="220" r="3" fill="currentColor" />
        
        {/* Microchip Representation */}
        <rect x="75" y="185" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="90" y1="180" x2="90" y2="185" />
        <line x1="100" y1="180" x2="100" y2="185" />
        <line x1="90" y1="215" x2="90" y2="220" />
        <line x1="100" y1="215" x2="100" y2="220" />
        <line x1="70" y1="195" x2="75" y2="195" />
        <line x1="70" y1="205" x2="75" y2="205" />
        <line x1="105" y1="195" x2="110" y2="195" />
        <line x1="105" y1="205" x2="110" y2="205" />

        <text x="65" y="175" fontSize="8" fontFamily="monospace" fontWeight="bold" className="fill-current">AELOS_MEGA_328P</text>
      </svg>

      {/* Floating telemetry lines / Faint coordinate labels on margins */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-12 font-mono text-[7px] text-slate-500 opacity-20 uppercase tracking-widest leading-none">
        <div>LAT: 28.6139° N</div>
        <div>LNG: 77.2090° E</div>
        <div>SYS: CONNECTED</div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-12 font-mono text-[7px] text-slate-500 opacity-20 uppercase tracking-widest leading-none text-right">
        <div>PWA: V4.0.2</div>
        <div>ENR: OPTIMIZED</div>
        <div>BAUD: 115200</div>
      </div>
    </div>
  );
}

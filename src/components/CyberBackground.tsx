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
      {/* Clean background subtle dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `radial-gradient(circle, #0891B2 1.5px, transparent 1.5px)`,
          backgroundSize: "60px 60px"
        }}
      />

      {/* ================= LEFT SIDE: ABSTRACT CYBERNETIC ROBOTIC ARM/TORSO ================= */}
      <svg 
        className="absolute -left-12 top-[18%] w-[380px] h-[650px] opacity-[0.14] text-slate-800" 
        viewBox="0 0 400 700" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        {/* Shoulder servo joint (Concentric abstract rings) */}
        <circle cx="100" cy="180" r="80" strokeWidth="2.5" />
        <circle cx="100" cy="180" r="55" strokeDasharray="6,6" />
        <circle cx="100" cy="180" r="30" />
        
        {/* Arm actuator struts (Abstract angled shapes) */}
        <path d="M 180 180 L 290 320 L 260 480 L 100 550" strokeWidth="3" strokeLinecap="round" />
        <path d="M 155 235 L 240 340 L 210 460" strokeDasharray="8,4" />
        
        {/* Elbow / Joint actuator (concentric rings) */}
        <circle cx="290" cy="320" r="35" strokeWidth="2" />
        <circle cx="290" cy="320" r="18" fill="currentColor" className="opacity-20" />
        
        {/* Wrist / Forearm plates */}
        <path d="M 260 480 L 330 520 L 300 620 L 200 590 Z" fill="none" strokeWidth="2" />
        <line x1="280" y1="500" x2="250" y2="570" strokeWidth="1.5" />
        <line x1="300" y1="510" x2="270" y2="580" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* Abstract floating HUD lines */}
        <path d="M 180 100 L 240 100 L 260 120" strokeWidth="1" strokeDasharray="4,4" />
        <text x="270" y="125" fontSize="8" fontFamily="monospace" fontWeight="black" className="fill-current">ACTUATOR_L.01</text>
      </svg>

      {/* ================= RIGHT SIDE: ABSTRACT HUMANOID HELMET/HEAD PROFILE ================= */}
      <svg 
        className="absolute -right-16 top-[22%] w-[380px] h-[600px] opacity-[0.14] text-slate-800" 
        viewBox="0 0 400 650" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        {/* Helmet Outer Shell Profile */}
        <path 
          d="M 350 100 Q 150 100 120 280 Q 100 400 220 480 Q 280 520 350 520" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
        />
        
        {/* Inner helmet trace contours (Abstract aesthetic lines) */}
        <path d="M 350 140 Q 200 140 160 280 Q 140 380 230 450" strokeWidth="1.5" strokeDasharray="8,4" />
        <path d="M 350 180 Q 240 180 200 280 Q 180 360 240 420" strokeWidth="1" />
        
        {/* Sleek visor shield (Humanoid cyber eye) */}
        <path 
          d="M 125 250 L 70 250 L 50 290 L 105 340 L 138 290 Z" 
          fill="currentColor" 
          className="opacity-15"
        />
        <path 
          d="M 125 250 L 70 250 L 50 290 L 105 340 L 138 290 Z" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
        />
        {/* Glow telemetry indicators on visor */}
        <circle cx="75" cy="275" r="4" fill="currentColor" />
        <line x1="50" y1="290" x2="160" y2="290" strokeWidth="1" strokeDasharray="3,3" />

        {/* Back-of-head cooling vents / mechanical plates */}
        <path d="M 280 100 V 520" strokeWidth="1.5" strokeDasharray="12,6" />
        <line x1="280" y1="180" x2="330" y2="150" />
        <line x1="280" y1="260" x2="330" y2="230" />
        <line x1="280" y1="340" x2="330" y2="310" />
        <line x1="280" y1="420" x2="330" y2="390" />

        {/* Neck collar plates */}
        <path d="M 220 480 L 180 560 L 280 580" strokeWidth="2.5" />
        <path d="M 250 510 L 210 570" strokeWidth="1" />

        {/* Abstract coordinate overlay */}
        <path d="M 120 450 L 60 450 L 40 470" strokeWidth="1" />
        <text x="10" y="485" fontSize="8" fontFamily="monospace" fontWeight="black" className="fill-current">CORE.SYS_OK</text>
      </svg>
    </div>
  );
}

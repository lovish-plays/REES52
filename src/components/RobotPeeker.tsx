"use client";

import { useEffect, useState } from "react";

export default function RobotPeeker() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show peeker at the absolute top (scrollY is 0 or close to 0)
      if (window.scrollY < 12) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    // Run on initial mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`premium-robot-peeker ${active ? "active" : ""}`}>
      {/* Speech bubble */}
      <div className="peeker-speech-bubble">
        Learning Assistant
      </div>

      {/* SVG Interactive Wall-Peeking Robot */}
      <svg 
        className="w-24 h-16 text-slate-800" 
        viewBox="0 0 60 30" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        {/* Robot Head Shell (Rounded dome peeking upside down) */}
        <path 
          d="M 15 0 C 15 22, 45 22, 45 0 Z" 
          fill="#F8FBFF" 
          strokeWidth="2" 
          strokeLinejoin="round" 
        />
        
        {/* Robotic side ears/joints */}
        <rect x="11" y="4" width="4" height="8" rx="2" fill="#E2E8F0" />
        <rect x="45" y="4" width="4" height="8" rx="2" fill="#E2E8F0" />

        {/* Glowing Visor Slot */}
        <rect x="18" y="11" width="24" height="8" rx="4" fill="#0D0E12" />
        
        {/* Cyber blinking visor eye bar */}
        <path 
          d="M 21 15 L 39 15" 
          stroke="#0891B2" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          className="peeker-visor-glow" 
        />

        {/* Outer visor glow enhancement lines */}
        <path 
          d="M 23 15 L 37 15" 
          stroke="#22D3EE" 
          strokeWidth="1" 
          strokeLinecap="round" 
          className="opacity-75"
        />

        {/* Cute gripping hands holding the top edge of screen */}
        {/* Left hand claw */}
        <path 
          d="M 12 0 C 12 -4, 18 -4, 18 0" 
          stroke="#E2E8F0" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Right hand claw */}
        <path 
          d="M 42 0 C 42 -4, 48 -4, 48 0" 
          stroke="#E2E8F0" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Subtle decorative screws */}
        <circle cx="23" cy="4" r="0.75" fill="#94A3B8" />
        <circle cx="37" cy="4" r="0.75" fill="#94A3B8" />
      </svg>
    </div>
  );
}

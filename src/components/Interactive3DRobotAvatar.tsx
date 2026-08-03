"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Zap,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  Cpu,
  Radio,
  Eye,
  Activity,
  ArrowRight,
  Sparkle,
} from "lucide-react";
import Link from "next/link";

const ROBOT_MESSAGES = [
  "Hi there! I'm REES-Bot 🤖 your AI Robotics Guide!",
  "Tap my Chest Reactor to boost my power core! ⚡",
  "Click my Antenna to pulse radio telemetry signals! 📡",
  "I can help you build Arduino, ESP32, and IoT projects!",
  "Are you ready to learn robotics with REES52 Academy? 🚀",
  "Click my visor eyes to switch my LED glow color! 🎨",
];

const EYE_COLORS = [
  { name: "Cyan", main: "#38bdf8", glow: "rgba(56, 189, 248, 0.8)" },
  { name: "Emerald", main: "#34d399", glow: "rgba(52, 211, 153, 0.8)" },
  { name: "Amber", main: "#fbbf24", glow: "rgba(251, 191, 36, 0.8)" },
  { name: "Crimson", main: "#f43f5e", glow: "rgba(244, 63, 94, 0.8)" },
];

export default function Interactive3DRobotAvatar() {
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: -4, y: 8 });
  const [eyePos, setEyePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [eyeColorIdx, setEyeColorIdx] = useState<number>(0);
  const [isWaving, setIsWaving] = useState<boolean>(false);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [powerLevel, setPowerLevel] = useState<number>(95);
  const [robotMood, setRobotMood] = useState<"happy" | "excited" | "scanning">("happy");
  const [antennaPulse, setAntennaPulse] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tracking for 3D body tilt & eye pupil movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Body tilt
    const rotY = (mouseX / (rect.width / 2)) * 16;
    const rotX = -(mouseY / (rect.height / 2)) * 16;
    setRotation({ x: rotX, y: rotY });

    // Eye offset (max 8px)
    const eyeX = (mouseX / (rect.width / 2)) * 8;
    const eyeY = (mouseY / (rect.height / 2)) * 6;
    setEyePos({ x: eyeX, y: eyeY });
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setRotation({ x: -4, y: 8 });
      setEyePos({ x: 0, y: 0 });
    }
  };

  // Drag 3D Orbit
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - rotation.y * 3, y: clientY - rotation.x * 3 });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newY = (clientX - dragStart.x) / 3;
    const newX = (clientY - dragStart.y) / 3;
    const clampedX = Math.max(-25, Math.min(25, newX));
    const clampedY = Math.max(-40, Math.min(40, newY));
    setRotation({ x: clampedX, y: clampedY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const talkToRobot = () => {
    setMessageIndex((prev) => (prev + 1) % ROBOT_MESSAGES.length);
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1200);
  };

  const triggerPowerCore = () => {
    setIsPulsing(true);
    setPowerLevel(100);
    setRobotMood("excited");
    setMessageIndex(1);
    setTimeout(() => {
      setIsPulsing(false);
      setRobotMood("happy");
    }, 1500);
  };

  const triggerAntenna = () => {
    setAntennaPulse(true);
    setMessageIndex(2);
    setTimeout(() => setAntennaPulse(false), 1800);
  };

  const cycleEyeColor = () => {
    setEyeColorIdx((prev) => (prev + 1) % EYE_COLORS.length);
  };

  const currentEyeColor = EYE_COLORS[eyeColorIdx];

  return (
    <div className="relative w-full select-none perspective-1000" ref={containerRef}>
      {/* Background ambient glowing spheres */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-80 w-80 rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-emerald-500/20 blur-[130px]" />

      {/* Main 3D Container Card */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMoveCapture={(e) => isDragging && handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="group relative cursor-grab active:cursor-grabbing rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/95 p-6 shadow-[0_30px_100px_rgba(2,132,199,0.3)] backdrop-blur-2xl md:p-8"
      >
        {/* Holographic Edge Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/10 opacity-70 transition-opacity group-hover:opacity-100" />

        {/* Floating Interactive Speech Bubble ("Talking Tom" Style) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            talkToRobot();
          }}
          className="relative z-20 mb-4 cursor-pointer rounded-2xl border border-cyan-400/40 bg-slate-900/90 p-4 shadow-xl shadow-cyan-500/10 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-cyan-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
              <Bot className="h-4 w-4 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  REES-Bot AI Assistant
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Tap to speak
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-white leading-relaxed">
                "{ROBOT_MESSAGES[messageIndex]}"
              </p>
            </div>
          </div>

          {/* Speech bubble pointer arrow */}
          <div className="absolute -bottom-2 left-12 h-4 w-4 rotate-45 border-b border-r border-cyan-400/40 bg-slate-900/90" />
        </div>

        {/* 3D Robot Character Rendering Canvas */}
        <div className="relative z-10 my-4 flex justify-center py-4">
          <div className="relative flex flex-col items-center">
            {/* Antenna Orb */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                triggerAntenna();
              }}
              title="Click Antenna to Pulse Radar"
              className="relative cursor-pointer group/antenna"
            >
              {antennaPulse && (
                <div className="absolute -inset-4 rounded-full bg-cyan-400/40 animate-ping" />
              )}
              <div className="h-6 w-6 rounded-full border-2 border-cyan-300 bg-gradient-to-tr from-cyan-500 to-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.9)] transition-transform group-hover/antenna:scale-125 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>
              <div className="mx-auto h-5 w-1 bg-gradient-to-b from-cyan-400 to-slate-700" />
            </div>

            {/* Robot Head */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                cycleEyeColor();
              }}
              title="Click Visor to Change Eye LED Color"
              className="relative cursor-pointer rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-105"
              style={{
                transform: `rotateX(${-rotation.x * 0.4}deg) rotateY(${rotation.y * 0.4}deg)`,
              }}
            >
              {/* Ears / Side Sensors */}
              <div className="absolute -left-3 top-6 h-6 w-3 rounded-l-lg border border-cyan-400/40 bg-cyan-500/20" />
              <div className="absolute -right-3 top-6 h-6 w-3 rounded-r-lg border border-cyan-400/40 bg-cyan-500/20" />

              {/* Visor Screen */}
              <div className="relative flex h-14 w-44 items-center justify-around rounded-2xl border border-white/20 bg-slate-950 p-2 shadow-inner">
                {/* Left Eye */}
                <div className="relative flex h-8 w-12 items-center justify-center rounded-xl bg-slate-900 overflow-hidden border border-white/10">
                  <div
                    className="h-5 w-5 rounded-full transition-all duration-150 shadow-[0_0_12px]"
                    style={{
                      backgroundColor: currentEyeColor.main,
                      boxShadow: `0 0 12px ${currentEyeColor.glow}`,
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  >
                    <div className="ml-1 mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Mouth Equalizer Bar */}
                <div className="flex items-center gap-1">
                  <div className={`w-1 rounded-full bg-cyan-400 ${isWaving ? "h-6 animate-pulse" : "h-3"}`} />
                  <div className={`w-1 rounded-full bg-cyan-300 ${isWaving ? "h-8 animate-pulse" : "h-5"}`} />
                  <div className={`w-1 rounded-full bg-cyan-400 ${isWaving ? "h-6 animate-pulse" : "h-3"}`} />
                </div>

                {/* Right Eye */}
                <div className="relative flex h-8 w-12 items-center justify-center rounded-xl bg-slate-900 overflow-hidden border border-white/10">
                  <div
                    className="h-5 w-5 rounded-full transition-all duration-150 shadow-[0_0_12px]"
                    style={{
                      backgroundColor: currentEyeColor.main,
                      boxShadow: `0 0 12px ${currentEyeColor.glow}`,
                      transform: `translate(${eyePos.x}px, ${eyePos.y}px)`,
                    }}
                  >
                    <div className="ml-1 mt-1 h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Neck Connection */}
            <div className="h-3 w-10 border-x border-slate-700 bg-slate-800" />

            {/* Robot Torso / Chest */}
            <div className="relative flex w-52 flex-col items-center rounded-3xl border-2 border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-4 shadow-2xl">
              {/* Left Arm */}
              <div
                className={`absolute -left-6 top-4 h-16 w-4 origin-top rounded-full border border-slate-700 bg-slate-800 transition-transform duration-500 ${
                  isWaving ? "-rotate-[140deg]" : "rotate-[15deg]"
                }`}
              >
                <div className="absolute bottom-0 h-4 w-4 rounded-full bg-cyan-400/40 border border-cyan-300" />
              </div>

              {/* Right Arm */}
              <div className="absolute -right-6 top-4 h-16 w-4 origin-top rounded-full border border-slate-700 bg-slate-800 -rotate-[15deg]">
                <div className="absolute bottom-0 h-4 w-4 rounded-full bg-cyan-400/40 border border-cyan-300" />
              </div>

              {/* Interactive Chest Core Arc Reactor */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  triggerPowerCore();
                }}
                title="Click Core Reactor to Overcharge"
                className="relative cursor-pointer group/core flex flex-col items-center justify-center"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-300 bg-gradient-to-tr from-cyan-500/30 to-emerald-500/30 shadow-[0_0_25px_rgba(56,189,248,0.6)] transition-transform duration-300 group-hover/core:scale-110 ${
                    isPulsing ? "animate-ping" : ""
                  }`}
                >
                  <Zap className="h-8 w-8 text-cyan-300 fill-cyan-300 animate-pulse" />
                </div>
                <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-cyan-300">
                  REES Core {powerLevel}%
                </span>
              </div>

              {/* Status Display Matrix */}
              <div className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950/80 p-2.5 text-center">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-300">
                  <span>System Status</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[8px] font-bold text-slate-400">
                  <div className="rounded bg-white/5 p-1">MCU: ATmega328P</div>
                  <div className="rounded bg-white/5 p-1">Clock: 16 MHz</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Robot Control Panel & Action Buttons */}
        <div className="relative z-10 mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              talkToRobot();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/15 py-2.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 transition hover:bg-cyan-500/30"
          >
            <Bot className="h-3.5 w-3.5" />
            Talk Robot
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              cycleEyeColor();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-white/15"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            Eye Color ({currentEyeColor.name})
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerPowerCore();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-500/15 py-2.5 text-[10px] font-black uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/30"
          >
            <Zap className="h-3.5 w-3.5 fill-amber-300" />
            Power Core
          </button>

          <Link
            href="/courses"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 py-2.5 text-[10px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/35"
          >
            Start Course
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Drag Hint Footer */}
        <div className="relative z-10 mt-4 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 border-t border-white/10 pt-3">
          <span>Click Parts to Interact</span>
          <span className="text-cyan-400">Drag to Orbit in 3D 🔄</span>
        </div>
      </div>
    </div>
  );
}

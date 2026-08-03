"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  PlayCircle,
  Cpu,
  Code2,
  CheckCircle2,
  LockKeyhole,
  Award,
  Zap,
  Sparkles,
  RotateCcw,
  Sliders,
  Layers,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface NodeItem {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof PlayCircle;
  status: "complete" | "active" | "locked";
  xp: number;
  details: string;
  codeSnippet?: string;
  circuitValues?: { name: string; val: string; unit: string }[];
}

const MODULE_NODES: NodeItem[] = [
  {
    id: "build",
    title: "1. Watch the Build",
    subtitle: "4K Video walkthrough & component teardown",
    icon: PlayCircle,
    status: "complete",
    xp: 150,
    details: "Master the physical assembly of REES52 Uno R3 & motor chassis.",
    circuitValues: [
      { name: "VCC", val: "5.0", unit: "V" },
      { name: "Motor A", val: "255", unit: "PWM" },
    ],
  },
  {
    id: "wiring",
    title: "2. Check the Wiring",
    subtitle: "Interactive pinout & schematic diagnostic",
    icon: Cpu,
    status: "complete",
    xp: 200,
    details: "Connect ultrasonic sensor (HC-SR04) & L298N motor driver pins safely.",
    circuitValues: [
      { name: "Trig Pin", val: "D9", unit: "GPIO" },
      { name: "Echo Pin", val: "D10", unit: "GPIO" },
    ],
  },
  {
    id: "code",
    title: "3. Run & Change Code",
    subtitle: "Realtime C++ / MicroPython live engine",
    icon: Code2,
    status: "active",
    xp: 350,
    details: "Tweak obstacle avoidance thresholds and telemetry polling rates.",
    codeSnippet: `void loop() {
  long dist = readUltrasonic();
  if (dist < 15) {
    turnRight(); // REES52 Smart Car logic
  } else {
    moveForward();
  }
}`,
    circuitValues: [
      { name: "Telemetry Rate", val: "100", unit: "ms" },
      { name: "Baud Rate", val: "115200", unit: "bps" },
    ],
  },
  {
    id: "telemetry",
    title: "4. Telemetry & Evidence",
    subtitle: "Record sensor logs & video submission",
    icon: Radio,
    status: "locked",
    xp: 300,
    details: "Upload verified serial log graph and project evidence payload.",
    circuitValues: [
      { name: "Log Buffer", val: "1024", unit: "KB" },
      { name: "Sync State", val: "Ready", unit: "" },
    ],
  },
  {
    id: "quiz",
    title: "5. Course Quiz & Cert",
    subtitle: "Scored knowledge check & official badge",
    icon: Award,
    status: "locked",
    xp: 500,
    details: "Score 80%+ to unlock official REES52 Academy completion certificate.",
    circuitValues: [
      { name: "Quiz Questions", val: "5", unit: "Items" },
      { name: "Cert Status", val: "Locked", unit: "" },
    ],
  },
];

export default function Interactive3DHeroGraphic() {
  const [activeNodeId, setActiveNodeId] = useState<string>("code");
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(
    new Set(["build", "wiring", "code"])
  );
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: -6, y: 12 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<"nodes" | "simulator" | "code">("nodes");
  const [ledState, setLedState] = useState<boolean>(true);
  const [motorSpeed, setMotorSpeed] = useState<number>(180);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse hover 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotY = (mouseX / (rect.width / 2)) * 14;
    const rotX = -(mouseY / (rect.height / 2)) * 14;

    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setRotation({ x: -4, y: 8 });
    }
  };

  // Touch & Mouse Drag handling for 3D orbital rot
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - rotation.y * 3, y: clientY - rotation.x * 3 });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newY = (clientX - dragStart.x) / 3;
    const newX = (clientY - dragStart.y) / 3;
    // Constrain X rotation to prevent flipping upside down
    const clampedX = Math.max(-30, Math.min(30, newX));
    const clampedY = Math.max(-45, Math.min(45, newY));
    setRotation({ x: clampedX, y: clampedY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const toggleNodeCompletion = (id: string) => {
    setCompletedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const activeNode = MODULE_NODES.find((n) => n.id === activeNodeId) || MODULE_NODES[2];
  const progressPercent = Math.round((completedNodes.size / MODULE_NODES.length) * 100);
  const totalXp = Array.from(completedNodes).reduce((acc, id) => {
    const node = MODULE_NODES.find((n) => n.id === id);
    return acc + (node?.xp || 0);
  }, 0);

  return (
    <div className="relative w-full select-none perspective-1000" ref={containerRef}>
      {/* Ambient background glowing particles */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]" />

      {/* Main 3D Card Container */}
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
        className="group relative cursor-grab active:cursor-grabbing rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/90 via-slate-900/95 to-cyan-950/90 p-5 shadow-[0_30px_100px_rgba(2,132,199,0.25)] backdrop-blur-2xl md:p-7"
      >
        {/* Holographic 3D Edge Highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/10 opacity-70 transition-opacity group-hover:opacity-100" />

        {/* Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/20">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                  Interactive 3D Hub
                </span>
                <span className="flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                  Live Sim
                </span>
              </div>
              <h3 className="mt-0.5 text-lg font-black text-white tracking-wide">
                Arduino Foundations v2.0
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-right">
              <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                Learner XP
              </p>
              <p className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Zap className="h-3 w-3 fill-amber-300" />
                {totalXp} XP
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRotation({ x: -6, y: 12 });
                setActiveNodeId("code");
              }}
              title="Reset 3D View"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/15 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 3D Progress Bar */}
        <div className="relative z-10 mt-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300">
            <span>Course Build Progression</span>
            <span className="text-cyan-300">{progressPercent}% Completed</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-slate-900/80 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Interactive Tab Controls */}
        <div className="relative z-10 mt-5 flex rounded-xl border border-white/10 bg-slate-950/60 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("nodes");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === "nodes"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Modules ({MODULE_NODES.length})
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("simulator");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === "simulator"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            3D Circuit Sim
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("code");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === "code"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            Code Engine
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="relative z-10 mt-4 min-h-[220px]">
          {activeTab === "nodes" && (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {MODULE_NODES.map((node) => {
                const Icon = node.icon;
                const isSelected = node.id === activeNodeId;
                const isDone = completedNodes.has(node.id);

                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNodeId(node.id);
                    }}
                    className={`group/node flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
                      isSelected
                        ? "border-cyan-400/80 bg-cyan-500/15 shadow-lg shadow-cyan-500/10 scale-[1.01]"
                        : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNodeCompletion(node.id);
                        }}
                        title={isDone ? "Mark Incomplete" : "Mark Complete"}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-transform duration-200 active:scale-95 ${
                          isDone
                            ? "border-emerald-400/50 bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-400/30"
                            : "border-white/20 bg-white/5 text-slate-400 hover:border-cyan-400 hover:text-cyan-300"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                        ) : (
                          <LockKeyhole className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-black tracking-wide ${
                              isSelected ? "text-cyan-300" : "text-white"
                            }`}
                          >
                            {node.title}
                          </p>
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-amber-300/90">
                            +{node.xp} XP
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 line-clamp-1">
                          {node.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="hidden text-[9px] font-black uppercase tracking-widest text-cyan-300 sm:inline">
                          Active
                        </span>
                      )}
                      <ChevronRight
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          isSelected ? "translate-x-1 text-cyan-400" : "group-hover/node:translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "simulator" && (
            <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/70 p-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Hardware Telemetry & Control
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REES52 Uno Online
                </span>
              </div>

              {/* Interactive Switches */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Pin 13 LED
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLedState(!ledState);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        ledState ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          ledState ? "translate-x-4" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        ledState
                          ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                          : "bg-slate-700"
                      }`}
                    />
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      {ledState ? "HIGH (+5V)" : "LOW (0V)"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                      Motor PWM
                    </span>
                    <span className="text-[10px] font-black text-cyan-300">{motorSpeed} / 255</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={motorSpeed}
                    onChange={(e) => setMotorSpeed(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Circuit Values Grid */}
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(activeNode.circuitValues || []).map((item) => (
                  <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 p-2 text-center">
                    <p className="text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs font-black text-cyan-300">
                      {item.val} <span className="text-[8px] font-normal text-slate-400">{item.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "code" && (
            <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/80 p-4 font-mono animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  main.cpp — REES52 Firmware
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400">C++ / Arduino IDE</span>
              </div>
              <pre className="mt-3 max-h-[150px] overflow-x-auto text-[11px] font-medium leading-relaxed text-slate-200">
                <code>{activeNode.codeSnippet || MODULE_NODES[2].codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Selected Node Details Footer */}
        <div className="relative z-10 mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-[10px] font-semibold text-slate-300 line-clamp-1">
              {activeNode.details}
            </p>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:underline">
            Drag to Rotate 3D
          </span>
        </div>
      </div>
    </div>
  );
}

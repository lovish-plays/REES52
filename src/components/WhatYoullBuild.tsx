"use client";

import { Cpu, Eye, Sparkles, Home, Shield, CloudSun, HardDrive, Settings, Zap } from "lucide-react";

interface ProjectItem {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tech: string[];
  searchTerm: string;
  description: string;
  icon: any;
  color: string;
}

interface WhatYoullBuildProps {
  onSelectProject: (term: string) => void;
}

const PROJECTS: ProjectItem[] = [
  {
    title: "Smart Home Automation",
    difficulty: "Beginner",
    tech: ["ESP32", "WebSockets", "Relays"],
    searchTerm: "Arduino",
    description: "Control household appliances remotely using NodeMCU and wireless WebSocket communication protocols.",
    icon: Home,
    color: "from-cyan-500 to-blue-500"
  },
  {
    title: "Line Follower Robot",
    difficulty: "Beginner",
    tech: ["Arduino Uno", "L298N", "IR Sensors"],
    searchTerm: "Robot",
    description: "Assemble a smart autonomous vehicular chassis capable of tracking line tracks using infrared sensor pings.",
    icon: Settings,
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "AI Object Detection System",
    difficulty: "Intermediate",
    tech: ["Raspberry Pi", "Python", "OpenCV"],
    searchTerm: "Drone", // maps to drones/computer-vision
    description: "Train a real-time computer vision classifier targeting local video feed streams via OpenCV framework.",
    icon: Sparkles,
    color: "from-indigo-500 to-purple-500"
  },
  {
    title: "IoT Weather Station",
    difficulty: "Intermediate",
    tech: ["NodeMCU", "DHT11", "Blynk"],
    searchTerm: "DHT11",
    description: "Pipe humidity and atmospheric temperature logs directly to a cloud dashboard telemetry app.",
    icon: CloudSun,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Smart Security System",
    difficulty: "Advanced",
    tech: ["Raspberry Pi", "PIR Sensor", "Camera"],
    searchTerm: "Sensor",
    description: "Trigger security alerts and capture snap uploads instantly when infrared motion sensors are triggered.",
    icon: Shield,
    color: "from-rose-500 to-orange-500"
  },
  {
    title: "Home Automation with ESP32",
    difficulty: "Intermediate",
    tech: ["ESP32", "relays", "Bluetooth"],
    searchTerm: "ESP32",
    description: "Control high-voltage appliances securely using a local ESP32 server interface.",
    icon: Zap,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Raspberry Pi Media Server",
    difficulty: "Advanced",
    tech: ["Raspberry Pi", "Plex", "Linux"],
    searchTerm: "Drones",
    description: "Deploy a private, local network streaming server hosting movies and files on a Pi board.",
    icon: HardDrive,
    color: "from-teal-500 to-cyan-500"
  }
];

export default function WhatYoullBuild({ onSelectProject }: WhatYoullBuildProps) {
  return (
    <div className="space-y-6 my-8">
      <div className="flex flex-col items-center text-center space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">
          What You'll Build
        </h2>
        <p className="text-slate-655 text-xs font-semibold uppercase tracking-widest max-w-xl">
          Outcome-focused project learning. Apply your coding knowledge directly to physical hardware.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROJECTS.map((proj, idx) => {
          const ProjIcon = proj.icon;
          return (
            <div
              key={proj.title}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-cyan-500/35 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                {/* Visual Header / Graphic Frame */}
                <div className={`relative w-full h-32 rounded-xl bg-gradient-to-br ${proj.color} flex items-center justify-center overflow-hidden`}>
                  <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:12px_12px]" />
                  <div className="absolute w-20 h-20 rounded-full bg-white/10 blur-xl animate-pulse" />
                  <ProjIcon className="w-12 h-12 text-white relative z-10" />
                  
                  {/* Difficulty Badge */}
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${
                    proj.difficulty === "Beginner" ? "border-emerald-250/20 bg-emerald-950/70 text-emerald-300" :
                    proj.difficulty === "Intermediate" ? "border-amber-250/20 bg-amber-950/70 text-amber-300" :
                    "border-rose-250/20 bg-rose-950/70 text-rose-300"
                  }`}>
                    {proj.difficulty}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-sm font-black text-slate-900 tracking-wide uppercase leading-tight mt-4 truncate">
                  {proj.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-1.5 line-clamp-2">
                  {proj.description}
                </p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {proj.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md border border-slate-100 bg-slate-50 text-[8.5px] font-black uppercase tracking-wider text-slate-650"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Related Link trigger */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectProject(proj.searchTerm)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[8.5px] tracking-widest rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Tutorials</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

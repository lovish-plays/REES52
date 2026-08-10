"use client";

import { X, Play, Bookmark, BookmarkCheck, Clock, Layers, Sparkles, AlertCircle } from "lucide-react";

interface QuickPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: "video" | "ebook";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  categoryName: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onStartLearning: () => void;
}

export default function QuickPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  difficulty,
  duration,
  categoryName,
  isBookmarked,
  onBookmarkToggle,
  onStartLearning,
}: QuickPreviewModalProps) {
  if (!isOpen) return null;

  // Custom mock specifications mapping based on project title
  const getRequiredComponents = () => {
    if (title.toLowerCase().includes("spider") || title.toLowerCase().includes("robot")) {
      return ["Arduino Nano R3 Board", "SG90 Servo Motors (x4)", "HC-SR04 Ultrasonic Distance Sensor", "3D Printed Spider Chassis Kit", "9V Battery Snapper & Switch"];
    }
    if (title.toLowerCase().includes("moisture") || title.toLowerCase().includes("soil") || title.toLowerCase().includes("iot")) {
      return ["NodeMCU ESP8266 Wi-Fi Module", "Capacitive Soil Moisture Sensor v1.2", "SSD1306 0.96\" OLED Display", "Active Buzzer & LED telemetry kit", "Breadboard & Dupont Jumper Wires"];
    }
    return ["Arduino UNO Board", "Ultrasonic Sensor Module HC-SR04", "Active Piezo Buzzer", "Red & Green Telemetry LEDs", "5V USB Power Source"];
  };

  const getLearningOutcomes = () => {
    if (title.toLowerCase().includes("spider") || title.toLowerCase().includes("robot")) {
      return ["Understand leg gait kinematics and multi-servo calibration schemes.", "Program automated autonomous obstacle evasion and routing logs.", "Interface servo drivers cleanly with microcontrollers."];
    }
    if (title.toLowerCase().includes("moisture") || title.toLowerCase().includes("soil") || title.toLowerCase().includes("iot")) {
      return ["Establish stable cloud analytics metrics via local Wi-Fi pings.", "Calibrate capacitive vs resistive sensor telemetry maps.", "Design web dashboards reading real-time serial hooks."];
    }
    return ["Configure trigger/echo frequency waves on ultrasonic pings.", "Build fast hardware conditional logic reacting to environmental obstacles.", "Calibrate real-world hardware feedback loops (sound & light warnings)."];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-lg w-full max-h-[90vh] bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl relative animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        
        {/* Decorative Glowing Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600" />

        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 hover:rotate-90 hover:scale-110 cursor-pointer"
          aria-label="Close preview modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1 p-6 pr-8 space-y-5 no-scrollbar">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest ${
                type === "video" ? "border-blue-200 bg-blue-50 text-blue-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"
              }`}>
                {type === "video" ? "Video Lecture" : "Ebook"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {categoryName}
              </span>
            </div>
            
            <h2 className="text-slate-900 text-lg md:text-xl font-black uppercase tracking-wide leading-tight mt-2.5">
              {title}
            </h2>
          </div>

          {/* Quick Specifications Metadata Box */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white/60 border border-slate-200/60 rounded-xl">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-[8px] text-slate-400 font-extrabold uppercase">DIFFICULTY</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">{difficulty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-[8px] text-slate-400 font-extrabold uppercase">DURATION</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">{duration}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Project Overview
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {description || "Explore this comprehensive companion course module designed for the REES52 DIY prototyping platform. Integrate microcontrollers with sensors, configure schematic diagrams, and construct autonomous embedded systems."}
            </p>
          </div>

          {/* Required Components Checklist */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Hardware Kit Required
            </h4>
            <ul className="grid grid-cols-1 gap-1.5">
              {getRequiredComponents().map((comp, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[10.5px] text-slate-650 font-semibold">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-600 flex-shrink-0" />
                  <span>{comp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Outcomes Checklist */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-cyan-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Learning Outcomes
            </h4>
            <ul className="grid grid-cols-1 gap-1.5">
              {getLearningOutcomes().map((out, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[10.5px] text-slate-650 font-semibold leading-relaxed">
                  <span className="text-cyan-700 font-bold">✓</span>
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action triggers */}
          <div className="pt-4 border-t border-slate-200/60 flex items-center gap-3">
            <button
              onClick={onStartLearning}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] transition-transform duration-200 premium-btn-interactive"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Start Learning</span>
            </button>

            <button
              onClick={onBookmarkToggle}
              className={`px-4 py-3 rounded-xl border font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-[1.01] ${
                isBookmarked 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800" 
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

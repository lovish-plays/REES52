"use client";

import React, { useState, useCallback } from "react";
import {
  Cpu,
  Activity,
  Code2,
  Play,
  RotateCcw,
  ArrowRight,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { use3DRobotOrbit } from "@/hooks/use3DRobotOrbit";

type HardwareTab = "arduino" | "esp32" | "robotics" | "drone";

interface HardwareModule {
  id: HardwareTab;
  title: string;
  subtitle: string;
  badge: string;
  mcu: string;
  clock: string;
  voltage: string;
  description: string;
  codeSnippet: string;
  telemetry: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
    label3: string;
    val3: string;
  };
}

const HARDWARE_MODULES: Record<HardwareTab, HardwareModule> = {
  arduino: {
    id: "arduino",
    title: "Arduino Uno R3",
    subtitle: "Microcontroller Board",
    badge: "BEGINNER READY",
    mcu: "ATmega328P",
    clock: "16 MHz",
    voltage: "5.0 V DC",
    description: "Digital Pin 9 PWM LED Pulse & Servo Arm Controller",
    codeSnippet: `// REES52 Arduino Uno R3 LED Pulse
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  for(int val = 0; val <= 255; val += 5) {
    analogWrite(ledPin, val);
    delay(20);
  }
}`,
    telemetry: {
      label1: "PWM Output",
      val1: "88%",
      label2: "GPIO Pins",
      val2: "14 Digital",
      label3: "Flash Memory",
      val3: "32 KB",
    },
  },
  esp32: {
    id: "esp32",
    title: "ESP32 Wi-Fi / BLE",
    subtitle: "Dual-Core IoT Node",
    badge: "WIRELESS IOT",
    mcu: "Xtensa LX6",
    clock: "240 MHz",
    voltage: "3.3 V DC",
    description: "Real-time MQTT Sensor Telemetry & Web Dashboard Server",
    codeSnippet: `// REES52 ESP32 Web Server & Telemetry
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);

void handleRoot() {
  server.send(200, "text/json", "{\\"temp\\":24.5,\\"status\\":\\"OK\\"}");
}

void setup() {
  WiFi.softAP("REES52-ESP32-IoT");
  server.on("/", handleRoot);
  server.begin();
}`,
    telemetry: {
      label1: "Wi-Fi Signal",
      val1: "-42 dBm",
      label2: "SRAM Free",
      val2: "328 KB",
      label3: "Protocols",
      val3: "MQTT / HTTP",
    },
  },
  robotics: {
    id: "robotics",
    title: "4WD Smart Robot Car",
    subtitle: "Autonomous Vehicle",
    badge: "ROBOTICS KIT",
    mcu: "ATmega2560",
    clock: "16 MHz",
    voltage: "7.4 V LiPo",
    description: "Ultrasonic Obstacle Radar & Dual Motor Driver H-Bridge",
    codeSnippet: `// REES52 4WD Robot Radar Navigation
#include <NewPing.h>

NewPing sonar(12, 11, 200);

void loop() {
  int distance = sonar.ping_cm();
  if (distance < 20 && distance > 0) {
    turnRight(); // Obstacle detected
  } else {
    moveForward();
  }
}`,
    telemetry: {
      label1: "Sonar Distance",
      val1: "48 cm",
      label2: "Motor Speed",
      val2: "120 RPM",
      label3: "Gyro Yaw",
      val3: "+4.2°",
    },
  },
  drone: {
    id: "drone",
    title: "F450 DIY Drone",
    subtitle: "Quadcopter Flight Controller",
    badge: "AERODYNAMICS",
    mcu: "STM32F405",
    clock: "168 MHz",
    voltage: "11.1 V 3S",
    description: "PID Angle Stabilization & 6-DOF Gyroscope / Accelerometer",
    codeSnippet: `// REES52 Drone PID Stabilization Loop
void calculatePID() {
  pitchError = gyroPitch - setpointPitch;
  pitchPID = (Kp * pitchError) + (Ki * pitchSum) + (Kd * (pitchError - prevPitchError));
  motor1 = throttle + pitchPID;
  motor2 = throttle - pitchPID;
}`,
    telemetry: {
      label1: "Hover Throttle",
      val1: "52%",
      label2: "6-DOF IMU",
      val2: "Active",
      label3: "ESC Refresh",
      val3: "400 Hz",
    },
  },
};

export default function InteractiveCyberLabConsole() {
  const {
    containerRef,
    rotation,
    isDragging,
    handleMouseMove,
    handleMouseLeave,
    handleStart,
    handleMove,
    handleEnd,
  } = use3DRobotOrbit({ x: -4, y: 6 });

  const [activeTab, setActiveTab] = useState<HardwareTab>("arduino");
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [powerBoost, setPowerBoost] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<"telemetry" | "code">("telemetry");

  const currentModule = HARDWARE_MODULES[activeTab];

  const handleRunSimulation = useCallback(() => {
    setIsRunningSim(true);
    setTimeout(() => setIsRunningSim(false), 2500);
  }, []);

  const handlePowerBoost = useCallback(() => {
    setPowerBoost(true);
    setTimeout(() => setPowerBoost(false), 2000);
  }, []);

  return (
    <div className="relative w-full select-none perspective-1000" ref={containerRef}>
      {/* Background ambient glowing spheres */}
      <div className="pointer-events-none absolute -left-12 -top-12 h-80 w-80 rounded-full bg-cyan-500/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-emerald-500/20 blur-[140px]" />

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
        className="group relative cursor-grab active:cursor-grabbing rounded-3xl border border-cyan-400/35 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-cyan-950/95 p-6 shadow-[0_30px_100px_rgba(2,132,199,0.3)] backdrop-blur-2xl md:p-8"
      >
        {/* Holographic Edge Glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/10 opacity-70 transition-opacity group-hover:opacity-100" />

        {/* Top Header Bar: Hardware Selector Tabs */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/20 text-cyan-300">
              <Cpu className="h-4 w-4 animate-pulse" />
            </span>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-400">
                REES52 Hardware Telemetry
              </span>
              <h3 className="text-sm font-black text-white leading-none mt-0.5">
                Cyber-Lab Console v3.2
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-950/80 p-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("arduino");
              }}
              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeTab === "arduino"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Arduino
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("esp32");
              }}
              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeTab === "esp32"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ESP32 IoT
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("robotics");
              }}
              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeTab === "robotics"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              4WD Robot
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("drone");
              }}
              className={`rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeTab === "drone"
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              F450 Drone
            </button>
          </div>
        </div>

        {/* Core Hardware Display Module */}
        <div className="relative z-10 my-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Module Specs */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-300">
                  {currentModule.badge}
                </span>
                <span className="text-[9px] font-bold text-slate-400">
                  {currentModule.subtitle}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-white tracking-tight">
                {currentModule.title}
              </h2>
              <p className="mt-1 text-xs font-semibold text-slate-300 leading-relaxed max-w-md">
                {currentModule.description}
              </p>

              {/* Hardware Quick Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Processor
                  </p>
                  <p className="mt-1 text-xs font-black text-cyan-300">
                    {currentModule.mcu}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Clock Speed
                  </p>
                  <p className="mt-1 text-xs font-black text-emerald-300">
                    {currentModule.clock}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-2.5">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                    Operating Volt
                  </p>
                  <p className="mt-1 text-xs font-black text-amber-300">
                    {currentModule.voltage}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual MCU Board Chip */}
            <div className="relative flex justify-center py-2 lg:py-0">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handlePowerBoost();
                }}
                title="Click MCU Core to Overclock"
                className="group/chip relative cursor-pointer flex flex-col items-center justify-center rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 shadow-[0_0_40px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-105 hover:border-cyan-300"
              >
                {/* Glowing Core Pulsing Circuit Ring */}
                <div
                  className={`relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-cyan-300/80 bg-gradient-to-tr from-cyan-900/60 via-slate-900 to-emerald-900/60 shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all duration-500 ${
                    powerBoost ? "scale-110 border-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.8)]" : ""
                  }`}
                >
                  <div className="absolute inset-2 rounded-xl border border-dashed border-cyan-400/50 animate-[spin_10s_linear_infinite]" />
                  <Cpu
                    className={`h-10 w-10 text-cyan-300 transition-transform duration-300 group-hover/chip:rotate-180 ${
                      powerBoost ? "text-amber-300 animate-bounce" : ""
                    }`}
                  />
                  <div
                    className={`absolute -bottom-2 rounded-full border border-cyan-300/60 bg-slate-950 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                      powerBoost ? "text-amber-300" : "text-cyan-300"
                    }`}
                  >
                    {powerBoost ? "OVERCLOCK 200%" : "MCU ACTIVE"}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-slate-400">
                  <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                  <span>Interactive 3D Hardware Core</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle Bar (Telemetry vs Code Inspection) */}
        <div className="relative z-20 mt-2 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveView("telemetry");
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeView === "telemetry"
                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Gauge className="h-3.5 w-3.5" />
              Live Telemetry
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveView("code");
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition ${
                activeView === "code"
                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-300"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Embedded Code
            </button>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRunSimulation();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/35"
          >
            {isRunningSim ? (
              <>
                <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                Simulating...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-emerald-300" />
                Run Simulation
              </>
            )}
          </button>
        </div>

        {/* Dynamic Display Area (Telemetry Gauges OR Code Inspector) */}
        <div className="relative z-10 mt-3 rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs shadow-inner">
          {activeView === "telemetry" ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {currentModule.telemetry.label1}
                </span>
                <p className="mt-1 text-sm font-black text-cyan-300">
                  {isRunningSim ? "CALCULATING..." : currentModule.telemetry.val1}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {currentModule.telemetry.label2}
                </span>
                <p className="mt-1 text-sm font-black text-emerald-300">
                  {currentModule.telemetry.val2}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {currentModule.telemetry.label3}
                </span>
                <p className="mt-1 text-sm font-black text-amber-300">
                  {currentModule.telemetry.val3}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto text-[10px] text-cyan-200 leading-relaxed font-mono">
              <pre className="whitespace-pre">{currentModule.codeSnippet}</pre>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Hardware Labs Ready
          </span>
          <Link
            href="/courses"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition"
          >
            Start Course Labs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

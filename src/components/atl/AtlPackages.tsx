"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Bot,
  Box,
  CheckCircle2,
  Cpu,
  Flame,
  Layers,
  Package,
  Printer,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

type PackageTab = "p1" | "p2" | "p3" | "p4";

interface PackageItem {
  name: string;
  qty: string;
  description: string;
  badge?: string;
}

interface PackageCategory {
  id: PackageTab;
  tabLabel: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  color: string;
  borderColor: string;
  badgeColor: string;
  items: PackageItem[];
}

const PACKAGES: Record<PackageTab, PackageCategory> = {
  p1: {
    id: "p1",
    tabLabel: "P1 - Electronics & Robotics",
    title: "Package 1: Electronics, Microcontrollers & Robotics",
    subtitle: "Core STEM Computing & Wireless Sensor Development",
    icon: Cpu,
    badge: "Package P1",
    color: "from-cyan-500/20 via-slate-900 to-blue-950/80",
    borderColor: "border-cyan-500/40",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    items: [
      {
        name: "Arduino Uno R3 Microcontroller Board",
        qty: "15 Units",
        description: "Official ATmega328P Development board for digital/analog circuit programming.",
        badge: "Core MCU",
      },
      {
        name: "Raspberry Pi 4 Model B (4GB RAM)",
        qty: "5 Units",
        description: "Quad-core ARM 64-bit single board computer for Linux & Python AI edge projects.",
        badge: "Linux SBC",
      },
      {
        name: "Sensor Super-Kit Pack (37-in-1)",
        qty: "10 Sets",
        description: "Ultrasonic HC-SR04, IR Obstacle, DHT11 Temp/Humidity, PIR Motion, Bluetooth HC-05.",
        badge: "Sensors",
      },
      {
        name: "L298N Dual H-Bridge Motor Driver Modules",
        qty: "10 Units",
        description: "High power motor controller for 4WD smart cars & DC motor speed control.",
      },
      {
        name: "DIY Quadcopter Drone Aerodynamics Kit",
        qty: "2 Kits",
        description: "F450 Frame, brushless motors, ESC 30A, 6-DOF gyro flight controller & transmitter.",
        badge: "Aviation",
      },
      {
        name: "Solderless Breadboards & Jumper Wires",
        qty: "30 Sets",
        description: "830-point solderless breadboards with male-to-male, female-to-female jumper wire ribbons.",
      },
    ],
  },
  p2: {
    id: "p2",
    tabLabel: "P2 - Rapid Prototyping",
    title: "Package 2: 3D Printing & Rapid Prototyping",
    subtitle: "Additive Manufacturing & CAD Model Creation",
    icon: Printer,
    badge: "Package P2",
    color: "from-orange-500/20 via-slate-900 to-amber-950/80",
    borderColor: "border-orange-500/40",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-400/30",
    items: [
      {
        name: "FDM Industrial Dual-Extruder 3D Printer",
        qty: "1 Unit",
        description: "High precision 220x220x250mm build volume with heated bed, auto-leveling & Resume Print.",
        badge: "3D Printer",
      },
      {
        name: "PLA & ABS Filament Spools (1kg each)",
        qty: "10 Rolls",
        description: "1.75mm high strength non-toxic PLA (Red, Blue, Black, White) & ABS filament spools.",
        badge: "Consumables",
      },
      {
        name: "Ergonomic 3D Drawing Pens with OLED",
        qty: "5 Units",
        description: "Low-temperature safety 3D pens for freehand spatial structure & architectural modeling.",
      },
      {
        name: "Precision Cutting Tools & Craft Mats",
        qty: "5 Sets",
        description: "A3 self-healing cutting mats, precision hobby knives, acrylic rulers & hot glue guns.",
      },
      {
        name: "Balsa Wood & Acrylic Fabrication Sheets",
        qty: "25 Pack",
        description: "Assorted thickness balsa wood strips, foam boards, and transparent acrylic sheets.",
      },
      {
        name: "CAD Slicing Software License & STL Library",
        qty: "Unlimited",
        description: "Pre-configured Cura & Tinkercad slicing profiles with 500+ pre-tested STEM 3D models.",
      },
    ],
  },
  p3: {
    id: "p3",
    tabLabel: "P3 - Mechanical & Tools",
    title: "Package 3: Mechanical Fabrication & Measurement",
    subtitle: "Precision Soldering, Drilling & Testing Workstation",
    icon: Wrench,
    badge: "Package P3",
    color: "from-purple-500/20 via-slate-900 to-indigo-950/80",
    borderColor: "border-purple-500/40",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    items: [
      {
        name: "ESD-Safe Temperature Controlled Soldering Station",
        qty: "5 Workstations",
        description: "60W digital display soldering iron station with brass tip cleaner & magnifying helping-hands.",
        badge: "Soldering",
      },
      {
        name: "Digital Auto-Ranging Multimeters",
        qty: "10 Units",
        description: "AC/DC voltage, current, resistance, continuity buzzer & transistor hFE test meters.",
        badge: "Measurement",
      },
      {
        name: "Variable Speed Rotary Hand Drill & Bits",
        qty: "2 Sets",
        description: "130W mini drill tool with 100+ accessory bits for grinding, polishing, and PCB drilling.",
      },
      {
        name: "Binocular Stereo Student Microscope",
        qty: "2 Units",
        description: "40X-1000X magnification optical microscope for material inspection and component check.",
      },
      {
        name: "Precision Screwdriver & Mechanical Toolkit",
        qty: "10 Toolboxes",
        description: "Chrome vanadium magnetic bit set, wire strippers, needle nose pliers & diagonal cutters.",
      },
      {
        name: "Digital Vernier Caliper (150mm Stainless)",
        qty: "5 Units",
        description: "LCD digital micrometer caliper for high precision 0.01mm mechanical dimension measurement.",
      },
    ],
  },
  p4: {
    id: "p4",
    tabLabel: "P4 - Power & Safety",
    title: "Package 4: Power Supply, Safety & First Aid",
    subtitle: "Regulated Power Bench & Certified Safety Gear",
    icon: ShieldCheck,
    badge: "Package P4",
    color: "from-emerald-500/20 via-slate-900 to-teal-950/80",
    borderColor: "border-emerald-500/40",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    items: [
      {
        name: "Regulated Variable Bench DC Power Supply",
        qty: "2 Units",
        description: "0-30V 0-5A adjustable regulated DC power supply with digital LED voltage & current display.",
        badge: "Power Bench",
      },
      {
        name: "Rechargeable LiPo & 18650 Battery Pack",
        qty: "10 Sets",
        description: "High capacity 7.4V LiPo batteries with balance charger and fireproof LiPo Guard storage bags.",
        badge: "Safety Power",
      },
      {
        name: "ABC Dry Powder Fire Extinguisher (4kg)",
        qty: "2 Tanks",
        description: "IS-certified 4kg ABC powder fire extinguisher tank for electrical and chemical lab safety.",
        badge: "Fire Safety",
      },
      {
        name: "Comprehensive Emergency First Aid Kit",
        qty: "2 Kits",
        description: "Complete school emergency medical box with antiseptic lotions, burn dressings & bandages.",
      },
      {
        name: "Anti-Static ESD Wrist Straps & Safety Goggles",
        qty: "20 Sets",
        description: "Grounding anti-static wrist straps & clear polycarbonate eye protection goggles for all students.",
      },
      {
        name: "Lab Safety Manual & NITI Compliance Posters",
        qty: "1 Set",
        description: "Laminated electrical safety wall posters, emergency contact boards & lab protocol handbooks.",
      },
    ],
  },
};

export default function AtlPackages() {
  const [activeTab, setActiveTab] = useState<PackageTab>("p1");
  const currentPkg = PACKAGES[activeTab];

  return (
    <section id="lab-packages" className="relative bg-slate-950 py-16 text-white md:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Package className="h-4 w-4 text-cyan-400" />
            <span>NITI Aayog Approved ATL Guidelines</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Explore The 4 Official{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
              ATL Equipment Packages
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base leading-relaxed">
            Every package is 100% compliant with NITI Aayog ATL guidelines. Switch between tabs below to view detailed equipment lists.
          </p>
        </div>

        {/* Interactive Tabs Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-2 max-w-4xl mx-auto backdrop-blur-xl">
          {(["p1", "p2", "p3", "p4"] as PackageTab[]).map((tabKey) => {
            const pkg = PACKAGES[tabKey];
            const Icon = pkg.icon;
            const isActive = activeTab === tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`relative flex items-center gap-2.5 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{pkg.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content Panel */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl border ${currentPkg.borderColor} bg-gradient-to-br ${currentPkg.color} p-6 shadow-2xl backdrop-blur-2xl sm:p-10`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6 mb-8">
                <div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${currentPkg.badgeColor}`}>
                    <Sparkles className="h-3 w-3" />
                    {currentPkg.badge}
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                    {currentPkg.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 font-medium">
                    {currentPkg.subtitle}
                  </p>
                </div>

                <a
                  href="#consultation-form"
                  className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-950 hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 shrink-0"
                >
                  <Package className="h-4 w-4 text-slate-950" />
                  <span>Request Full Quotation</span>
                </a>
              </div>

              {/* Grid of Equipment Items */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentPkg.items.map((item) => (
                  <motion.div
                    key={item.name}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-blue-400/50 hover:bg-slate-950"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-300 border border-blue-400/30">
                          Qty: {item.qty}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <h4 className="mt-3 text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </h4>
                      <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 pt-3 border-t border-white/5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>NITI Aayog Compliant</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

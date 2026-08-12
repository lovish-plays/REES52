"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Compass,
  FileSpreadsheet,
  Globe,
  Landmark,
  MapPin,
  PenTool,
  Rocket,
  ShieldAlert,
} from "lucide-react";

const TIMELINE_STEPS = [
  {
    step: "01",
    title: "School Registration",
    badge: "Official Portal",
    link: "aim.gov.in",
    description:
      "School registers on the NITI Aayog Atal Innovation Mission (AIM) portal using school UDISE code, principal credentials, and basic institution details.",
    icon: Globe,
    color: "from-blue-500 to-indigo-600",
    glow: "shadow-blue-500/20",
  },
  {
    step: "02",
    title: "Application & Vision Document Submission",
    badge: "STEM Plan",
    description:
      "Submit a detailed Vision Document outlining your school's STEM activities, student enrolment, faculty readiness, and dedicated space allocation.",
    icon: FileSpreadsheet,
    color: "from-orange-500 to-amber-600",
    glow: "shadow-orange-500/20",
  },
  {
    step: "03",
    title: "NITI Aayog Evaluation & Selection",
    badge: "Government Audit",
    description:
      "AIM committee evaluates applications based on school track record, infrastructure readiness, and commitment to neoteric innovation. Selected schools are notified via official list.",
    icon: Landmark,
    color: "from-purple-500 to-indigo-600",
    glow: "shadow-purple-500/20",
  },
  {
    step: "04",
    title: "MoU Agreement & REES52 Lab Installation",
    badge: "Turn-Key Execution",
    description:
      "Sign the Memorandum of Understanding (MoU), open dedicated PFMS bank account, receive 1st Grant tranche of ₹10 Lakhs, and let REES52 deliver & setup P1-P4 equipment within 2 weeks.",
    icon: Rocket,
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
  },
];

export default function AtlTimeline() {
  return (
    <section id="timeline" className="relative bg-slate-950 py-16 text-white md:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-orange-300">
            <Compass className="h-4 w-4 text-orange-400" />
            <span>Step-By-Step Setup Roadmap</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            4 Simple Steps to Setup Your{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
              Atal Tinkering Lab
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base leading-relaxed">
            From initial NITI Aayog portal application to final lab inauguration and teacher training, REES52 guides your school every step of the way.
          </p>
        </div>

        {/* 1,500 Sq. Ft. Mandatory Space Highlight Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 p-6 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-amber-400/40 bg-amber-500/20 p-3 text-amber-300 shrink-0">
                <ShieldAlert className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300 border border-amber-400/30">
                  Mandatory Infrastructure Prerequisite
                </span>
                <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                  Dedicated 1,500 Sq. Ft. Space Required
                </h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                  NITI Aayog mandates a minimum dedicated floor area of <strong>1,500 sq. ft.</strong> (1,000 sq. ft. for hilly/island states) with proper electrical wiring, ventilation, storage racks, and internet connectivity to host P1-P4 equipment safely.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-center">
              <div className="text-2xl font-black text-amber-400">1,500 Sq. Ft.</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                Minimum Built-Up Floor Area
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeline Steps Grid */}
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-32 space-y-12 pl-6 md:pl-10">
          {TIMELINE_STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Node circle on vertical line */}
                <div className="absolute -left-[31px] md:-left-[47px] top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-900 text-white shadow-lg transition-transform duration-300 group-hover:scale-125">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${item.color} text-white font-black text-xs shadow-md`}>
                    {item.step}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-300">
                      Step {item.step} • {item.badge}
                    </span>
                    {item.link && (
                      <a
                        href={`https://${item.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{item.link}</span>
                        <Globe className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className={`rounded-2xl bg-gradient-to-r ${item.color} p-3 text-white shadow-lg ${item.glow}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-white">
                      {item.title}
                    </h3>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

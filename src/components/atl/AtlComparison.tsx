"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Check,
  CheckCircle2,
  Clock,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "NITI Aayog Guideline Compliance",
    rees52: "100% Verified P1 to P4 Equipment Packages",
    competitor: "Partial / Non-Standard Equipment Kits",
    isRees52Better: true,
  },
  {
    feature: "1,500 Sq. Ft. 3D Lab Blueprint Design",
    rees52: "Free Custom 3D Architectural & Electrical Layout",
    competitor: "Not Provided / Generic Static Blueprint",
    isRees52Better: true,
  },
  {
    feature: "Delivery & Turnkey Setup Timeline",
    rees52: "< 2 Weeks (Express Nationwide Logistics)",
    competitor: "1 to 2 Months (Delayed Shipment)",
    isRees52Better: true,
  },
  {
    feature: "Teacher Training & Certification",
    rees52: "5-Day Hands-on Onsite Master Educator Training",
    competitor: "1-Hour Basic Video Call or User Manual",
    isRees52Better: true,
  },
  {
    feature: "PFMS Portal & Audit UC Assistance",
    rees52: "End-to-End Audit & Utilization Certificate Support",
    competitor: "Zero Guidance on Government Audits",
    isRees52Better: true,
  },
  {
    feature: "Warranty & Technical Support",
    rees52: "1-Year Instant Replacement Warranty & 24/7 Helpline",
    competitor: "Limited Warranty / Long RMA Repair Delay",
    isRees52Better: true,
  },
];

export default function AtlComparison() {
  return (
    <section id="comparison" className="relative bg-slate-900 py-16 text-white md:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Why Schools Trust REES52</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why REES52 Is India’s #1{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
              ATL Turnkey Partner
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base leading-relaxed">
            See how REES52 compares against generic equipment vendors and unorganized suppliers when setting up Atal Tinkering Labs.
          </p>
        </div>

        {/* Comparison Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl backdrop-blur-2xl"
        >
          <div className="grid grid-cols-12 border-b border-slate-800 bg-slate-900/90 p-4 sm:p-6 text-xs font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5 sm:col-span-4">Evaluation Metric</div>
            <div className="col-span-4 sm:col-span-4 text-center text-blue-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-400 hidden sm:inline" />
              <span>REES52 ATL Partner</span>
            </div>
            <div className="col-span-3 sm:col-span-4 text-center text-slate-400">
              General Vendors
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {COMPARISON_ROWS.map((row, idx) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="grid grid-cols-12 items-center p-4 sm:p-6 text-xs sm:text-sm hover:bg-slate-900/50 transition-colors"
              >
                <div className="col-span-5 sm:col-span-4 font-black text-white pr-2">
                  {row.feature}
                </div>

                <div className="col-span-4 sm:col-span-4 text-center font-bold text-emerald-300 px-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] sm:text-xs leading-snug">{row.rees52}</span>
                </div>

                <div className="col-span-3 sm:col-span-4 text-center text-slate-400 px-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-400/30">
                    <X className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 leading-snug">{row.competitor}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-950/60 via-slate-950 to-orange-950/60 p-6 text-center border-t border-slate-800">
            <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join 500+ leading schools across India that chose REES52 for hassle-free ATL installation, certified teacher training, and ongoing technical support.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

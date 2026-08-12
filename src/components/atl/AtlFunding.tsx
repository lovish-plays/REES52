"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Award,
  Building2,
  CheckCircle2,
  Coins,
  FileCheck2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function AtlFunding() {
  return (
    <section id="funding" className="relative bg-slate-900 py-16 text-white md:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-300">
            <Coins className="h-4 w-4 text-blue-400" />
            <span>Government Grant Funding &amp; Financial Support</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            ₹20 Lakh Total Grant Breakdown Under{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
              Atal Innovation Mission
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base leading-relaxed">
            The Government of India provides financial support to applicant schools to foster curiosity, creativity, and imagination in young minds across India.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Visual & Grant Summary Card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl"
            >
              <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-blue-900/40 via-slate-900 to-orange-950/40 p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-orange-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-300 border border-orange-500/30">
                    NITI Aayog Official Scheme
                  </span>
                  <Award className="h-6 w-6 text-amber-400" />
                </div>

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Maximum Assistance Per School
                  </div>
                  <div className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">
                    ₹ 20,00,000/-
                  </div>
                  <div className="mt-2 text-xs text-blue-300 font-medium">
                    100% Non-Repayable Financial Grant Disbursement
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-2.5 text-orange-400 shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Eligible Schools</h4>
                    <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                      Govt., Aided, Private, CBSE, ICSE, and State Board schools managing Classes VI to X / XII with minimum 1,500 sq. ft. space.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5 text-blue-400 shrink-0">
                    <FileCheck2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">REES52 Grant Consultation</h4>
                    <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                      We guide your school management through Vision Document submission, PFMS vendor registration, and NITI Aayog portal compliance.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Scroll-Triggered Grant Numbers */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                  Year 1 One-Time Disbursement
                </span>
                <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[9px] font-black text-orange-300">
                  50% Of Grant
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-white sm:text-4xl">
                ₹ 10,00,000
              </div>
              <h4 className="mt-1 text-sm font-black text-orange-200">
                Non-Recurring Capital &amp; Establishment Fund
              </h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Utilized for purchasing P1-P4 ATL STEM equipment (3D printers, Arduino/Raspberry Pi kits, soldering stations, sensors, safety gear, and furniture setup).
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                  Years 2 to 5 Annual Disbursement
                </span>
                <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[9px] font-black text-blue-300">
                  ₹2L / Year
                </span>
              </div>
              <div className="mt-3 text-3xl font-black text-white sm:text-4xl">
                ₹ 10,00,000
              </div>
              <h4 className="mt-1 text-sm font-black text-blue-200">
                Recurring Operational &amp; Maintenance Fund
              </h4>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Released over 5 years (₹2 Lakhs per annum) for consumable raw materials, mentor honorarium, student STEM competition fees, and equipment maintenance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 sm:p-8 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">REES52 PFMS &amp; Utilization Certificate Support</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    We provide itemized invoices, GST bills, and NITI Aayog compliant Audit Utilization Certificates to ensure hassle-free grant release year after year.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

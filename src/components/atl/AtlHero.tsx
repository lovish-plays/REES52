"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Award,
  Bot,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Layers,
  Loader2,
  PhoneCall,
  Printer,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function AtlHero() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    schoolName: "",
    state: "Delhi",
    role: "Principal / Administrator",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/atl/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit lead form.");
      }

      setSubmittedSuccess(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="consultation-form" className="relative overflow-hidden bg-slate-950 py-16 text-white md:py-24">
      {/* Background Floating Elements & Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[180px]" />
      <div className="pointer-events-none absolute right-0 top-10 h-[500px] w-[500px] rounded-full bg-orange-600/15 blur-[180px]" />

      {/* Floating Decorative 3D-Like Gears/Microchips */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-8 top-12 hidden rounded-2xl border border-blue-500/20 bg-blue-950/40 p-3 text-blue-400 backdrop-blur-md lg:block"
      >
        <Cpu className="h-8 w-8 animate-pulse" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 18, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-12 bottom-16 hidden rounded-2xl border border-orange-500/20 bg-orange-950/40 p-3 text-orange-400 backdrop-blur-md lg:block"
      >
        <Printer className="h-8 w-8" />
      </motion.div>

      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Staggered Text Reveal */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-orange-300"
            >
              <Award className="h-4 w-4 text-orange-400" />
              <span>NITI Aayog AIM Govt. Grant Partner</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
            >
              Empowering Neoteric Innovators:{" "}
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
                Build Your Atal Tinkering Lab
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base text-slate-300 leading-relaxed sm:text-lg max-w-2xl"
            >
              Under Prime Minister Narendra Modi’s flagship <strong>Atal Innovation Mission (AIM)</strong> by NITI Aayog, schools receive up to <strong>₹20 Lakhs in Government Grants</strong> to establish state-of-the-art STEM labs. Teach 21st-century skills in <strong>Robotics, 3D Printing, IoT, Electronics &amp; Artificial Intelligence</strong> with REES52 turn-key lab solutions.
            </motion.p>

            {/* Feature Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-xl"
            >
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">Official P1 to P4 Equipment Packages</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">End-to-End Documentation Support</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">On-Site Teacher Certification Training</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 backdrop-blur-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-slate-200">1,500 Sq. Ft. Custom 3D Lab Layouts</span>
              </div>
            </motion.div>

            {/* Stats badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center gap-6 border-t border-slate-800/80 pt-8"
            >
              <div>
                <div className="text-2xl font-black text-orange-400">₹20 Lakhs</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total AIM Govt. Grant</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-2xl font-black text-blue-400">500+</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schools Setup Nationwide</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-2xl font-black text-emerald-400">&lt; 2 Weeks</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fastest Kit Delivery</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Floating Glassmorphism Lead Generation Form */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-3xl border border-blue-400/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-blue-950/95 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-2 text-orange-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white leading-tight">
                    Contact Our Lab Expert
                  </h3>
                  <p className="text-xs text-slate-400">
                    Get Free 3D Blueprint Design &amp; Grant Assistance
                  </p>
                </div>
              </div>

              {submittedSuccess ? (
                <div className="my-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-black">
                    ✓
                  </div>
                  <h4 className="mt-3 text-lg font-black text-emerald-300">Consultation Request Received!</h4>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    Thank you! Our dedicated ATL Lab Specialist will contact you within 24 hours to assist your school with documentation, lab blueprints, and equipment packages.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {errorMessage && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Dr. Rajesh"
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Sharma"
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Official Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="principal@dps-school.edu.in"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">State / Territory</label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="Delhi">Delhi NCR</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Other">Other Indian State</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">School / Institution Name *</label>
                    <input
                      type="text"
                      name="schoolName"
                      required
                      value={formData.schoolName}
                      onChange={handleChange}
                      placeholder="Delhi Public School, Vasant Kunj"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300">Your Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Principal / Administrator">Principal / Trustee / Director</option>
                      <option value="STEM / Robotics Teacher">STEM / Robotics Educator</option>
                      <option value="ATL In-Charge">ATL In-Charge Teacher</option>
                      <option value="Management / Procurement">School Procurement Team</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/35 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                        Submitting Lead...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-slate-950" />
                        Request Free ATL Consultation
                      </>
                    )}
                  </button>

                  <p className="text-[9px] text-center text-slate-400">
                    🔒 We respect your privacy. Zero spam. 100% NITI Aayog grant compliant guidance.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

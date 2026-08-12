"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Quote,
  Star,
  Users,
} from "lucide-react";

const INSTITUTIONS = [
  { name: "IIT Bombay", location: "Mumbai" },
  { name: "NIT Patna", location: "Patna" },
  { name: "Manipal Institute", location: "Manipal" },
  { name: "TATA Technologies", location: "Pune" },
  { name: "Sona College of Tech", location: "Salem" },
  { name: "DPS Vasant Kunj", location: "New Delhi" },
  { name: "VIT University", location: "Vellore" },
];

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      "REES52 handled our school's ATL setup with extraordinary speed and precision. Their 1,500 sq. ft. 3D blueprint design utilized our space efficiently, and the P1-P4 equipment arrived within 10 days. The 5-day on-site teacher training was phenomenal!",
    author: "Dr. Sunita Mukherjee",
    role: "Principal",
    school: "Delhi Public School, Vasant Kunj",
    rating: 5,
    tag: "500+ Students Trained",
  },
  {
    id: 2,
    quote:
      "Navigating NITI Aayog's PFMS portal and Utilization Certificates seemed daunting at first, but REES52 provided complete documentation support. Their 3D printers and Arduino sensor kits are extremely durable for school students.",
    author: "Prof. Arvind R. Sharma",
    role: "ATL In-Charge & Vice Principal",
    school: "Sona Public School, Tamil Nadu",
    rating: 5,
    tag: "₹20L Grant Utilized",
  },
  {
    id: 3,
    quote:
      "The quality of REES52's robotics hardware and DIY drone kits is unmatched. Our students won 1st prize in the State-level STEM Innovation Fair using the sensors and microcontrollers supplied in Package P1 & P2.",
    author: "Kavita Deshmukh",
    role: "STEM & Robotics Educator",
    school: "Maharashtra Vidya Mandir, Pune",
    rating: 5,
    tag: "State Award Winners",
  },
];

export default function AtlSocialProof() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="relative bg-slate-950 py-16 text-white md:py-24 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-300">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Trusted Across 500+ Institutions</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Empowering Schools &amp;{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-blue-400 bg-clip-text text-transparent">
              Neoteric Innovators
            </span>
          </h2>
          <p className="mt-4 text-sm text-slate-300 sm:text-base leading-relaxed">
            Leading schools, engineering colleges, and government institutions trust REES52 for ATL equipment and teacher training.
          </p>
        </div>

        {/* Infinite Horizontal Marquee */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 py-6 mb-16 shadow-inner">
          <div className="flex w-full whitespace-nowrap">
            <div className="flex animate-marquee items-center gap-12 text-xs font-black uppercase tracking-widest text-slate-300">
              {INSTITUTIONS.map((inst) => (
                <div key={inst.name} className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 border border-slate-800">
                  <GraduationCap className="h-4 w-4 text-orange-400" />
                  <span>{inst.name}</span>
                  <span className="text-[9px] text-slate-400">({inst.location})</span>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee items-center gap-12 text-xs font-black uppercase tracking-widest text-slate-300 aria-hidden:true">
              {INSTITUTIONS.map((inst) => (
                <div key={inst.name + "-dup"} className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 border border-slate-800">
                  <GraduationCap className="h-4 w-4 text-orange-400" />
                  <span>{inst.name}</span>
                  <span className="text-[9px] text-slate-400">({inst.location})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Testimonial Swiping Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl"
            >
              <Quote className="h-12 w-12 text-blue-500/30 absolute right-8 top-8" />

              <div className="flex items-center gap-1 text-amber-400 mb-6">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
                <span className="ml-3 rounded-full bg-blue-500/20 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-300 border border-blue-400/30">
                  {current.tag}
                </span>
              </div>

              <blockquote className="text-base sm:text-xl font-medium text-slate-200 leading-relaxed italic">
                “{current.quote}”
              </blockquote>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-800 pt-6 gap-4">
                <div>
                  <div className="text-base font-black text-white">{current.author}</div>
                  <div className="text-xs text-orange-400 font-bold mt-0.5">{current.role}</div>
                  <div className="text-xs text-slate-400 font-medium">{current.school}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-400 hover:bg-blue-600 hover:text-white transition"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-400 hover:bg-blue-600 hover:text-white transition"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

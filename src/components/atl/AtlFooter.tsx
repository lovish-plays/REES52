"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  Download,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

export default function AtlFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-16 text-xs">
      <div className="mx-auto max-w-7xl px-[var(--container-padding)]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 mb-12">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-4">
            <Link href="/atl" className="flex items-center gap-3">
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-tr from-blue-700 via-indigo-600 to-orange-500 p-2.5 text-white shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                REES<span className="text-blue-500">52</span> ATL Setup
              </span>
            </Link>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-sm">
              Official turn-key vendor and training partner for setting up NITI Aayog Atal Tinkering Labs (ATL) in schools across India. Complete P1 to P4 equipment packages, 3D lab layout blueprints, and certified teacher training.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400 border border-orange-500/20">
                NITI Aayog AIM Compliant
              </span>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-blue-400 border border-blue-500/20">
                PFMS Verified Vendor
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              ATL Quick Navigation
            </h4>
            <ul className="space-y-2.5 font-bold">
              <li>
                <a href="#lab-packages" className="hover:text-blue-400 transition">
                  P1 - P4 Equipment Packages
                </a>
              </li>
              <li>
                <a href="#funding" className="hover:text-blue-400 transition">
                  ₹20 Lakh Government Grant Breakdown
                </a>
              </li>
              <li>
                <a href="#timeline" className="hover:text-blue-400 transition">
                  1,500 Sq. Ft. Setup Roadmap
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-blue-400 transition">
                  Why Choose REES52 B2B
                </a>
              </li>
              <li>
                <Link href="/labs" className="hover:text-blue-400 transition">
                  3D Virtual Cyber-Lab Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="md:col-span-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">
              Contact ATL Support Desk
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <PhoneCall className="h-4 w-4 text-orange-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Toll-Free ATL Consultation</div>
                  <div className="text-xs font-black text-white">+91 98765 43210 / 011-45678900</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Official B2B &amp; Grant Enquiries</div>
                  <div className="text-xs font-black text-white">atl-support@rees52.com</div>
                </div>
              </div>

              <a
                href="https://aim.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-3 font-bold text-slate-300 hover:border-slate-700 hover:text-white transition"
              >
                <span className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>Visit NITI Aayog Official AIM Portal</span>
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[10px]">
          <p>© {new Date().getFullYear()} REES52 Tech Academy. All rights reserved. NITI Aayog Atal Innovation Mission (AIM) Partner.</p>
          <div className="flex items-center gap-4 font-bold">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of B2B Supply</Link>
            <a href="https://rees52.com" target="_blank" rel="noopener noreferrer" className="hover:underline">REES52 Store</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

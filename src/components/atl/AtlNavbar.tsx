"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  ChevronRight,
  ExternalLink,
  Flame,
  GraduationCap,
  Headphones,
  PhoneCall,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

export default function AtlNavbar() {
  const [cartCount] = useState(2);

  return (
    <header className="sticky top-0 z-50 w-full select-none">
      {/* Top Infinite Announcement Ticker Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-500 to-blue-700 py-1.5 text-white shadow-xs">
        <div className="flex w-full whitespace-nowrap">
          <div className="flex animate-marquee items-center gap-8 text-[11px] font-black uppercase tracking-widest">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 animate-bounce text-yellow-300" />
              Freedom Sale Ends Soon!
            </span>
            <span className="text-yellow-200">★ Up to 60% Off Official NITI Aayog ATL Kits</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />
              Government Grant Assistance Included
            </span>
            <span className="text-yellow-200">★ Free On-Site Teacher Training &amp; 3D Lab Blueprint Design</span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-emerald-200" />
              Express Delivery Across All Indian States (&lt; 2 Weeks)
            </span>
          </div>

          <div className="flex animate-marquee items-center gap-8 text-[11px] font-black uppercase tracking-widest aria-hidden:true">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 animate-bounce text-yellow-300" />
              Freedom Sale Ends Soon!
            </span>
            <span className="text-yellow-200">★ Up to 60% Off Official NITI Aayog ATL Kits</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />
              Government Grant Assistance Included
            </span>
            <span className="text-yellow-200">★ Free On-Site Teacher Training &amp; 3D Lab Blueprint Design</span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-emerald-200" />
              Express Delivery Across All Indian States (&lt; 2 Weeks)
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Sticky Navbar */}
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-2xl transition-all duration-300 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-[var(--container-padding)] py-3">
          {/* Left Brand Identity */}
          <Link href="/atl" className="group flex items-center gap-3">
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-tr from-blue-700 via-indigo-600 to-orange-500 p-2.5 text-white shadow-md shadow-blue-600/20 transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-slate-900">
                  REES<span className="text-blue-700">52</span>{" "}
                  <span className="bg-gradient-to-r from-orange-600 to-blue-700 bg-clip-text text-transparent">
                    ATL Setup
                  </span>
                </span>
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-orange-600 border border-orange-500/20">
                  NITI Aayog Partner
                </span>
              </div>
              <span className="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
                Atal Tinkering Lab Official Vendor &amp; Training Partner
              </span>
            </div>
          </Link>

          {/* Middle Links */}
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/atl#lab-packages"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-blue-700 transition"
            >
              ATL Packages
            </Link>
            <Link
              href="/atl#timeline"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-blue-700 transition"
            >
              Setup Roadmap
            </Link>
            <Link
              href="/atl#funding"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-blue-700 transition"
            >
              Grant ₹20L
            </Link>
            <Link
              href="/atl#comparison"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-blue-700 transition"
            >
              Why Choose Us
            </Link>
            <a
              href="https://rees52.com/collections/stem-kits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-orange-600 transition"
            >
              <span>B2B Store</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3">
            <a
              href="https://rees52.com/collections/stem-kits"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-bold text-white shadow-xs">
                {cartCount}
              </span>
            </a>

            <a
              href="#consultation-form"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-blue-700/20 transition-all duration-300 hover:scale-105 hover:from-blue-800 hover:to-indigo-800"
            >
              <PhoneCall className="h-3.5 w-3.5 text-orange-400" />
              <span>Get Free Consultation</span>
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}

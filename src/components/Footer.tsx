'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Mail, ExternalLink, Cpu, Award } from 'lucide-react';
import { isTeacherRole } from '@/lib/auth/roles';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="w-full glassmorphism border-t border-slate-200/50 py-12 mt-16 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Column 1: Brand Philosophy (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 w-fit premium-logo-group">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-sm premium-logo-icon">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-md tracking-wider text-slate-900 premium-logo-text">
              REES<span className="text-cyan-600">52</span> <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">Academy</span>
            </span>
          </Link>
          <p className="text-xs text-slate-600 leading-relaxed">
            Since 2013, Robotics Embedded Education Services Private Limited (REES52) has been a prominent Indian distributor and manufacturer specializing in robotics, DIY electronics, and IoT components. Popular among makers, students, and the drone racing community, we provide microcontrollers, sensors, starter kits, and specialized FPV drone accessories.
          </p>
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <Award className="w-3.5 h-3.5 text-cyan-600" />
            <span>Empowering Makers Since 2013</span>
          </div>
        </div>

        {/* Column 2: Core Product & Service Categories (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
            <span>Ecosystem Categories</span>
          </h4>
          <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600">
            <li className="flex flex-col">
              <span className="font-bold text-slate-800">Development Boards & Kits</span>
              <span className="text-[10px]">Microcontrollers compatible with Arduino (e.g. UNO R3), Raspberry Pi, and STEM/Tinkering kits.</span>
            </li>
            <li className="flex flex-col">
              <span className="font-bold text-slate-800">Electronic Components</span>
              <span className="text-[10px]">Sensors, relays, motors, and power supply modules.</span>
            </li>
            <li className="flex flex-col">
              <span className="font-bold text-slate-800">Drone Accessories</span>
              <span className="text-[10px]">High-performance propellers and specialized FPV parts.</span>
            </li>
            <li className="flex flex-col">
              <span className="font-bold text-slate-800">Learning & Workshops</span>
              <span className="text-[10px]">Educational IoT training classes and workshops.</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Portal Navigation & Learning (2 cols) */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Learning Portal</h4>
          <ul className="flex flex-col gap-2 text-xs font-semibold">
            <li className="w-fit py-0.5">
              <Link href="/courses" className="premium-nav-link text-slate-700">
                Courses
              </Link>
            </li>
            <li className="w-fit py-0.5">
              <Link href="/projects" className="premium-nav-link text-slate-700">
                Projects
              </Link>
            </li>
            <li className="w-fit py-0.5">
              <Link href="/ebooks" className="premium-nav-link text-slate-700">
                Ebooks
              </Link>
            </li>
            <li className="w-fit py-0.5">
              <Link href="/dashboard" className="premium-nav-link text-slate-700">
                My Learning
              </Link>
            </li>
            {isTeacherRole(user?.role) && (
              <li className="w-fit py-0.5">
                <Link href="/admin" className="premium-nav-link text-slate-900 font-black">
                  Teacher Studio
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Column 4: Store Links, Support & Socials (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Official Store</h4>
            <a
              href="https://rees52.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 w-fit group transition-all duration-300 hover:translate-x-1"
            >
              <span>Explore REES52 Catalog</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:scale-110 transition-transform duration-300" />
            </a>
          </div>

          <div className="flex flex-col gap-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Support Channels</h4>
            <a
              href="mailto:info@rees52.in"
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-cyan-600 transition-all duration-300 hover:translate-x-1 w-fit group"
            >
              <Mail className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform duration-300" />
              <span>info@rees52.in</span>
            </a>
          </div>

          {/* Social connections */}
          <div className="flex flex-col gap-2 mt-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Social Connections</h4>
            <div className="flex items-center gap-2">
              <a
                href="https://www.youtube.com/@REES52_Official"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-rose-600 hover:text-white text-slate-600 transition-all border border-slate-200/50 hover:border-rose-600 premium-social-icon shadow-sm hover:shadow-rose-600/20"
                aria-label="YouTube Channel"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/rees-52/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-blue-700 hover:text-white text-slate-600 transition-all border border-slate-200/50 hover:border-blue-700 premium-social-icon shadow-sm hover:shadow-blue-700/20"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/rees52education/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-600 transition-all border border-slate-200/50 hover:border-blue-600 premium-social-icon shadow-sm hover:shadow-blue-600/20"
                aria-label="Facebook Page"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rees52_b2b"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-gradient-to-tr hover:from-amber-500 hover:via-pink-500 hover:to-purple-600 hover:text-white text-slate-600 transition-all border border-slate-200/50 hover:border-pink-500 premium-social-icon shadow-sm hover:shadow-pink-500/20"
                aria-label="Instagram Handle"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://x.com/rees52education"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white hover:bg-slate-900 hover:text-white text-slate-600 transition-all border border-slate-200/50 hover:border-slate-900 premium-social-icon shadow-sm hover:shadow-slate-900/20"
                aria-label="X Profile"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.73 16h4.27L8.27 4H4z" />
                  <path d="M20 4L13.3 11.7M10.7 14.8L4 22" />
                </svg>
              </a>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 border-t border-slate-200/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
        <span>Copyright 2013 REES52 (Robotics Embedded Education Services Private Limited). All rights reserved.</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-end text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <Link href="/about" className="premium-nav-link text-slate-500 py-0.5">
            About Us
          </Link>
          <Link href="/contact" className="premium-nav-link text-slate-500 py-0.5">
            Contact Us
          </Link>
          <Link href="/privacy" className="premium-nav-link text-slate-500 py-0.5">
            Privacy Policy
          </Link>
          <Link href="/terms" className="premium-nav-link text-slate-500 py-0.5">
            Terms & Conditions
          </Link>
          <Link href="/cookie-policy" className="premium-nav-link text-slate-500 py-0.5">
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

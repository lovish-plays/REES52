"use client";

import Link from "next/link";
import { ExternalLink, GraduationCap, Mail, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isTeacherRole } from "@/lib/auth/roles";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-950 py-12 text-slate-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <span className="rounded-lg bg-sky-500 p-2">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-sm font-black tracking-wider">REES52 Academy</span>
          </Link>
          <p className="mt-4 max-w-md text-xs font-medium leading-relaxed text-slate-400">
            Practical robotics and electronics learning from Robotics Embedded Education Services Private Limited.
            Public courses are listed only when videos, diagrams, code, PDFs and quizzes are complete.
          </p>
          <div className="mt-5 flex flex-col gap-2 text-xs font-semibold">
            <a href="mailto:support@rees52.com" className="inline-flex items-center gap-2 hover:text-sky-300">
              <Mail className="h-4 w-4 text-sky-400" />
              support@rees52.com
            </a>
            <a href="tel:+919599594520" className="inline-flex items-center gap-2 hover:text-sky-300">
              <Phone className="h-4 w-4 text-sky-400" />
              +91 95995 94520
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Explore</h2>
          <nav className="mt-4 flex flex-col gap-2 text-xs font-semibold">
            <Link href="/courses" className="hover:text-sky-300">Courses</Link>
            <Link href="/projects" className="hover:text-sky-300">Projects</Link>
            <Link href="/quizzes" className="hover:text-sky-300">Quizzes</Link>
            <Link href="/leaderboard" className="hover:text-sky-300">Leaderboard</Link>
            <Link href="/ebooks" className="hover:text-sky-300">Ebooks</Link>
            <a
              href="https://rees52.com/collections/stem-kits"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-sky-300"
            >
              Kits
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link href="/about" className="hover:text-sky-300">About</Link>
            <Link href="/login" className="hover:text-sky-300">Sign In</Link>
            {isTeacherRole(user?.role) && (
              <Link href="/admin" className="font-black text-sky-300">Teacher Studio</Link>
            )}
          </nav>
        </div>

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-white">Policies and support</h2>
          <nav className="mt-4 flex flex-col gap-2 text-xs font-semibold">
            <Link href="/contact" className="hover:text-sky-300">Contact</Link>
            <Link href="/privacy" className="hover:text-sky-300">Privacy</Link>
            <Link href="/cookie-policy" className="hover:text-sky-300">Cookies</Link>
            <Link href="/terms" className="hover:text-sky-300">Terms</Link>
            <a
              href="https://rees52.com/pages/tutorials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-sky-300"
            >
              Official tutorials
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-2 border-t border-white/10 px-4 pt-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span>© 2026 Robotics Embedded Education Services Private Limited.</span>
        <span>REES52 Academy</span>
      </div>
    </footer>
  );
}

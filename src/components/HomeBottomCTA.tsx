"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HomeBottomCTA() {
  const { user } = useAuth();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
      <div className="rounded-3xl bg-gradient-to-br from-sky-700 to-cyan-600 px-6 py-12 text-center text-white md:px-12">
        <Trophy className="mx-auto h-9 w-9" />
        <h2 className="mt-4 text-3xl font-black">Choose a complete path and start building.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-sky-50">
          {user
            ? "Track your lesson progress, quiz results, project evidence and course completion in your dashboard."
            : "Create an account to save lesson progress, quiz results, project evidence and course completion."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-sky-800 shadow-sm transition-all hover:bg-sky-50"
          >
            Browse courses
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/20"
            >
              Sign in
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-white/20"
            >
              My Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

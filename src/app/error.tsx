"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("REES52 Academy page error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-amber-700">Something went wrong</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">We could not load this page</h1>
      <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-600">
        Please try again. If the problem continues, return to the catalog and choose another learning path.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => reset()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-500">
          <RefreshCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link href="/courses" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300">
          Browse courses
        </Link>
      </div>
    </div>
  );
}

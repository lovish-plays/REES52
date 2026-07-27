import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </div>
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-700">Page not found</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">That learning path is unavailable</h1>
      <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-600">
        The course, project, or page may have moved. Use the catalog to find the latest REES52 Academy content.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-500">
          Browse courses
        </Link>
        <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-700 hover:border-cyan-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back home
        </Link>
      </div>
    </div>
  );
}

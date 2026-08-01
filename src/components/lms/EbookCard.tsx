import Image from "next/image";
import { Download, Eye, Lock, Unlock } from "lucide-react";
import { LmsEbook } from "@/lib/lms/types";

export default function EbookCard({ ebook }: { ebook: LmsEbook }) {
  return (
    <article className="premium-interactive-card group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={ebook.coverUrl}
          alt={ebook.title}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="premium-card-image object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
          {ebook.isFree ? <Unlock className="h-3 w-3 text-emerald-600" /> : <Lock className="h-3 w-3 text-amber-600" />}
          {ebook.isFree ? "Free" : "Login Required"}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <span className="premium-card-badge rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{ebook.category}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{ebook.level}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{ebook.pages} pages</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-balance text-base font-black tracking-wide text-slate-950">{ebook.title}</h3>
          <p className="text-pretty text-sm font-medium leading-relaxed text-slate-600">{ebook.description}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <a
            href={ebook.isFree ? ebook.fileUrl : "/login?redirect_to=/ebooks"}
            target={ebook.isFree ? "_blank" : undefined}
            rel={ebook.isFree ? "noopener noreferrer" : undefined}
            className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition-all hover:border-cyan-300 hover:text-cyan-700"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </a>
          <a
            href={ebook.isFree ? ebook.fileUrl : "/login?redirect_to=/ebooks"}
            className="premium-btn-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-cyan-700"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        </div>
      </div>
    </article>
  );
}

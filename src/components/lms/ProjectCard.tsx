import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, PackageCheck, Timer, Wrench } from "lucide-react";
import { LmsProject } from "@/lib/lms/types";

export default function ProjectCard({ project }: { project: LmsProject }) {
  const primaryComponent = project.components[0];
  const componentPreview = project.components.slice(0, 2).map((component) => component.name).join(" + ");

  return (
    <article className="premium-interactive-card group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={project.thumbnailUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="premium-card-image object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
          {project.level}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <span className="premium-card-badge w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-800">
          {project.category}
        </span>
        <span className="w-fit rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-violet-800">
          {project.classLevel}
        </span>
        <div className="space-y-2">
          <h3 className="text-balance text-base font-black tracking-wide text-slate-950">{project.title}</h3>
          <p className="text-pretty text-sm font-medium leading-relaxed text-slate-600">{project.shortDescription}</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-[11px] font-bold leading-relaxed text-slate-700">
          <p className="flex gap-2">
            <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
            <span><span className="font-black text-slate-950">Guide:</span> circuit, code, steps and troubleshooting</span>
          </p>
          <p className="mt-2 flex gap-2">
            <PackageCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
            <span><span className="font-black text-slate-950">Parts:</span> {componentPreview || "component list ready"}</span>
          </p>
        </div>
        <div className="mt-auto flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <span className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-cyan-600" />
            {project.estimatedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-cyan-600" />
            {project.components.length} parts
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={`/projects/${project.slug}`}
            className="premium-btn-shimmer inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-emerald-900 transition-all hover:bg-emerald-600 hover:text-white"
          >
            Build Guide
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={primaryComponent?.productUrl || "https://rees52.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition-all hover:border-cyan-300 hover:text-cyan-800"
          >
            Components
            <PackageCheck className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

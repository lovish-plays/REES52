import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Eye, GraduationCap, PackageCheck, Trophy } from "lucide-react";
import { LmsCourse } from "@/lib/lms/types";

export default function CourseCard({ course }: { course: LmsCourse }) {
  const previewLesson = course.modules
    .flatMap((module) => module.lessons)
    .find((lesson) => lesson.isPreview) || course.modules[0]?.lessons[0];
  const buildOutcome = course.projects[0] || course.whatYouWillLearn.find((item) => item.toLowerCase().includes("build")) || "guided hardware project";
  const primaryKit = course.relatedProducts[0] || course.requiredComponents[0];

  return (
    <article className="premium-interactive-card group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-cyan-300 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="premium-card-image object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
          {course.pricing}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <span className="premium-card-badge rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">{course.category}</span>
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-violet-800">{course.classLevel}</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{course.level}</span>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">Certificate path</span>
        </div>

        <div className="space-y-2">
          <h3 className="text-balance text-base font-black tracking-wide text-slate-950">
            {course.title}
          </h3>
          <p className="text-pretty text-sm font-medium leading-relaxed text-slate-600">
            {course.shortDescription}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-sky-100 bg-sky-50/60 p-3 text-[11px] font-bold leading-relaxed text-slate-700">
          <p className="flex gap-2">
            <Trophy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
            <span><span className="font-black text-slate-950">Build:</span> {buildOutcome}</span>
          </p>
          <p className="flex gap-2">
            <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
            <span><span className="font-black text-slate-950">Preview:</span> {previewLesson?.title || "First lesson"}</span>
          </p>
          <p className="flex gap-2">
            <PackageCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-700" />
            <span><span className="font-black text-slate-950">Kit:</span> {course.requiredComponents.length} components listed</span>
          </p>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-cyan-600" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
            <BookOpen className="h-3.5 w-3.5 text-cyan-600" />
            {course.lessonsCount} lessons
          </span>
        </div>

        <div className="grid gap-2">
          <Link
            href={`/courses/${course.slug}`}
            className="premium-btn-shimmer mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-500"
          >
            <GraduationCap className="h-4 w-4" />
            Start Course
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={previewLesson ? `/learn/${course.slug}/${previewLesson.slug}` : `/courses/${course.slug}`}
              className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-800 transition-all hover:border-sky-300 hover:text-sky-700"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
            <a
              href={primaryKit?.productUrl || "https://rees52.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-900 transition-all hover:bg-emerald-100"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              Kit
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

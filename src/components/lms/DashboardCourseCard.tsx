import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LmsCourse } from "@/lib/lms/types";

export default function DashboardCourseCard({
  course,
  progress,
  lastLesson,
}: {
  course: LmsCourse;
  progress: number;
  lastLesson: string;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 sm:aspect-square">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              Continue Course
            </p>
            <h3 className="mt-1 text-base font-black tracking-wide text-slate-950">{course.title}</h3>
            <p className="mt-2 text-xs font-semibold text-slate-600">Last Lesson: {lastLesson}</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${progress}%` }} />
            </div>
            <Link
              href={`/learn/${course.slug}/${course.modules[0]?.lessons[0]?.slug || "what-is-arduino"}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-cyan-700"
            >
              Continue Learning
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

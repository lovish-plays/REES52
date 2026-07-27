import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { LmsCourse } from "@/lib/lms/types";

export default function LessonSidebar({
  course,
  activeLessonSlug,
}: {
  course: LmsCourse;
  activeLessonSlug: string;
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Course Content</p>
      <h2 className="mt-1 text-sm font-black tracking-wide text-slate-950">{course.title}</h2>

      <div className="mt-5 space-y-4">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.title} className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Module {moduleIndex + 1}
            </p>
            {module.lessons.map((lesson) => {
              const isActive = lesson.slug === activeLessonSlug;
              return (
                <Link
                  key={lesson.slug}
                  href={`/learn/${course.slug}/${lesson.slug}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
                  }`}
                >
                  {isActive ? (
                    <PlayCircle className="h-4 w-4 shrink-0" />
                  ) : lesson.type === "quiz" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-slate-400" />
                  )}
                  <span>{lesson.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

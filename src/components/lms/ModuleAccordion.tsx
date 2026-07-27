import Link from "next/link";
import { CheckCircle2, ChevronDown, PlayCircle } from "lucide-react";
import { LmsCourse } from "@/lib/lms/types";

export default function ModuleAccordion({ course }: { course: LmsCourse }) {
  return (
    <div className="space-y-3">
      {course.modules.map((module, moduleIndex) => (
        <details
          key={module.title}
          open={moduleIndex === 0}
          className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
                Module {moduleIndex + 1}
              </p>
              <h3 className="mt-1 text-sm font-black tracking-wide text-slate-950">
                {module.title}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-600">{module.description}</p>
            </div>
            <ChevronDown className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
          </summary>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {module.lessons.map((lesson, index) => (
              <Link
                key={lesson.slug}
                href={`/learn/${course.slug}/${lesson.slug}`}
                className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-3 py-3 text-sm transition-all hover:bg-cyan-50"
              >
                <span className="flex items-center gap-3 font-bold text-slate-800">
                  {lesson.type === "quiz" ? (
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  ) : (
                    <PlayCircle className="h-4 w-4 text-cyan-600" />
                  )}
                  {index + 1}. {lesson.title}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {lesson.duration}
                </span>
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

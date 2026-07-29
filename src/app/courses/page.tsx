import { Metadata } from "next";
import CourseExplorer from "@/components/lms/CourseExplorer";
import StartHerePaths from "@/components/lms/StartHerePaths";
import { getCourses } from "@/lib/lms/data";
import { normalizeSchoolClass } from "@/lib/lms/class-categories";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Robotics, Arduino & STEM Courses",
  description: "Browse complete Arduino, ESP32 IoT and mobile robotics courses from REES52 Academy.",
  alternates: { canonical: absoluteUrl("/courses") },
};

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ class?: string | string[] }> }) {
  const params = await searchParams;
  const requestedClass = Array.isArray(params.class) ? params.class[0] : params.class;
  const courses = await getCourses();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-slate-200/70 pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Courses</p>
        <h1 className="text-balance text-3xl font-black tracking-wide text-slate-950 md:text-5xl">
          Start with a course. Finish with a working project.
        </h1>
        <p className="max-w-3xl text-pretty text-sm font-semibold leading-relaxed text-slate-600">
          Every listed course includes official videos, checked diagrams, working code, a PDF workbook, a hands-on build and a scored quiz.
        </p>
      </div>

      <div className="order-2 lg:order-1">
        <StartHerePaths />
      </div>
      <div className="order-1 lg:order-2">
        <CourseExplorer courses={courses} initialClassLevel={requestedClass ? normalizeSchoolClass(requestedClass) : undefined} />
      </div>
    </div>
  );
}

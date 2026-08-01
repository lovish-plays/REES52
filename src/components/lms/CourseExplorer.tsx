"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import CourseCard from "@/components/lms/CourseCard";
import { LmsCourse } from "@/lib/lms/types";
import { schoolClassOptions, type SchoolClass } from "@/lib/lms/class-categories";

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const pricing = ["All", "Free", "Paid"];

export default function CourseExplorer({ courses, initialClassLevel }: { courses: LmsCourse[]; initialClassLevel?: SchoolClass }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [classLevel, setClassLevel] = useState<string>(initialClassLevel || "All Classes");
  const [level, setLevel] = useState("All Levels");
  const [price, setPrice] = useState("All");

  const categories = useMemo(() => ["All", ...Array.from(new Set(courses.map((course) => course.category)))], [courses]);
  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const searchTarget = [
        course.title,
        course.shortDescription,
        course.category,
        course.level,
        course.projects.join(" "),
        course.whatYouWillLearn.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedQuery || searchTarget.includes(normalizedQuery);
      const matchesCategory = category === "All" || course.category === category;
      const matchesClass = classLevel === "All Classes" || course.classLevel === classLevel;
      const matchesLevel = level === "All Levels" || course.level === level;
      const matchesPrice = price === "All" || course.pricing === price;

      return matchesSearch && matchesCategory && matchesClass && matchesLevel && matchesPrice;
    });
  }, [category, classLevel, courses, level, price, query]);

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search courses"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Arduino, robotics, sensors, free courses..."
              className="premium-input-pulse h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
          </label>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <SlidersHorizontal className="h-4 w-4 text-sky-700" />
            {filteredCourses.length} courses
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((item) => (
            <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>
              {item}
            </FilterButton>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="px-1 text-[10px] font-black uppercase tracking-widest text-slate-500">School class</span>
          <FilterButton active={classLevel === "All Classes"} onClick={() => setClassLevel("All Classes")}>
            All Classes
          </FilterButton>
          {schoolClassOptions.map((item) => (
            <FilterButton key={item} active={classLevel === item} onClick={() => setClassLevel(item)}>
              {item}
            </FilterButton>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {levels.map((item) => (
            <FilterButton key={item} active={level === item} onClick={() => setLevel(item)}>
              {item}
            </FilterButton>
          ))}
          {pricing.map((item) => (
            <FilterButton key={item} active={price === item} onClick={() => setPrice(item)}>
              {item}
            </FilterButton>
          ))}
        </div>
      </div>

      {filteredCourses.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
          <h2 className="text-lg font-black text-slate-950">
            {classLevel === "All Classes" ? "No matching courses" : `No courses published for ${classLevel} yet`}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {classLevel === "All Classes"
              ? "Try a different category, level, price, or search term."
              : "This class remains available here while teachers prepare and publish its first course."}
          </p>
        </div>
      )}
    </section>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`premium-btn-interactive min-h-11 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
        active
          ? "border-sky-500 bg-sky-600 text-white shadow-sm shadow-sky-500/20"
          : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:text-sky-800"
      }`}
    >
      {children}
    </button>
  );
}

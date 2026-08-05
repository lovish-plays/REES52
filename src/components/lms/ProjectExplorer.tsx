"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Filter } from "lucide-react";
import ProjectCard from "@/components/lms/ProjectCard";
import { LmsProject } from "@/lib/lms/types";
import { schoolClassOptions, type SchoolClass } from "@/lib/lms/class-categories";

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function ProjectExplorer({ projects, initialClassLevel }: { projects: LmsProject[]; initialClassLevel?: SchoolClass }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [classLevel, setClassLevel] = useState<string>(initialClassLevel || "All Classes");
  const [level, setLevel] = useState("All Levels");

  const categories = useMemo(() => ["All", ...Array.from(new Set(projects.map((project) => project.category)))], [projects]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return projects.filter((project) => {
      const searchTarget = [
        project.title,
        project.shortDescription,
        project.description,
        project.category,
        project.level,
        project.components.map((component) => component.name).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !normalizedQuery || searchTarget.includes(normalizedQuery);
      const matchesCategory = category === "All" || project.category === category;
      const matchesClass = classLevel === "All Classes" || project.classLevel === classLevel;
      const matchesLevel = level === "All Levels" || project.level === level;

      return matchesSearch && matchesCategory && matchesClass && matchesLevel;
    });
  }, [category, classLevel, level, projects, query]);

  const hasActiveFilters = category !== "All" || classLevel !== "All Classes" || level !== "All Levels" || query !== "";

  const resetAllFilters = () => {
    setQuery("");
    setCategory("All");
    setClassLevel("All Classes");
    setLevel("All Levels");
  };

  return (
    <section className="space-y-6">
      {/* Main Filter Console Card */}
      <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-md shadow-indigo-100/60 backdrop-blur-xl">
        {/* Row 1: Search Input & Select Dropdowns */}
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          {/* Search Box */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
            <input
              aria-label="Search projects"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search line follower, ESP32, LED..."
              className="h-11 w-full rounded-2xl border border-indigo-100 bg-indigo-50/40 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* School Class Selector Dropdown */}
          <div className="relative">
            <select
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
              className="h-11 appearance-none rounded-2xl border border-indigo-100 bg-white px-4 pr-9 text-xs font-black text-slate-800 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="All Classes">All School Classes</option>
              {schoolClassOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
          </div>

          {/* Difficulty Level Dropdown */}
          <div className="relative">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-11 appearance-none rounded-2xl border border-indigo-100 bg-white px-4 pr-9 text-xs font-black text-slate-800 outline-none transition hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === "All Levels" ? "All Difficulty Levels" : lvl}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-500" />
          </div>
        </div>

        {/* Row 2: Category Tabs & Results Counter */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Topic:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  category === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "bg-slate-100/80 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
            <span>
              Showing <strong className="text-slate-900">{filteredProjects.length}</strong> build guides
            </span>
          </div>
        </div>

        {/* Row 3: Active Filters Pills (If any active) */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-dashed border-slate-200 pt-3 text-[10px] font-bold text-slate-500">
            <span className="text-slate-400 uppercase tracking-widest">Active Filters:</span>
            {category !== "All" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 border border-indigo-200">
                Topic: {category}
                <button onClick={() => setCategory("All")} className="hover:text-indigo-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {classLevel !== "All Classes" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 border border-amber-200">
                {classLevel}
                <button onClick={() => setClassLevel("All Classes")} className="hover:text-amber-950">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {level !== "All Levels" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800 border border-emerald-200">
                Level: {level}
                <button onClick={() => setLevel("All Levels")} className="hover:text-emerald-950">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetAllFilters}
              className="ml-auto text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 underline"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid Output */}
      {filteredProjects.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/80 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Filter className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            {classLevel === "All Classes" ? "No matching projects found" : `No projects published for ${classLevel} yet`}
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
            {classLevel === "All Classes"
              ? "Try another category, level, or search term."
              : "This class section stays active while teachers prepare and publish its first project."}
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}

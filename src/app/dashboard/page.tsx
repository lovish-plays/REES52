import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Bookmark, Brain, Clock, GraduationCap, Sparkles, Target, TrendingUp } from "lucide-react";
import CourseCard from "@/components/lms/CourseCard";
import DashboardCourseCard from "@/components/lms/DashboardCourseCard";
import EbookCard from "@/components/lms/EbookCard";
import ProgressCard from "@/components/lms/ProgressCard";
import ProjectCard from "@/components/lms/ProjectCard";
import { getDashboardSnapshotForCurrentUser } from "@/lib/lms/data";

export const metadata: Metadata = {
  title: "My Learning Dashboard | REES52 Academy",
  description: "Track courses, progress, ebooks, saved projects, quiz results, and recommended courses.",
};

export default async function DashboardPage() {
  const dashboard = await getDashboardSnapshotForCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200/70 pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Student Dashboard</p>
        <h1 className="mt-3 text-3xl font-black tracking-wide text-slate-950 md:text-5xl">My Learning Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
          Resume your course, track progress, open ebooks, revisit saved projects, and review quiz scores.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-cyan-50 p-6 shadow-sm shadow-sky-500/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">Welcome Back</p>
          <h2 className="mt-2 text-2xl font-black tracking-wide text-slate-950">Continue from {dashboard.lastLesson}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
            You are {dashboard.progressPercentage}% through {dashboard.continueCourse.title}. Finish the current sensor lesson, then move into the next project build.
          </p>
          <Link
            href={`/learn/${dashboard.continueCourse.slug}/${dashboard.continueCourse.modules[0]?.lessons[0]?.slug || "what-is-arduino"}`}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-500"
          >
            Continue Learning
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-700" />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">Today's Plan</h2>
          </div>
          <div className="mt-4 space-y-3">
            {["Watch one preview lesson", "Mark one lesson complete", "Save one project to build"].map((item, index) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-black text-cyan-800">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ProgressCard label="My Courses" value={`${dashboard.myCourses.length}`} detail="Active learning paths" icon={<GraduationCap className="h-6 w-6" />} />
        <ProgressCard label="My Progress" value={`${dashboard.progressPercentage}%`} detail="Current course progress" icon={<TrendingUp className="h-6 w-6" />} />
        <ProgressCard label="My Ebooks" value={`${dashboard.myEbooks.length}`} detail="Saved study guides" icon={<BookOpen className="h-6 w-6" />} />
        <ProgressCard label="Quiz Results" value={`${dashboard.quizResults.length}`} detail="Attempts recorded" icon={<Award className="h-6 w-6" />} />
      </div>

      <section className="space-y-4">
        <DashboardHeading title="Continue Learning" href="/dashboard/my-courses" />
        <DashboardCourseCard course={dashboard.continueCourse} progress={dashboard.progressPercentage} lastLesson={dashboard.lastLesson} />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-4">
          <DashboardHeading title="My Ebooks" href="/dashboard/my-ebooks" />
          <div className="grid gap-5 md:grid-cols-2">
            {dashboard.myEbooks.slice(0, 2).map((ebook) => <EbookCard key={ebook.slug} ebook={ebook} />)}
          </div>
        </div>
        <div className="space-y-4">
          <DashboardHeading title="Saved Projects" href="/dashboard/saved-projects" />
          <div className="grid gap-5 md:grid-cols-2">
            {dashboard.savedProjects.slice(0, 2).map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <DashboardHeading title="Recently Viewed Projects" href="/projects" />
        <div className="grid gap-5 md:grid-cols-3">
          {dashboard.savedProjects.slice(0, 3).map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{project.category}</p>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="mt-3 text-sm font-black tracking-wide text-slate-950">{project.title}</h3>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">{project.estimatedTime} · {project.components.length} components</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <DashboardHeading title="Recommended Courses" href="/courses" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.recommendedCourses.map((course) => <CourseCard key={course.slug} course={course} />)}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-700" />
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">Quiz Results</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {dashboard.quizResults.map((result) => (
            <div key={result.title} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-950">{result.title}</p>
              <p className="mt-2 text-2xl font-black text-cyan-700">{result.score}/{result.total}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {result.passed ? "Passed" : "Retry Recommended"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 text-xl font-black tracking-wide text-slate-950">
        <Sparkles className="h-5 w-5 text-cyan-700" />
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-600">
        Open
        <Bookmark className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

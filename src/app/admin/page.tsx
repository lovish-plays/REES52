import Link from "next/link";
import { BookOpen, Boxes, FileQuestion, FolderKanban, GraduationCap, Layers, Users, Video } from "lucide-react";
import AdminStatCard from "@/components/lms/AdminStatCard";
import { getAdminSnapshot } from "@/lib/lms/data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = getAdminSnapshot();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200/70 pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Teacher Workspace</p>
        <h1 className="mt-3 text-3xl font-black tracking-wide text-slate-950 md:text-5xl">REES52 Teacher Studio</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">
          Create, update, publish, and delete courses and learning content. Students retain read-only access.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Courses" value={stats.courses} href="/admin/courses" icon={<GraduationCap className="h-6 w-6" />} />
        <AdminStatCard title="Modules" value={stats.modules} href="/admin/courses" icon={<Layers className="h-6 w-6" />} />
        <AdminStatCard title="Lessons" value={stats.lessons} href="/admin/courses" icon={<Video className="h-6 w-6" />} />
        <AdminStatCard title="Projects" value={stats.projects} href="/admin/projects" icon={<FolderKanban className="h-6 w-6" />} />
        <AdminStatCard title="Ebooks" value={stats.ebooks} href="/admin/ebooks" icon={<BookOpen className="h-6 w-6" />} />
        <AdminStatCard title="Quizzes" value={stats.quizzes} href="/admin/quizzes" icon={<FileQuestion className="h-6 w-6" />} />
        <AdminStatCard title="Users" value={stats.users} href="/admin/users" icon={<Users className="h-6 w-6" />} />
        <AdminStatCard title="Product Links" value="Store" href="/admin/projects" icon={<Boxes className="h-6 w-6" />} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black tracking-wide text-slate-950">Teacher Workflows</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            ["Course Builder", "Add courses, arrange modules, add video/text lessons, attach PDFs and code.", "/admin/courses"],
            ["Project Library", "Add projects, components, circuit diagrams, source code, troubleshooting, and REES52 product links.", "/admin/projects"],
            ["Quiz Management", "Add MCQ questions, set passing scores, and review quiz attempt structures.", "/admin/quizzes"],
          ].map(([title, copy, href]) => (
            <Link key={title} href={href} className="rounded-lg bg-slate-50 p-5 transition-all hover:bg-cyan-50">
              <h3 className="text-sm font-black tracking-wide text-slate-950">{title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

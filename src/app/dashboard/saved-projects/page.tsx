import { Metadata } from "next";
import ProjectCard from "@/components/lms/ProjectCard";
import { getDashboardSnapshotForCurrentUser } from "@/lib/lms/data";

export const metadata: Metadata = {
  title: "Saved Projects | REES52 Academy",
};

export default async function SavedProjectsPage() {
  const dashboard = await getDashboardSnapshotForCurrentUser();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-slate-950">Saved Projects</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {dashboard.savedProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
      </div>
    </div>
  );
}

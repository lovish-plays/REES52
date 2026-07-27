import { Metadata } from "next";
import ProjectExplorer from "@/components/lms/ProjectExplorer";
import { getProjects } from "@/lib/lms/data";
import { normalizeSchoolClass } from "@/lib/lms/class-categories";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Robotics, Arduino & IoT Projects",
  description: "Browse Arduino, robotics, IoT, ESP32, Raspberry Pi, drone, 3D printing, and ATL lab projects.",
  alternates: { canonical: absoluteUrl("/projects") },
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ class?: string | string[] }> }) {
  const params = await searchParams;
  const requestedClass = Array.isArray(params.class) ? params.class[0] : params.class;
  const projects = await getProjects();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 lg:px-8">
      <div className="border-b border-slate-200/70 pb-8">
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Project Library</p>
        <h1 className="mt-3 text-balance text-3xl font-black tracking-wide text-slate-950 md:text-5xl">
          Pick a project and build with confidence
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-sm font-semibold leading-relaxed text-slate-600">
          Each project keeps the essentials together: overview, components, circuit notes, source code, build steps, and store links.
        </p>
      </div>

      <ProjectExplorer projects={projects} initialClassLevel={requestedClass ? normalizeSchoolClass(requestedClass) : undefined} />
    </div>
  );
}

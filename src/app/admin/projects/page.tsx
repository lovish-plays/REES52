import { getTeacherProjectsAction } from "@/app/actions/teacherProjects";
import TeacherProjectManager from "@/components/lms/TeacherProjectManager";

export default async function AdminProjectsPage() {
  const result = await getTeacherProjectsAction();
  if (result.error) {
    return <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900">Unable to load project management: {result.error}</div></div>;
  }
  return <TeacherProjectManager initialProjects={result.projects || []} />;
}

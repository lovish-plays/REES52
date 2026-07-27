import { getTeacherCoursesAction } from "@/app/actions/teacherContent";
import TeacherCourseManager from "@/components/lms/TeacherCourseManager";

export default async function AdminCoursesPage() {
  const result = await getTeacherCoursesAction();

  if (result.error) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900">
          Unable to load course management: {result.error}
        </div>
      </div>
    );
  }

  return <TeacherCourseManager initialCourses={result.courses || []} />;
}

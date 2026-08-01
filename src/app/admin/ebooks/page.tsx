import { getTeacherEbooksAction } from "@/app/actions/teacherEbooks";
import TeacherEbookManager from "@/components/lms/TeacherEbookManager";

export const dynamic = "force-dynamic";

export default async function AdminEbooksPage() {
  const result = await getTeacherEbooksAction();
  if (result.error) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900">
          Unable to load ebook management: {result.error}
        </div>
      </div>
    );
  }

  return <TeacherEbookManager initialEbooks={result.ebooks || []} />;
}

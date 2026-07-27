import { getTeacherArticlesAction } from "@/app/actions/teacherArticles";
import TeacherArticleManager from "@/components/lms/TeacherArticleManager";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const result = await getTeacherArticlesAction();
  if (result.error) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900">
          Unable to load article management: {result.error}
        </div>
      </div>
    );
  }

  return <TeacherArticleManager initialArticles={result.articles || []} />;
}

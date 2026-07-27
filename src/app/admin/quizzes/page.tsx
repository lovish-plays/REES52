import { getTeacherQuizLinksAction } from '@/app/actions/teacherQuizLinks';
import TeacherQuizLinkManager from '@/components/lms/TeacherQuizLinkManager';

export default async function AdminQuizzesPage() {
  const result = await getTeacherQuizLinksAction();
  if (result.error) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-bold text-rose-900">
          Unable to load quiz management: {result.error}
        </div>
      </div>
    );
  }

  return <TeacherQuizLinkManager initialQuizLinks={result.quizLinks || []} />;
}

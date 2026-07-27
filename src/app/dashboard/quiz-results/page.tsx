import { Metadata } from "next";
import { RotateCcw, Trophy } from "lucide-react";
import QuizRunner from "@/components/lms/QuizRunner";
import { getDashboardSnapshotForCurrentUser, getQuizzes, toPublicQuiz } from "@/lib/lms/data";

export const metadata: Metadata = {
  title: "Quiz Results | REES52 Academy",
};

export default async function QuizResultsPage() {
  const dashboard = await getDashboardSnapshotForCurrentUser();
  const sampleQuiz = getQuizzes()[0];
  const publicQuiz = sampleQuiz ? toPublicQuiz(sampleQuiz) : null;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 lg:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-slate-950">Quiz Results</h1>
      </div>
      <div className="grid gap-4">
        {dashboard.quizResults.map((result) => (
          <div key={result.title} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-slate-950">{result.title}</p>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Score: {result.score}/{result.total}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest ${result.passed ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {result.passed ? <Trophy className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              {result.passed ? "Passed" : "Retry"}
            </div>
          </div>
        ))}
      </div>

      {publicQuiz && <QuizRunner quiz={publicQuiz} courseSlug={publicQuiz.courseSlug} />}
    </div>
  );
}

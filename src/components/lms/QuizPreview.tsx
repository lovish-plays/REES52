import { CheckCircle2, LockOpen, RotateCcw } from "lucide-react";
import { LmsQuiz } from "@/lib/lms/types";

export default function QuizPreview({ quiz }: { quiz: LmsQuiz }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Quiz Structure</p>
          <h2 className="mt-2 text-xl font-black uppercase tracking-wide text-slate-950">{quiz.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            Passing score: {quiz.passingScore}% - Module: {quiz.moduleTitle}
          </p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-900">
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        {quiz.questions.map((question, index) => (
          <div key={question.question} className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">
              {index + 1}. {question.question}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const isCorrect = option === question.correctOption;
                return (
                  <div
                    key={option}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {option}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">
              Correct answer: <span className="font-black text-emerald-700">{question.correctOption}</span>. {question.explanation}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
        <LockOpen className="h-5 w-5 shrink-0" />
        Backend rule placeholder: passing this quiz can unlock the next module after quiz_attempts and student_progress are connected.
      </div>
    </section>
  );
}

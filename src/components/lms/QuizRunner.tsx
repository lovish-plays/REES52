"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CircleAlert, Loader2, RotateCcw, Trophy } from "lucide-react";
import { submitQuizAction } from "@/app/actions/lms";
import type { PublicQuiz } from "@/lib/lms/types";

export default function QuizRunner({ quiz, courseSlug }: { quiz: PublicQuiz; courseSlug: string }) {
  const [answers, setAnswers] = useState<string[]>(() => quiz.questions.map(() => ""));
  const [result, setResult] = useState<{ score: number; totalQuestions: number; passed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (answers.some((answer) => !answer)) {
      setError("Answer every question before submitting.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const response = await submitQuizAction({ courseSlug, quizTitle: quiz.title, answers });
      if (response.error) {
        setError(response.error);
        return;
      }
      setResult({
        score: response.score || 0,
        totalQuestions: response.totalQuestions || quiz.questions.length,
        passed: Boolean(response.passed),
      });
    });
  };

  const reset = () => {
    setAnswers(quiz.questions.map(() => ""));
    setResult(null);
    setError(null);
  };

  return (
    <section className="rounded-2xl border border-cyan-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Knowledge check</p>
          <h2 className="mt-2 text-xl font-black tracking-wide text-slate-950">{quiz.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">Pass with {quiz.passingScore}% or better.</p>
        </div>
        {result && (
          <div className={`rounded-xl px-4 py-3 text-center ${result.passed ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">{result.passed ? "Passed" : "Try again"}</p>
            <p className="mt-1 text-xl font-black">{result.score}/{result.totalQuestions}</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {quiz.questions.map((question, questionIndex) => (
          <fieldset key={question.question} className="rounded-xl border border-slate-200 bg-slate-50 p-4" disabled={Boolean(result) || isPending}>
            <legend className="max-w-full text-sm font-black leading-relaxed text-slate-950">
              {questionIndex + 1}. {question.question}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const selected = answers[questionIndex] === option;
                return (
                  <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${selected ? "border-cyan-400 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-white text-slate-700 hover:border-cyan-300"}`}>
                    <input type="radio" name={`question-${questionIndex}`} value={option} checked={selected} onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? option : answer))} className="accent-cyan-600" />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      {error && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-rose-700" role="alert"><CircleAlert className="h-4 w-4" />{error}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {result ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-900 hover:bg-cyan-100">
            <RotateCcw className="h-4 w-4" /> Retry Quiz
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-cyan-500 disabled:cursor-wait disabled:opacity-70">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
            {isPending ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
        {result?.passed && <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-900"><CheckCircle2 className="h-4 w-4" /> Next module unlocked</span>}
      </div>
    </section>
  );
}

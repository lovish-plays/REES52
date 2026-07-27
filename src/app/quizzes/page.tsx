import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, FileQuestion } from 'lucide-react';
import { getPublicQuizLinks } from '@/lib/lms/quiz-links';

export const metadata: Metadata = {
  title: 'Quiz Library | REES52 Academy',
  description: 'Test your robotics, electronics, Arduino and ESP32 knowledge with REES52 Academy quizzes.',
};

export const dynamic = 'force-dynamic';

export default async function QuizzesPage() {
  const quizzes = await getPublicQuizLinks();

  return (
    <main className="flex-1">
      <section className="border-b border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-800 shadow-sm">
            <FileQuestion className="h-3.5 w-3.5" />
            Knowledge checks
          </span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            Quiz Library
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-relaxed text-slate-600">
            Choose a topic, review what it covers and start the quiz. Academy course quizzes open here; teacher-added quizzes open securely in a new tab.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg bg-cyan-50 p-2.5 text-cyan-800">
                  <FileQuestion className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
                  {quiz.source === 'academy' ? 'Academy course quiz' : 'Teacher quiz'}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-black leading-tight text-slate-950">{quiz.topic}</h2>
              <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-600">{quiz.description}</p>
              {quiz.source === 'academy' ? (
                <Link
                  href={quiz.quizUrl}
                  className="mt-6 inline-flex items-center justify-between rounded-lg bg-cyan-700 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-cyan-800"
                >
                  Start quiz
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={quiz.quizUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center justify-between rounded-lg bg-cyan-700 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-cyan-800"
                >
                  Start quiz
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </article>
          ))}
        </div>
        <p className="mt-8 text-xs font-semibold leading-relaxed text-slate-500">
          Teacher-added quizzes may be hosted by an external provider. That provider&apos;s privacy and usage terms apply after you open its link.
        </p>
      </section>
    </main>
  );
}

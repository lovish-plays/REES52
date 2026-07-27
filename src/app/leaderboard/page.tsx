import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenCheck, CalendarDays, Medal, Sparkles, Trophy } from "lucide-react";
import {
  getMonthlyLeaderboard,
  getMonthlyLeaderboardLabel,
  getNextMonthlyRefresh,
  LEADERBOARD_POINTS,
} from "@/lib/lms/leaderboard";

export const metadata: Metadata = {
  title: "Monthly Leaderboard | REES52 Academy",
  description: "See this month's REES52 Academy learner rankings from verified lessons, quizzes, courses and projects.",
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const entries = await getMonthlyLeaderboard(50);
  const monthLabel = getMonthlyLeaderboardLabel();
  const nextRefresh = getNextMonthlyRefresh().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="flex-1 bg-slate-50">
      <section className="overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_0.65fr] lg:px-8 lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
              <Trophy className="h-4 w-4" />
              {monthLabel}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Monthly Learner Leaderboard</h1>
            <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-slate-300">
              Earn points from verified Academy learning activity. Rankings start fresh each calendar month, while your underlying course progress remains saved.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-amber-300" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next monthly refresh</p>
                <p className="mt-1 text-xl font-black text-white">{nextRefresh}</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium leading-relaxed text-slate-300">
              Display names are shortened to protect learner privacy. Teacher and administrator accounts do not earn leaderboard points.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        {entries.length ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {entries.slice(0, 3).map((entry, index) => (
                <article
                  key={entry.userId}
                  className={`rounded-2xl border bg-white p-6 shadow-sm ${
                    index === 0 ? "border-amber-300 md:-translate-y-2" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full font-black ${
                      index === 0 ? "bg-amber-100 text-amber-800" : index === 1 ? "bg-slate-200 text-slate-700" : "bg-orange-100 text-orange-800"
                    }`}>
                      {entry.rank}
                    </span>
                    <Medal className={`h-6 w-6 ${index === 0 ? "text-amber-500" : "text-slate-400"}`} />
                  </div>
                  <h2 className="mt-5 text-xl font-black text-slate-950">{entry.displayName}</h2>
                  <p className="mt-2 text-3xl font-black text-cyan-800">{entry.points} pts</p>
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {entry.lessons} lessons · {entry.quizzes} quiz activities · {entry.projects} project activities
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-[64px_1fr_90px] gap-3 border-b border-slate-200 bg-slate-100 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 md:grid-cols-[80px_1fr_repeat(5,100px)]">
                <span>Rank</span>
                <span>Learner</span>
                <span className="text-right">Points</span>
                <span className="hidden text-right md:block">Lessons</span>
                <span className="hidden text-right md:block">Quizzes</span>
                <span className="hidden text-right md:block">Projects</span>
                <span className="hidden text-right md:block">Courses</span>
              </div>
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  className="grid grid-cols-[64px_1fr_90px] gap-3 border-b border-slate-100 px-4 py-4 text-sm last:border-0 md:grid-cols-[80px_1fr_repeat(5,100px)]"
                >
                  <span className="font-black text-slate-500">#{entry.rank}</span>
                  <span className="font-black text-slate-950">{entry.displayName}</span>
                  <span className="text-right font-black text-cyan-800">{entry.points}</span>
                  <span className="hidden text-right font-semibold text-slate-600 md:block">{entry.lessons}</span>
                  <span className="hidden text-right font-semibold text-slate-600 md:block">{entry.quizzes}</span>
                  <span className="hidden text-right font-semibold text-slate-600 md:block">{entry.projects}</span>
                  <span className="hidden text-right font-semibold text-slate-600 md:block">{entry.courses}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-4 text-2xl font-black text-slate-950">This month is ready for its first learner.</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
              Sign in, complete a lesson or take a quiz to place the first verified score on the board.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/courses" className="rounded-xl bg-cyan-700 px-5 py-3 text-xs font-black uppercase tracking-widest text-white">Start a course</Link>
              <Link href="/quizzes" className="rounded-xl border border-cyan-300 bg-cyan-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-cyan-900">Take a quiz</Link>
            </div>
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8">
          <div className="flex items-center gap-3">
            <BookOpenCheck className="h-6 w-6 text-cyan-700" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">Points guide</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">How students earn points</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Complete a lesson", LEADERBOARD_POINTS.lessonComplete],
              ["Attempt an Academy quiz", LEADERBOARD_POINTS.academyQuizAttempt],
              ["Pass bonus for an Academy quiz", LEADERBOARD_POINTS.academyQuizPassBonus],
              ["Open a teacher quiz", LEADERBOARD_POINTS.teacherQuizOpened],
              ["Save a project", LEADERBOARD_POINTS.projectSaved],
              ["Complete a project", LEADERBOARD_POINTS.projectComplete],
              ["Complete a course", LEADERBOARD_POINTS.courseComplete],
            ].map(([label, points]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-950">{label}</p>
                <p className="mt-2 text-2xl font-black text-cyan-800">+{points}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs font-medium leading-relaxed text-slate-500">
            Duplicate clicks do not create duplicate points. Academy quiz participation and teacher-quiz access can earn points once per quiz each month; lesson, project and course completion awards are recorded once.
          </p>
        </div>
      </section>
    </main>
  );
}

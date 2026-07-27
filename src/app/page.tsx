import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  Check,
  ClipboardCheck,
  Code2,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Images,
  LockKeyhole,
  PlayCircle,
  School,
  Star,
  Trophy,
  Wrench,
} from "lucide-react";
import CourseCard from "@/components/lms/CourseCard";
import EbookCard from "@/components/lms/EbookCard";
import { getReviewsAction } from "@/app/actions/reviews";
import { getCourses, getEbooks, getProjects } from "@/lib/lms/data";
import { getPublicQuizLinks } from "@/lib/lms/quiz-links";
import { getMonthlyLeaderboard, getMonthlyLeaderboardLabel } from "@/lib/lms/leaderboard";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Complete Robotics and Electronics Courses",
  description:
    "Learn with complete REES52 Academy courses that include official videos, wiring diagrams, working code, downloadable workbooks, projects and quizzes.",
  alternates: { canonical: absoluteUrl("/") },
};

const institutionLogos = [
  { name: "IIT Delhi", src: "/trust/iit-delhi.png" },
  { name: "IIT Madras", src: "/trust/iit-madras.png" },
  { name: "VIT", src: "/trust/vit.png" },
  { name: "NIT Patna", src: "/trust/nit-patna.png" },
  { name: "IIT Bombay", src: "/trust/iit-bombay.png" },
  { name: "NIT Calicut", src: "/trust/nit-calicut.png" },
];

export default async function HomePage() {
  const [courses, projects, ebooks, reviews, quizzes, leaderboard] = await Promise.all([
    getCourses(),
    getProjects(),
    getEbooks(),
    getReviewsAction(),
    getPublicQuizLinks(),
    getMonthlyLeaderboard(3),
  ]);
  const learnerReview = reviews.find(
    (review) =>
      review.name?.trim() &&
      review.review?.trim() &&
      review.rating >= 1 &&
      review.rating <= 5,
  );

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is included in a REES52 Academy course?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every publicly listed launch course includes video lessons, a wiring diagram, working code, a downloadable PDF workbook and a five-question quiz.",
        },
      },
      {
        "@type": "Question",
        name: "Can learners track course progress?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Registered learners can enroll, mark lessons complete, resume a course, save quiz results and claim a completion certificate after finishing a course.",
        },
      },
    ],
  };

  return (
    <div className="flex-1 bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.34),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_38%)]" />
        <div className="relative mx-auto grid min-h-[560px] w-full max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-100">
              <GraduationCap className="h-4 w-4" />
              REES52 Academy
            </div>
            <h1 className="mt-6 max-w-3xl text-balance text-4xl font-black leading-[1.05] md:text-6xl">
              Learn electronics by building something that works.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base font-medium leading-relaxed text-slate-300 md:text-lg">
              Three complete launch courses combine official REES52 tutorials with checked wiring diagrams,
              working code, printable workbooks, hands-on projects and scored quizzes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-sky-400"
              >
                Explore courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-white/15"
              >
                View build guides
              </Link>
              <Link
                href="/quizzes"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-300/15 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-amber-100 transition-colors hover:bg-amber-300/25"
              >
                <FileQuestion className="h-4 w-4" />
                Take a quiz
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
              {[
                [courses.length, "complete courses"],
                [projects.length, "complete projects"],
                [ebooks.length, "PDF workbooks"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <ProgressDemo />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-sky-50/60">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {[
            [PlayCircle, "Official videos", "REES52 tutorial videos are embedded inside the learning path."],
            [Images, "Clear diagrams", "Local, labelled wiring diagrams are available in lessons and PDFs."],
            [Code2, "Working code", "Every public course includes code that learners can inspect and change."],
            [ClipboardCheck, "Measured completion", "Lessons, quiz results and course progress are saved for registered learners."],
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as typeof PlayCircle;
            return (
              <div key={title as string} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <FeatureIcon className="h-5 w-5 text-sky-700" />
                <h2 className="mt-3 text-sm font-black text-slate-950">{title as string}</h2>
                <p className="mt-2 text-xs font-medium leading-relaxed text-slate-600">{description as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading
          eyebrow="Launch library"
          title="Start with a complete course"
          copy="Only courses that pass the public completeness checks are listed here."
          action={{ label: "All courses", href: "/courses" }}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
          <SectionHeading
            eyebrow="Test your knowledge"
            title="Student Quiz Library"
            copy="Start a course quiz or open a topic quiz published by your teacher. New teacher quizzes appear here automatically."
            action={{ label: "All quizzes", href: "/quizzes" }}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.slice(0, 3).map((quiz) => (
              <article
                key={quiz.id}
                className="flex min-h-64 flex-col rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-xl bg-sky-100 p-2.5 text-sky-800">
                    <FileQuestion className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-600">
                    {quiz.source === "teacher" ? "Teacher quiz" : "Academy quiz"}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">{quiz.topic}</h3>
                <p className="mt-3 flex-1 text-sm font-medium leading-relaxed text-slate-600">{quiz.description}</p>
                {quiz.source === "teacher" ? (
                  <a
                    href={quiz.quizUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-between rounded-xl bg-sky-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-sky-800"
                  >
                    Start quiz
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <Link
                    href={quiz.quizUrl}
                    className="mt-6 inline-flex items-center justify-between rounded-xl bg-sky-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-sky-800"
                  >
                    Start quiz
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-amber-300">
                {getMonthlyLeaderboardLabel()} rankings
              </p>
              <h2 className="mt-2 text-3xl font-black">Monthly Learner Leaderboard</h2>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-300">
                Students earn verified points from lessons, quizzes, projects and completed courses. Rankings begin fresh every month.
              </p>
            </div>
            <Link href="/leaderboard" className="inline-flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-300">
              Full leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {leaderboard.length ? (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {leaderboard.map((entry, index) => (
                <article key={entry.userId} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/15 text-sm font-black text-amber-200">
                      {entry.rank}
                    </span>
                    {index === 0 && <Trophy className="h-5 w-5 text-amber-300" />}
                  </div>
                  <h3 className="mt-4 text-lg font-black">{entry.displayName}</h3>
                  <p className="mt-1 text-2xl font-black text-amber-300">{entry.points} points</p>
                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    {entry.lessons} lessons · {entry.quizzes} quiz activities · {entry.projects} project activities
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] p-7">
              <p className="text-sm font-black">No points have been recorded for this month yet.</p>
              <p className="mt-2 text-xs font-medium text-slate-400">The first signed-in student to complete a lesson or take a quiz will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
          <SectionHeading
            eyebrow="Build outcomes"
            title="Use the same assets outside the course"
            copy="Each project guide has a real video, circuit diagram, complete code, parts list and troubleshooting steps."
            action={{ label: "All projects", href: "/projects" }}
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <article key={project.slug} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-video bg-slate-100">
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">
                    {project.classLevel} · {project.estimatedTime}
                  </p>
                  <h3 className="mt-2 text-lg font-black text-slate-950">{project.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{project.shortDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Video</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Diagram</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">Code</span>
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-800"
                  >
                    Open build guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
        <SectionHeading
          eyebrow="Download and print"
          title="Classroom-ready workbooks"
          copy="Every launch workbook has eight finished pages covering safety, wiring, code, evidence, troubleshooting and course questions."
          action={{ label: "All ebooks", href: "/ebooks" }}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {ebooks.slice(0, 3).map((ebook) => (
            <EbookCard key={ebook.slug} ebook={ebook} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">Learning in context</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Published classroom and lab evidence</h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300">
              REES52 publishes robotics-lab work, faculty-development support and lab installations in more than 100 institutions.
              The image shown here is from REES52&apos;s PM SHRI robotics-lab materials.
            </p>
            <a
              href="https://rees52.com/pages/pm-shri-robotics-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-300"
            >
              View the REES52 lab programme
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
            <div className="relative min-h-80 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src="/trust/student-robotics-workshop.jpg"
                alt="Students working with a robotics kit in classroom photographs published by REES52"
                fill
                sizes="(max-width: 640px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="grid gap-4">
              <TrustFact icon={School} value="100+" label="institutions reported by REES52 for lab installations" />
              <TrustFact icon={GraduationCap} value="Team-led" label="official tutorials and faculty-development support" />
              <TrustFact icon={Wrench} value="Hands-on" label="learner work centred on working builds and evidence" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700">Lab-installation evidence</p>
          <h2 className="text-2xl font-black text-slate-950">Institutions listed by REES52</h2>
          <p className="max-w-3xl text-sm font-medium leading-relaxed text-slate-600">
            These names and logos are reproduced from REES52&apos;s own published “We&apos;ve Setup Labs In” list.
            This wording does not imply that every institution endorses the Academy.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {institutionLogos.map((institution) => (
            <div
              key={institution.name}
              className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              title={institution.name}
            >
              <div className="relative h-16 w-full">
                <Image
                  src={institution.src}
                  alt={`${institution.name} logo`}
                  fill
                  sizes="160px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-sky-50/60">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
          <div className="rounded-2xl border border-sky-100 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-2 text-sky-700">
              <Star className="h-5 w-5 fill-current" />
              <p className="text-[10px] font-black uppercase tracking-widest">Learner feedback</p>
            </div>
            {learnerReview ? (
              <>
                <blockquote className="mt-5 text-2xl font-black leading-snug text-slate-950">
                  “{learnerReview.review}”
                </blockquote>
                <p className="mt-4 text-sm font-bold text-slate-700">{learnerReview.name}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {learnerReview.rating}/5 · Shared on REES52 Academy
                </p>
              </>
            ) : (
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
                Learner feedback will be shown here only after it has been submitted through the Academy.
              </p>
            )}
          </div>
          <CertificatePreview />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-sky-700 to-cyan-600 px-6 py-12 text-center text-white md:px-12">
          <Trophy className="mx-auto h-9 w-9" />
          <h2 className="mt-4 text-3xl font-black">Choose a complete path and start building.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-sky-50">
            Create an account to save lesson progress, quiz results, project evidence and course completion.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest text-sky-800"
            >
              Browse courses
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressDemo() {
  const lessons = [
    { label: "Watch the build", state: "complete" },
    { label: "Check the wiring", state: "complete" },
    { label: "Run and change the code", state: "current" },
    { label: "Record project evidence", state: "next" },
    { label: "Pass the course quiz", state: "next" },
  ];

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-5 shadow-2xl backdrop-blur md:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">Registered learner demo</p>
          <h2 className="mt-1 text-xl font-black">Arduino Foundations</h2>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">60%</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" />
      </div>
      <div className="mt-6 space-y-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.label}
            className={`flex items-center justify-between rounded-xl border px-3 py-3 ${
              lesson.state === "current"
                ? "border-sky-300/40 bg-sky-300/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  lesson.state === "complete" ? "bg-emerald-400 text-slate-950" : "bg-white/10 text-slate-300"
                }`}
              >
                {lesson.state === "complete" ? <Check className="h-3.5 w-3.5" /> : <LockKeyhole className="h-3 w-3" />}
              </span>
              <span className="text-xs font-bold text-slate-100">{lesson.label}</span>
            </div>
            {lesson.state === "current" && (
              <span className="text-[9px] font-black uppercase tracking-widest text-sky-300">Resume</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.06] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quiz record</p>
          <p className="mt-1 text-sm font-black">Saved by course</p>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Certificate</p>
          <p className="mt-1 text-sm font-black">After 100%</p>
        </div>
      </div>
    </div>
  );
}

function CertificatePreview() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-[#fffdf7] p-7 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-amber-700">
          <Award className="h-5 w-5" />
          <p className="text-[10px] font-black uppercase tracking-widest">Completion certificate preview</p>
        </div>
        <span className="text-[10px] font-black text-slate-500">100% required</span>
      </div>
      <div className="mt-6 border-y border-amber-200 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">REES52 Academy</p>
        <h3 className="mt-3 text-2xl font-black text-slate-950">Course Completion</h3>
        <p className="mt-2 text-sm font-medium text-slate-600">Awarded after all lessons and the course quiz are completed.</p>
      </div>
      <p className="mt-5 text-xs font-medium leading-relaxed text-slate-500">
        The certificate records Academy course completion. It is not a degree, professional licence or government-accredited qualification.
      </p>
    </div>
  );
}

function TrustFact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof School;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
      <Icon className="h-5 w-5 text-sky-300" />
      <p className="mt-4 text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-slate-300">{label}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  action: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-700">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-black text-slate-950">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-slate-600">{copy}</p>
      </div>
      <Link
        href={action.href}
        className="inline-flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-800"
      >
        {action.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

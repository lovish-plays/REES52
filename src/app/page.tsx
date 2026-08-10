import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Images,
  LockKeyhole,
  PlayCircle,
  School,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";
import CourseCard from "@/components/lms/CourseCard";
import EbookCard from "@/components/lms/EbookCard";
import HeroLmsGraphicCard from "@/components/HeroLmsGraphicCard";
import { getReviewsAction } from "@/app/actions/reviews";
import { getCourses, getEbooks, getProjects } from "@/lib/lms/data";
import { getMonthlyLeaderboard, getMonthlyLeaderboardLabel } from "@/lib/lms/leaderboard";
import { schoolClassOptions } from "@/lib/lms/class-categories";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "REES52 Tech | Robotics, AI, IoT & Electronics Learning Platform",
  },
  description:
    "Learn Robotics, Arduino, ESP32, Raspberry Pi, AI, IoT and Electronics through interactive courses, coding playground, projects, quizzes, downloadable resources and certificates.",
  openGraph: {
    title: "REES52 Tech | Robotics, AI, IoT & Electronics Learning Platform",
    description:
      "Learn Robotics, Arduino, ESP32, Raspberry Pi, AI, IoT and Electronics through interactive courses, coding playground, projects, quizzes, downloadable resources and certificates.",
    url: absoluteUrl("/"),
    siteName: "REES52 Tech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REES52 Tech | Robotics, AI, IoT & Electronics Learning Platform",
    description:
      "Learn Robotics, Arduino, ESP32, Raspberry Pi, AI, IoT and Electronics through interactive courses, coding playground, projects, quizzes, downloadable resources and certificates.",
    creator: "@rees52",
  },
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
  const [courses, projects, ebooks, reviews, leaderboard] = await Promise.all([
    getCourses(),
    getProjects(),
    getEbooks(),
    getReviewsAction(),
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

      <section className="relative overflow-hidden border-b border-indigo-900/60 bg-slate-950 text-white min-h-[640px] flex items-center">
        {/* Full-Bleed High-Visibility LMS Graphic Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/hero-lms-graphic.png"
            alt="REES52 Tech LMS Platform Background"
            fill
            priority
            className="object-cover opacity-70 transition-opacity duration-500"
          />
          {/* Lighter Gradient Overlay for Vivid Graphic Visibility & Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/75 via-slate-950/55 to-indigo-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(99,102,241,0.25),transparent_60%),radial-gradient(circle_at_bottom_center,rgba(245,158,11,0.2),transparent_55%)]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-[var(--container-padding)] py-[var(--section-padding)] text-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
          
          {/* Centered Hero Header */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/60 bg-slate-950/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300 shadow-xl backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-400" />
            India&apos;s Premier Robotics &amp; STEM Platform
          </div>

          <h1 className="mt-6 max-w-4xl text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] text-white drop-shadow-lg">
            Build your future with <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">Robotics, AI &amp; Electronics</span>.
          </h1>

          <p className="mt-6 max-w-3xl text-pretty text-base font-medium leading-relaxed text-indigo-100/90 md:text-lg">
            Interactive courses, verified circuit schematics, hands-on STEM build guides, downloadable PDF workbooks, and certified learning paths for Classes 3–12.
          </p>

          {/* Quick Value Props Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-200">
            <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free PDF Workbooks
            </span>
            <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Live Circuit Diagrams
            </span>
            <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" /> Verified Certificates
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-amber-500/40"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-400/40 bg-indigo-900/40 px-7 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:bg-indigo-800/60"
            >
              View Build Guides
            </Link>
            <Link
              href="/quizzes"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-xs font-black uppercase tracking-widest text-indigo-100 backdrop-blur-md transition-all duration-300 hover:bg-white/15"
            >
              <FileQuestion className="h-4 w-4 text-amber-300" />
              Take a Quiz
            </Link>
          </div>

          {/* 4 Feature Cards inside Hero */}
          <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [PlayCircle, "Official Videos", "REES52 tutorial videos are embedded inside the learning path."],
              [Images, "Clear Diagrams", "Local, labelled wiring diagrams are available in lessons and PDFs."],
              [Code2, "Working Code", "Every public course includes code that learners can inspect and change."],
              [ClipboardCheck, "Measured Completion", "Lessons, quiz results and course progress are saved for registered learners."],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof PlayCircle;
              return (
                <div key={title as string} className="flex flex-col items-start rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-left backdrop-blur-md transition-all duration-300 hover:border-amber-400/40 hover:bg-slate-900/95">
                  <FeatureIcon className="h-5 w-5 text-amber-400" />
                  <h3 className="mt-3 text-sm font-black text-white">{title as string}</h3>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-300">{description as string}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* BYJUs Inspired Class Grid Section */}
      <section id="classes" className="relative z-10 border-b border-indigo-100 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white py-[var(--section-padding)]">
        <div className="mx-auto w-full max-w-7xl px-[var(--container-padding)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700">
                <School className="h-4 w-4 text-indigo-600" />
                Targeted Learning Paths
              </div>
              <h2 className="mt-3 text-3xl font-black text-slate-950 tracking-tight">
                Select Your School Class
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600 max-w-xl">
                Classes 3 through 12. Tailored robotics, coding, and STEM curriculum designed for every grade level.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-800 transition"
            >
              View All Class Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5 lg:gap-4">
            {schoolClassOptions.map((schoolClass, index) => (
              <Link
                key={schoolClass}
                href={`/courses?class=${encodeURIComponent(schoolClass)}`}
                aria-label={`Browse courses for ${schoolClass}`}
                style={{ animationDelay: `${index * 35}ms` }}
                className="group/class page-loaded-entrance flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-4 shadow-md shadow-indigo-100/70 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-500 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-indigo-700 hover:text-white hover:shadow-xl hover:shadow-indigo-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-indigo-700 transition-colors group-hover/class:bg-white/20 group-hover/class:text-white">
                    Grade
                  </span>
                  <Sparkles className="h-4 w-4 text-amber-400 opacity-0 transition-opacity group-hover/class:opacity-100" />
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-black text-slate-950 transition-all duration-300 group-hover/class:text-white">
                    {schoolClass}
                  </span>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500 transition-colors group-hover/class:text-indigo-100">
                    STEM &amp; Robotics
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="mx-auto w-full max-w-7xl px-[var(--container-padding)] py-[var(--section-padding)]">
        <SectionHeading
          eyebrow="Launch library"
          title="Start with a complete course"
          copy="Only courses that pass the public completeness checks are listed here."
          action={{ label: "All courses", href: "/courses" }}
        />
        {courses.length ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm font-black text-slate-950">No courses listed yet.</p>
            <p className="mt-2 text-xs font-medium text-slate-600">
              Teacher-published courses will appear here automatically.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-[var(--container-padding)] py-[var(--section-padding)]">
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

      <section className="mx-auto w-full max-w-7xl px-[var(--container-padding)] py-[var(--section-padding)]">
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
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-[var(--container-padding)] py-[var(--section-padding)] lg:grid-cols-[0.9fr_1.1fr]">
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

      <section className="mx-auto w-full max-w-7xl px-[var(--container-padding)] py-[var(--section-padding)]">
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

      <section className="border-y border-indigo-100 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-[var(--container-padding)] py-[var(--section-padding)] lg:grid-cols-2">
          <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-md shadow-indigo-100/50">
            <div className="flex items-center gap-2 text-amber-500">
              <Star className="h-5 w-5 fill-current text-amber-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Learner Feedback</p>
            </div>
            {learnerReview ? (
              <>
                <blockquote className="mt-5 text-2xl font-black leading-snug text-slate-950">
                  “{learnerReview.review}”
                </blockquote>
                <p className="mt-4 text-sm font-bold text-indigo-900">{learnerReview.name}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {learnerReview.rating}/5 · Shared on REES52 Tech
                </p>
              </>
            ) : (
              <p className="mt-5 text-sm font-medium leading-relaxed text-slate-600">
                Learner feedback will be shown here only after it has been submitted through the platform.
              </p>
            )}
          </div>
          <CertificatePreview />
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

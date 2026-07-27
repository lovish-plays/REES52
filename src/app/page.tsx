import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Cpu,
  GraduationCap,
  Library,
  PackageCheck,
  School,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import CourseCard from "@/components/lms/CourseCard";
import EbookCard from "@/components/lms/EbookCard";
import ScrollReveal from "@/components/ScrollReveal";
import StartHerePaths from "@/components/lms/StartHerePaths";
import { getCourses, getEbooks, getFeaturedCourses, getProjects } from "@/lib/lms/data";
import { schoolClassOptions } from "@/lib/lms/class-categories";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Robotics, Arduino, AI & IoT Courses for Students",
  description:
    "Learn robotics, Arduino, ESP32, IoT, AI, electronics, and STEM through practical courses, projects, quizzes, and downloadable guides at REES52 Academy.",
  alternates: { canonical: absoluteUrl("/") },
};

const pillars = [
  {
    title: "Learn",
    copy: "Follow short, structured lessons for Arduino, ESP32, robotics, AI, IoT, drones, and electronics.",
    icon: GraduationCap,
  },
  {
    title: "Build",
    copy: "Turn lessons into real projects with circuits, code, troubleshooting, and component lists.",
    icon: Wrench,
  },
  {
    title: "Download",
    copy: "Use ebooks, worksheets, manuals, and lab notes for classroom or self-paced practice.",
    icon: Library,
  },
  {
    title: "Track",
    copy: "Resume courses, view progress, review quizzes, and save the projects you want to build.",
    icon: ClipboardList,
  },
  {
    title: "Manage",
    copy: "Prepare courses, lessons, projects, quizzes, ebooks, and student access from the admin panel.",
    icon: ShieldCheck,
  },
  {
    title: "Buy",
    copy: "Connect every project to the right REES52 kits, sensors, boards, and components.",
    icon: PackageCheck,
  },
];

const trustSignals = [
  "13+ years in robotics and electronics",
  "10,000+ products distributed",
  "Robotics, IoT and STEM training",
  "Project-based learning paths",
];

const academyAnimationStyles = `
  .academy-side-animation {
    height: 380px;
    width: min(100%, 340px);
    max-width: 340px;
    justify-self: end;
  }

  .academy-board {
    position: relative;
    height: 100%;
    overflow: hidden;
    border: 1px solid rgba(14, 165, 233, 0.22);
    border-radius: 18px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(239, 246, 255, 0.76)),
      linear-gradient(to right, rgba(14, 165, 233, 0.16) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(14, 165, 233, 0.11) 1px, transparent 1px);
    background-size: 100% 100%, 28px 28px, 28px 28px;
    box-shadow: 0 24px 70px rgba(37, 99, 235, 0.14);
  }

  .academy-board::before,
  .academy-board::after {
    content: "";
    position: absolute;
    inset: 36px;
    border: 1px solid rgba(14, 165, 233, 0.22);
    border-radius: 14px;
    animation: academyFramePulse 5s ease-in-out infinite;
  }

  .academy-board::after {
    inset: 70px;
    border-color: rgba(37, 99, 235, 0.14);
    animation-delay: 1.5s;
  }

  .academy-board-header,
  .academy-board-footer {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 18px;
    color: rgba(15, 23, 42, 0.72);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .academy-board-header span:last-child {
    color: #0284c7;
  }

  .academy-board-footer {
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    justify-content: center;
  }

  .academy-flow {
    position: absolute;
    z-index: 3;
    left: 34px;
    right: 34px;
    top: 86px;
    display: grid;
    gap: 13px;
  }

  .academy-flow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 42px;
    border: 1px solid rgba(14, 165, 233, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.74);
    padding: 0 14px;
    color: rgba(15, 23, 42, 0.84);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
    animation: academyRowFloat 4s ease-in-out infinite;
    animation-delay: calc(var(--row) * 0.22s);
  }

  .academy-flow-row i {
    width: 46px;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(14, 165, 233, 0.18), rgba(37, 99, 235, 0.9));
    box-shadow: 0 0 16px rgba(37, 99, 235, 0.24);
    animation: academySignal 1.8s ease-in-out infinite;
    animation-delay: calc(var(--row) * 0.18s);
  }

  .academy-chip-grid {
    position: absolute;
    z-index: 2;
    left: 42px;
    right: 42px;
    bottom: 74px;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
  }

  .academy-chip-grid span {
    aspect-ratio: 1;
    border-radius: 6px;
    border: 1px solid rgba(14, 165, 233, 0.18);
    background: rgba(14, 165, 233, 0.08);
    animation: academyChipBlink 3.2s ease-in-out infinite;
    animation-delay: calc(var(--cell) * 0.08s);
  }

  .academy-scanline {
    position: absolute;
    z-index: 4;
    inset-inline: 10px;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #0284c7, transparent);
    filter: drop-shadow(0 0 12px rgba(14, 165, 233, 0.58));
    animation: academyScan 4s ease-in-out infinite;
  }

  @keyframes academyFramePulse {
    0%, 100% { opacity: 0.42; transform: scale(1); }
    50% { opacity: 0.9; transform: scale(1.015); }
  }

  @keyframes academyRowFloat {
    0%, 100% { transform: translateX(0); border-color: rgba(148, 163, 184, 0.24); }
    50% { transform: translateX(8px); border-color: rgba(14, 165, 233, 0.44); }
  }

  @keyframes academySignal {
    0%, 100% { opacity: 0.38; width: 28px; }
    50% { opacity: 1; width: 54px; }
  }

  @keyframes academyChipBlink {
    0%, 100% { background: rgba(14, 165, 233, 0.08); }
    50% { background: rgba(37, 99, 235, 0.18); }
  }

  @keyframes academyScan {
    0% { transform: translateY(24px); opacity: 0; }
    12%, 88% { opacity: 1; }
    100% { transform: translateY(352px); opacity: 0; }
  }
`;

export default async function HomePage() {
  const [courses, projects, ebooks] = await Promise.all([
    getCourses(),
    getProjects(),
    getEbooks(),
  ]);
  const featuredProject = projects[0];
  const featuredProjectProductUrl = featuredProject?.components[0]?.productUrl || "https://rees52.com";
  const supportingProjects = projects.slice(1, 5);
  const classCategories = schoolClassOptions.map((classLevel) => ({
    classLevel,
    courseCount: courses.filter((course) => course.classLevel === classLevel).length,
    projectCount: projects.filter((project) => project.classLevel === classLevel).length,
  }));

  const homeFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What can students learn at REES52 Academy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Students can learn robotics, Arduino, ESP32, IoT, AI, electronics, drones, sensors, and project-based STEM skills.",
        },
      },
      {
        "@type": "Question",
        name: "Which school classes are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "REES52 Academy provides class-based learning paths from Class 3 through Class 12.",
        },
      },
      {
        "@type": "Question",
        name: "Are the courses self-paced?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Learners can follow lessons, complete quizzes, build projects, and track progress at their own pace.",
        },
      },
    ],
  };

  return (
    <div className="flex-1 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
      <section className="relative overflow-hidden border-b border-slate-200 bg-white text-slate-950">
        <style>{academyAnimationStyles}</style>
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&auto=format&fit=crop&q=80"
          alt="Electronics and robotics learning workspace"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.16] saturate-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-sky-50/88 to-emerald-50/70" />

        <div className="relative mx-auto grid min-h-[500px] w-full max-w-7xl items-center gap-8 px-4 py-10 md:py-12 lg:min-h-[540px] lg:grid-cols-[0.9fr_0.6fr] lg:px-8">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-sky-800 shadow-sm backdrop-blur-md">
              <Cpu className="h-3.5 w-3.5" />
              REES52 Academy
            </div>
            <h1 className="text-balance text-3xl font-black leading-[1.08] md:text-4xl lg:text-[2.85rem]">
              Learn Robotics, AI, IoT & Electronics Through Real Projects
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
              Start with beginner-friendly lessons, build hands-on projects, download guides, and buy all required components directly from REES52.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="premium-btn-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-500"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/projects"
                className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/85 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-800 shadow-sm backdrop-blur-md transition-all hover:border-sky-300 hover:bg-white"
              >
                Browse Projects
                <Wrench className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="academy-side-animation relative z-10 hidden lg:block" aria-hidden="true">
            <div className="academy-scanline" />
            <div className="academy-board">
              <div className="academy-board-header">
                <span>Academy Stack</span>
                <span>Live</span>
              </div>
              <div className="academy-flow">
                {["Course", "Lesson", "Quiz", "Project", "Kit"].map((item, index) => (
                  <div key={item} className="academy-flow-row" style={{ "--row": index } as CSSProperties}>
                    <span>{item}</span>
                    <i />
                  </div>
                ))}
              </div>
              <div className="academy-chip-grid">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span key={index} style={{ "--cell": index } as CSSProperties} />
                ))}
              </div>
              <div className="academy-board-footer">
                <span>Arduino</span>
                <span>ESP32</span>
                <span>AI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white/82 backdrop-blur">
        <ScrollReveal className="mx-auto grid w-full max-w-7xl gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {trustSignals.map((signal) => (
            <div key={signal} className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-slate-200/40">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-700" />
              {signal}
            </div>
          ))}
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-12 lg:px-8">
        <ScrollReveal>
          <StartHerePaths />
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">School classes</p>
              <h2 className="mt-2 text-balance text-2xl font-black text-slate-950 md:text-3xl">Choose your class and start learning</h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm font-semibold leading-relaxed text-slate-600">
                Explore age-appropriate robotics courses and projects for every class from Class 3 to Class 12.
              </p>
            </div>
            <Link href="/courses" className="premium-nav-link inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-600">
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          {classCategories.map(({ classLevel, courseCount, projectCount }, index) => (
            <ScrollReveal key={classLevel} delay={index * 45}>
              <Link
                href={`/courses?class=${encodeURIComponent(classLevel)}`}
                className="premium-interactive-card group flex min-h-[148px] flex-col rounded-lg border border-slate-200 bg-white/90 p-3 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sm font-black text-sky-800 ring-1 ring-sky-100">
                  {classLevel.replace("Class ", "")}
                </span>
                <span className="mt-3 text-xs font-black uppercase tracking-widest text-slate-950">{classLevel}</span>
                <span className="mt-2 text-[10px] font-bold leading-relaxed text-slate-500">
                  {courseCount} {courseCount === 1 ? "course" : "courses"}
                  <br />
                  {projectCount} {projectCount === 1 ? "project" : "projects"}
                </span>
                <ArrowRight className="mt-auto h-4 w-4 text-cyan-700 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
        <ScrollReveal>
          <SectionTitle eyebrow="Learning System" title="One simple flow for every learner" copy="REES52 Academy keeps the futuristic robotics feel, but the LMS itself stays clear: learn, build, download, track, manage, and buy the right parts." />
        </ScrollReveal>
        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map(({ title, copy, icon: Icon }, index) => (
            <ScrollReveal key={title} delay={index * 70}>
              <div className="premium-interactive-card h-full rounded-lg border border-slate-200 bg-white/88 p-4 shadow-sm">
                <Icon className="h-5 w-5 text-cyan-700" />
                <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-pretty text-xs font-medium leading-relaxed text-slate-600">{copy}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50/80 py-12">
        <ScrollReveal>
          <SectionHeader eyebrow="Courses" title="Guided paths that lead to real builds" href="/courses" />
        </ScrollReveal>
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
          {getFeaturedCourses(courses).map((course, index) => (
            <ScrollReveal key={course.slug} delay={index * 80}>
              <CourseCard course={course} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-y border-sky-100 bg-white/75 py-12">
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionTitle eyebrow="Projects" title="Project library built for hardware learning" copy="Pick a project, check the parts, follow the build guide, and jump straight to REES52 component links." />
              <Link href="/projects" className="premium-btn-shimmer inline-flex w-fit items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-500">
                Open Library
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          {featuredProject && (
            <div className="mt-7 grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
              <ScrollReveal direction="left">
                <article className="premium-interactive-card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="grid md:grid-cols-[0.92fr_1.08fr]">
                    <div className="relative min-h-[260px] bg-slate-100">
                      <Image
                        src={featuredProject.thumbnailUrl}
                        alt={featuredProject.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 44vw"
                        className="premium-card-image object-cover"
                      />
                      <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900">
                        Featured Build
                      </div>
                    </div>

                    <div className="flex flex-col p-5">
                      <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">{featuredProject.category}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{featuredProject.level}</span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black tracking-wide text-slate-950">{featuredProject.title}</h3>
                      <p className="mt-3 text-pretty text-sm font-semibold leading-relaxed text-slate-600">{featuredProject.shortDescription}</p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-slate-50 px-3 py-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Time</p>
                          <p className="mt-1 text-xs font-black text-slate-950">{featuredProject.estimatedTime}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Parts</p>
                          <p className="mt-1 text-xs font-black text-slate-950">{featuredProject.components.length} listed</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-3">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Includes</p>
                          <p className="mt-1 text-xs font-black text-slate-950">Code + steps</p>
                        </div>
                      </div>

                      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
                        <Link href={`/projects/${featuredProject.slug}`} className="premium-btn-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-500">
                          Build Guide
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href={featuredProjectProductUrl} target="_blank" rel="noopener noreferrer" className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-900 transition-all hover:bg-emerald-100">
                          Components
                          <PackageCheck className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </ScrollReveal>

              <div className="grid gap-3">
                {supportingProjects.map((project, index) => (
                  <ScrollReveal key={project.slug} delay={index * 80} direction="right">
                    <Link href={`/projects/${project.slug}`} className="premium-interactive-card group grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-cyan-300 hover:shadow-md sm:grid-cols-[96px_1fr_auto] sm:items-center">
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-100 sm:aspect-square">
                        <Image src={project.thumbnailUrl} alt={project.title} fill sizes="120px" className="premium-card-image object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
                          <span className="rounded-full bg-cyan-50 px-2 py-1 text-cyan-800">{project.category}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{project.level}</span>
                        </div>
                        <h3 className="mt-2 text-sm font-black tracking-wide text-slate-950">{project.title}</h3>
                        <p className="mt-1 line-clamp-2 text-pretty text-xs font-semibold leading-relaxed text-slate-600">{project.shortDescription}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 sm:flex-col sm:items-end">
                        <span>{project.estimatedTime}</span>
                        <span>{project.components.length} parts</span>
                        <ArrowRight className="h-4 w-4 text-cyan-700" />
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/70 py-12">
        <ScrollReveal>
          <SectionHeader eyebrow="Ebooks" title="Study material that supports each build" href="/ebooks" />
        </ScrollReveal>
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          {ebooks.slice(0, 3).map((ebook, index) => (
            <ScrollReveal key={ebook.slug} delay={index * 90}>
              <EbookCard ebook={ebook} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-12 lg:grid-cols-3 lg:px-8">
        <ScrollReveal direction="left" className="premium-interactive-card rounded-lg border border-slate-200 bg-white/84 p-6 shadow-sm lg:col-span-2">
          <School className="h-7 w-7 text-cyan-700" />
          <h2 className="mt-4 text-xl font-black text-slate-950">For students, schools and colleges</h2>
          <p className="mt-3 max-w-3xl text-pretty text-sm font-medium leading-relaxed text-slate-600">
            Use REES52 Academy for self-paced learning, workshops, ATL labs, college project practice, and classroom robotics programs. The structure is ready for courses, lessons, quizzes, projects, ebooks, student progress, and admin controls.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["STEM clubs", "ATL labs", "Workshops"].map((item) => (
              <div key={item} className="rounded-lg bg-slate-50 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal direction="right" delay={120} className="premium-interactive-card rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <PackageCheck className="h-7 w-7 text-emerald-800" />
          <h2 className="mt-4 text-lg font-black text-slate-950">Required kits from REES52.com</h2>
          <p className="mt-3 text-pretty text-sm font-medium leading-relaxed text-slate-700">
            Each course and project can point students to the exact boards, sensors, motors, and kits they need.
          </p>
          <a
            href="https://rees52.com"
            target="_blank"
            rel="noopener noreferrer"
            className="premium-btn-shimmer mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-500"
          >
            Visit Store
            <ArrowRight className="h-4 w-4" />
          </a>
        </ScrollReveal>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 lg:px-8">
        <ScrollReveal className="rounded-lg border border-sky-200 bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-8 text-slate-950 shadow-xl shadow-sky-500/10 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-700">Start Learning</p>
              <h2 className="mt-3 text-balance text-2xl font-black md:text-3xl">Choose a course. Build a project. Track your progress.</h2>
              <p className="mt-3 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-slate-600">
                The site is now structured like an LMS while keeping the REES52 robotics identity at the front.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/courses" className="premium-btn-shimmer inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-sky-500/20 transition-all hover:bg-sky-500">
                Start a Course
                <BookOpen className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="premium-btn-interactive inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/84 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-800 transition-all hover:border-sky-300 hover:bg-white">
                Student Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-balance text-2xl font-black text-slate-950 md:text-3xl">{title}</h2>
      {copy && <p className="mt-3 max-w-2xl text-pretty text-sm font-semibold leading-relaxed text-slate-600">{copy}</p>}
    </div>
  );
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="mx-auto mb-7 flex w-full max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:items-end sm:justify-between lg:px-8">
      <SectionTitle eyebrow={eyebrow} title={title} copy="" />
      <Link href={href} className="premium-nav-link inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-600">
        View All
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

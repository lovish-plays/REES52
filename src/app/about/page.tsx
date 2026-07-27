import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, GraduationCap, Headphones, School, ShieldCheck } from "lucide-react";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About REES52 Academy",
  description:
    "Learn how REES52 Academy turns REES52 tutorials, electronics components and classroom experience into complete project-based courses.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <div className="flex-1 bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-300">About REES52 Academy</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              Project-based learning built around real electronics work.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-relaxed text-slate-300">
              REES52 Academy is the learning service of Robotics Embedded Education Services Private Limited.
              It brings REES52 tutorial videos, diagrams, code, workbooks, quizzes and component links into a single guided path.
            </p>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-3xl border border-white/10">
            <Image
              src="/trust/student-robotics-workshop.jpg"
              alt="Students working with robotics kits in a classroom image published by REES52"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BookOpenCheck,
              title: "Complete before public",
              copy: "A course must include multiple videos, substantial lesson text, a wiring diagram, working code, a PDF workbook and a five-question quiz before it appears publicly.",
            },
            {
              icon: GraduationCap,
              title: "REES52 tutorial team",
              copy: "The launch courses use videos published by REES52. Academy lessons add a structured sequence, build evidence and progress tracking around those tutorials.",
            },
            {
              icon: Headphones,
              title: "Human support",
              copy: "Learners and schools can contact the REES52 support team at support@rees52.com or +91 95995 94520 during published support hours.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <Icon className="h-6 w-6 text-sky-700" />
              <h2 className="mt-4 text-lg font-black">{title}</h2>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-sky-50/60">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="flex items-center gap-2 text-sky-700">
              <School className="h-5 w-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Classroom experience</p>
            </div>
            <h2 className="mt-3 text-3xl font-black">Labs and educator development</h2>
            <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
              REES52 publishes AI, robotics and STEM lab work, smart-classroom integration and faculty-development programmes.
              Its PM SHRI robotics-lab page reports installations in more than 100 institutions and names IITs, NITs and other schools and colleges.
            </p>
            <a
              href="https://rees52.com/pages/pm-shri-robotics-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-800"
            >
              Review the published lab programme
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-7 shadow-sm">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h2 className="mt-4 text-xl font-black">Trust and attribution</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              REES52 Academy does not invent learner results, instructor identities, testimonials or institutional endorsements.
              Classroom images and lab-installation names are attributed to the REES52 pages where they were originally published.
              Learner feedback is displayed only when submitted through the Academy.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 text-center lg:px-8">
        <h2 className="text-3xl font-black">See the complete launch courses</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
          Start with Arduino outputs, ESP32 sensing and networking, or a complete line-following robot.
        </p>
        <Link
          href="/courses"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-500"
        >
          Browse courses
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

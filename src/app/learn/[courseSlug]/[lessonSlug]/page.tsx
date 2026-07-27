import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, Eye, FileText, Image as ImageIcon } from "lucide-react";
import LessonSidebar from "@/components/lms/LessonSidebar";
import LessonCompletionButton from "@/components/lms/LessonCompletionButton";
import QuizRunner from "@/components/lms/QuizRunner";
import { getCourseEnrollmentStatus } from "@/app/actions/lms";
import { getCourseBySlug, getCourseLesson, getLessonNavigation, getQuizzes, toPublicQuiz } from "@/lib/lms/data";

interface PageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const lesson = getCourseLesson(course, lessonSlug);
  if (!lesson) notFound();

  const nav = getLessonNavigation(course, lessonSlug);
  const quiz = lesson.type === "quiz" ? getQuizzes().find((item) => item.courseSlug === course.slug) : null;
  const publicQuiz = quiz ? toPublicQuiz(quiz) : null;
  const enrollment = await getCourseEnrollmentStatus(course.slug);

  if (!lesson.isPreview && !enrollment.enrolled) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Enrollment required</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950">Enroll to continue this course</h1>
          <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">Preview lessons are open. Enroll from the course page to unlock the complete learning path and save your progress.</p>
          <Link href={`/courses/${course.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-sky-500">View course</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 lg:grid-cols-[320px_1fr] lg:px-8">
      <LessonSidebar course={course} activeLessonSlug={lesson.slug} />

      <main className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
            Lesson {nav.currentIndex + 1} of {nav.totalLessons}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-black uppercase tracking-wide text-slate-950 md:text-4xl">{lesson.title}</h1>
            {lesson.isPreview && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-800">
                <Eye className="h-3.5 w-3.5" />
                Preview Lesson
              </span>
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">{course.title} - {lesson.duration}</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl">
          {lesson.videoUrl ? (
            <div className="relative aspect-video bg-black">
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center bg-slate-50 p-8 text-center text-slate-700">
              <FileText className="h-10 w-10 text-sky-600" />
              <h2 className="mt-3 text-sm font-black uppercase tracking-widest">Video Tutorial Placeholder</h2>
              <p className="mt-2 max-w-md text-xs font-medium text-slate-500">
                Add a YouTube, Vimeo, Bunny Stream, or other hosted video URL in the lesson video_url field.
              </p>
            </div>
          )}
        </section>

        {publicQuiz ? (
          <QuizRunner quiz={publicQuiz} courseSlug={course.slug} />
        ) : (
          <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">Text Explanation</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-700">{lesson.content}</p>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-700" />
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-950">Circuit Diagram / Image</h2>
            </div>
            <div className="mt-4 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {lesson.circuitDiagramUrl ? "Circuit image URL is ready for backend rendering." : "Add circuit_diagram_url or project image in Supabase."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-950 p-6 text-white shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-cyan-200">Code Section</h2>
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-black/40 p-4 text-xs leading-relaxed text-cyan-50">
              <code>{lesson.code || "// Code will be added for this lesson by the admin team."}</code>
            </pre>
          </div>
        </section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={lesson.pdfUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-cyan-900 transition-all hover:bg-cyan-600 hover:text-white"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
            <LessonCompletionButton courseSlug={courseSlug} lessonSlug={lessonSlug} />
          </div>

          {nav.next ? (
            <Link
              href={`/learn/${course.slug}/${nav.next.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-500"
            >
              Next Lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/courses/${course.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-500"
            >
              Back to Course
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

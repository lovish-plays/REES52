"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { enrollInCourseAction } from "@/app/actions/auth";

export default function CourseEnrollmentPanel({
  courseSlug,
  firstLessonSlug,
  pricing,
  isAuthenticated,
  initiallyEnrolled,
}: {
  courseSlug: string;
  firstLessonSlug?: string;
  pricing: "Free" | "Paid";
  isAuthenticated: boolean;
  initiallyEnrolled: boolean;
}) {
  const [enrolled, setEnrolled] = useState(initiallyEnrolled);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lessonHref = firstLessonSlug ? `/learn/${courseSlug}/${firstLessonSlug}` : `/courses/${courseSlug}`;
  const loginHref = `/login?redirect_to=${encodeURIComponent(`/courses/${courseSlug}`)}`;

  if (pricing === "Paid") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
        <div className="flex items-center gap-2 uppercase tracking-widest">
          <LockKeyhole className="h-4 w-4" /> Paid course
        </div>
        <p className="mt-2 font-semibold leading-relaxed text-amber-800">
          Checkout is not connected yet. Keep this course unpublished until a payment gateway is configured.
        </p>
      </div>
    );
  }

  if (enrolled) {
    return (
      <Link
        href={lessonHref}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500"
      >
        <CheckCircle2 className="h-4 w-4" /> Continue Course
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link
        href={loginHref}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-500"
      >
        Sign in to enroll
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  const enroll = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await enrollInCourseAction(courseSlug);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setEnrolled(true);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={enroll}
        disabled={isPending}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-500 disabled:cursor-wait disabled:opacity-70"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {isPending ? "Enrolling..." : "Enroll for free"}
      </button>
      {message && <p className="max-w-xs text-xs font-bold text-rose-700" role="alert">{message}</p>}
    </div>
  );
}

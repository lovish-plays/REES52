"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markLessonCompleteAction } from "@/app/actions/lms";

export default function LessonCompletionButton({ courseSlug, lessonSlug }: { courseSlug: string; lessonSlug: string }) {
  const [isComplete, setIsComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const complete = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await markLessonCompleteAction(courseSlug, lessonSlug);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setIsComplete(true);
      setMessage(`Progress saved at ${result.progressPercentage ?? 0}%.`);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={complete}
        disabled={isPending || isComplete}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-500 disabled:cursor-default disabled:opacity-70 sm:w-auto"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {isComplete ? "Completed" : isPending ? "Saving..." : "Mark as Complete"}
      </button>
      {message && <p className="text-xs font-bold text-emerald-800" role="status">{message}</p>}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import {
  completeProjectActivityAction,
  saveProjectActivityAction,
} from "@/app/actions/projectActivity";

export default function ProjectActivityButton({
  projectSlug,
  type,
  className,
}: {
  projectSlug: string;
  type: "save" | "complete";
  className?: string;
}) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function runAction() {
    setMessage("");
    startTransition(async () => {
      const result =
        type === "save"
          ? await saveProjectActivityAction(projectSlug)
          : await completeProjectActivityAction(projectSlug);
      setMessage(result.error || result.message || "Activity recorded.");
    });
  }

  const Icon = type === "save" ? Save : CheckCircle2;
  const label = type === "save" ? "Save Project" : "Mark as Completed";

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={runAction}
        disabled={isPending}
        className={className}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        {isPending ? "Saving..." : label}
      </button>
      {message && <p className="mt-2 text-xs font-bold text-slate-600" role="status">{message}</p>}
    </div>
  );
}

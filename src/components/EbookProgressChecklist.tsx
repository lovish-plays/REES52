"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, CheckCircle, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface EbookProgressChecklistProps {
  courseId: string;
  courseName: string;
}

const STEPS_TEXT = [
  "Reading: Chapter 1 & Design Blueprint",
  "Analysis: Electrical Circuit Schematic",
  "Lab Setup: Assembling Hardware Prototype",
  "Testing: Uploading Example Sketches"
];

export default function EbookProgressChecklist({ courseId, courseName }: EbookProgressChecklistProps) {
  const { user, saveProgress } = useAuth();
  const router = useRouter();
  
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);

  const userProgress = user?.progress?.[courseId]?.percentage || 0;

  // Sync state with user profile context updates
  useEffect(() => {
    const stepsState = [
      userProgress >= 25,
      userProgress >= 50,
      userProgress >= 75,
      userProgress === 100
    ];
    setCompletedSteps(stepsState);
  }, [userProgress]);

  const handleStepToggle = async (index: number) => {
    if (!user) {
      router.push("/login");
      return;
    }
    const nextSteps = [...completedSteps];
    nextSteps[index] = !nextSteps[index];

    // Sequence enforcement: complete previous steps, clear following steps
    if (nextSteps[index]) {
      for (let i = 0; i < index; i++) nextSteps[i] = true;
    } else {
      for (let i = index; i < nextSteps.length; i++) nextSteps[i] = false;
    }

    setCompletedSteps(nextSteps);

    const completedCount = nextSteps.filter(Boolean).length;
    const percentage = completedCount * 25;

    await saveProgress(courseId, percentage, STEPS_TEXT[Math.max(0, completedCount - 1)]);
  };

  return (
    <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 bg-white/60 space-y-4">
      <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-800 flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-cyan-600" /> Module Progress checklist
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STEPS_TEXT.map((step, idx) => (
          <div 
            key={idx}
            onClick={() => handleStepToggle(idx)}
            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
              completedSteps[idx] 
                ? "bg-cyan-50/30 border-cyan-300 text-cyan-900" 
                : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
              completedSteps[idx] 
                ? "bg-cyan-600 border-cyan-600 text-white" 
                : "border-slate-300 bg-white"
            }`}>
              {completedSteps[idx] && <CheckCircle className="w-3 h-3 fill-cyan-600 text-white" />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider">{step}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Completion:</span>
          <div className="w-24 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
            <div className="h-full bg-cyan-600 rounded-full transition-all duration-300" style={{ width: `${userProgress}%` }} />
          </div>
          <span className="text-[11px] font-black text-cyan-800">{userProgress}%</span>
        </div>

        {userProgress === 100 && (
          <Link
            href={`/certificate/${courseId}`}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase text-[9px] tracking-widest rounded-lg flex items-center justify-center gap-1 transition-all"
          >
            <Award className="w-3.5 h-3.5 animate-bounce" />
            <span>Claim Completion Certificate</span>
          </Link>
        )}
      </div>
    </div>
  );
}

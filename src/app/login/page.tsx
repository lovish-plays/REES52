'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") || "/";
  const initialPortal = searchParams.get("portal") === "teacher" ? "Teacher" : "Student";

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 glassmorphism border border-slate-200/50 shadow-2xl rounded-2xl bg-[#F7F4EB]/90 text-slate-800 animate-fade-in my-12">
      <AuthForm initialPortal={initialPortal} redirectTo={redirectTo} isModal={false} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20 relative z-10">
      <Suspense
        fallback={
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-4"></div>
            <p className="text-xs font-bold text-slate-600">Preparing sign in...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

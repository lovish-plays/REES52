'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { createLocalSessionForSupabaseUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schoolClassOptions } from "@/lib/lms/class-categories";

type ProfileWriteResult = {
  error: { message: string } | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState<(typeof schoolClassOptions)[number]>("Class 6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Verify we have an active Supabase auth session
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          console.warn("[Onboarding] No active session found. Redirecting to login.");
          router.push("/login");
          return;
        }

        // Check if profile already exists. If it does, redirect to '/'
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          console.log("[Onboarding] Profile already exists. Redirecting to home.");
          router.push("/");
          return;
        }

        setSessionUser(session.user);
        
        // Pre-fill name from metadata or email fallback
        const metaName = session.user.user_metadata?.name || session.user.user_metadata?.full_name;
        const emailFallback = session.user.email?.split("@")[0]?.replace(/[._-]+/g, " ") || "";
        setName(metaName || emailFallback);
      } catch (err) {
        console.error("[Onboarding] Error checking session:", err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const provider = sessionUser.app_metadata?.provider || 'google';

      // 1. Create the profile row in Supabase
      const profileInsert = (await supabase
        .from("profiles")
        .insert({
          id: sessionUser.id,
          name: name.trim(),
          email: sessionUser.email,
          role: "Student",
          class_level: classLevel,
          enrolled_courses: [],
          enrolled_videos: [],
          purchased_ebooks: [],
          provider: provider
        })) as ProfileWriteResult;
      let profileError = profileInsert.error;

      if (profileError && (profileError.message.includes("column") || profileError.message.includes("provider"))) {
        console.log("[Onboarding] Profiles table lacks provider column. Retrying insert without it.");
        const retryInsert = (await supabase
          .from("profiles")
          .insert({
            id: sessionUser.id,
            name: name.trim(),
            email: sessionUser.email,
            role: "Student",
            class_level: classLevel,
            enrolled_courses: [],
            enrolled_videos: [],
            purchased_ebooks: []
          })) as ProfileWriteResult;
        profileError = retryInsert.error;
      }

      if (profileError) {
        console.error("[Onboarding] Profile creation failed:", profileError.message);
        setError(`Failed to save profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      // 2. Synchronize the profile from the authenticated Supabase session.
      const localSessionRes = await createLocalSessionForSupabaseUser();

      if (!localSessionRes.success || !localSessionRes.user) {
        console.error("[Onboarding] Authenticated profile synchronization failed:", localSessionRes.error);
        setError(localSessionRes.error || "Failed to finish your profile setup.");
        setLoading(false);
        return;
      }

      // 3. Refresh user state in Context & Redirect to '/'
      await refreshUser();
      router.push("/");
    } catch (err: any) {
      console.error("[Onboarding] Error during onboarding:", err);
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20">
        <div className="text-center py-10 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">Verifying Setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-20 relative z-10">
      <div className="w-full max-w-md mx-auto p-6 md:p-8 glassmorphism border border-slate-200/50 shadow-2xl rounded-2xl bg-[#F7F4EB]/90 text-slate-800 animate-fade-in my-12">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 mb-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <h2 className="text-slate-900 font-black tracking-wider uppercase text-lg md:text-xl">
            Complete Your Profile
          </h2>
          <p className="text-slate-600 font-semibold text-xs mt-1">
            Let us know what we should call you on REES52.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-50 px-4 py-3 text-xs text-rose-950 flex items-start gap-2 animate-fade-scale">
            <ShieldCheck className="h-4.5 w-4.5 text-rose-600 mt-0.5 flex-shrink-0" />
            <span className="font-extrabold uppercase tracking-wide">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Email Address
            </Label>
            <Input
              id="email"
              type="text"
              value={sessionUser?.email || ""}
              disabled
              className="glass-input rounded-xl text-xs py-2.5 bg-slate-100/55 cursor-not-allowed opacity-75"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="classLevel" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              School Class
            </Label>
            <select
              id="classLevel"
              value={classLevel}
              onChange={(event) => setClassLevel(event.target.value as (typeof schoolClassOptions)[number])}
              disabled={loading}
              className="glass-input w-full rounded-xl bg-white/70 px-3 py-2.5 text-xs font-semibold text-slate-800"
            >
              {schoolClassOptions.map((schoolClass) => <option key={schoolClass}>{schoolClass}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Your Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lovish Kumar"
              required
              disabled={loading}
              className="glass-input rounded-xl text-xs py-2.5 bg-white/70"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-3 text-xs tracking-widest font-black uppercase mt-2 glass-btn-primary flex items-center justify-center gap-1.5 cursor-pointer"
            disabled={loading}
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "SAVING..." : "COMPLETE ONBOARDING"}
          </Button>
        </form>
      </div>
    </div>
  );
}

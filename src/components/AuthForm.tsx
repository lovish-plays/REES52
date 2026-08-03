"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, Sparkles, CheckCircle2, ArrowLeft, GraduationCap, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetOtpAction, verifyOtpAction, resetPasswordWithOtpAction } from "@/app/actions/auth";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import { sanitizeErrorMessage } from "@/lib/utils";

type AuthMode = "signin" | "signup" | "forgot" | "otp" | "reset";

interface AuthFormProps {
  initialPortal?: "Student" | "Teacher";
  redirectTo?: string;
  isModal?: boolean;
  onSuccess?: () => void;
  isOpen?: boolean;
}

export default function AuthForm({
  initialPortal = "Student",
  redirectTo = "/",
  isModal = false,
  onSuccess,
  isOpen = true,
}: AuthFormProps) {
  const { signIn, signUp, signInWithGoogle, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [portal, setPortal] = useState<"Student" | "Teacher">(initialPortal);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [mockOtpValue, setMockOtpValue] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto reset form state when modal closes
  useEffect(() => {
    if (isModal && !isOpen) {
      const resetTimer = window.setTimeout(() => {
        setMode("signin");
        setPortal(initialPortal);
        setName("");
        setEmail("");
        setPassword("");
        setOtp("");
        setNewPassword("");
        setError(null);
        setInfoMessage(null);
        setMockOtpValue(null);
        setLoading(false);
        setShowSuccess(false);
        setSuccessMsg("");
      }, 0);

      return () => window.clearTimeout(resetTimer);
    }
  }, [isOpen, isModal, initialPortal]);

  // Page mode: redirect if already logged in
  useEffect(() => {
    if (!isModal && user && !authLoading) {
      router.refresh();
      router.push(portal === "Teacher" ? "/admin" : redirectTo);
    }
  }, [isModal, user, authLoading, redirectTo, router, portal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const res = await signUp(name.trim(), cleanEmail, password);
        if (res.error) {
          setError(sanitizeErrorMessage(res.error, "Failed to create account. Please try again."));
          setLoading(false);
        } else {
          setSuccessMsg("Account Created Successfully!");
          setShowSuccess(true);
          setLoading(false);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else {
              router.refresh();
              router.push(redirectTo);
            }
          }, 1800);
        }
      } else if (mode === "signin") {
        const res = await signIn(cleanEmail, password, portal);
        if (res.error) {
          setError(sanitizeErrorMessage(res.error, "Failed to sign in. Please check your credentials."));
          setLoading(false);
        } else {
          setSuccessMsg(portal === "Teacher" ? "Teacher Access Granted!" : "Welcome Back!");
          setShowSuccess(true);
          setLoading(false);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            else {
              router.refresh();
              router.push(portal === "Teacher" ? "/admin" : redirectTo);
            }
          }, 300);
        }
      } else if (mode === "forgot") {
        const res = await sendPasswordResetOtpAction(cleanEmail);
        if (res.error) {
          setError(sanitizeErrorMessage(res.error, "Failed to send reset code. Please try again."));
        } else {
          setInfoMessage(res.message || "OTP Sent!");
          if (res.mockOtp) {
            setMockOtpValue(res.mockOtp);
          }
          setMode("otp");
        }
        setLoading(false);
      } else if (mode === "otp") {
        const res = await verifyOtpAction(cleanEmail, otp.trim());
        if (res.error) {
          setError(sanitizeErrorMessage(res.error, "Invalid or expired verification code."));
          setLoading(false);
        } else {
          setInfoMessage("OTP Code Verified! Please enter your new password.");
          setMode("reset");
          setLoading(false);
        }
      } else if (mode === "reset") {
        const res = await resetPasswordWithOtpAction(cleanEmail, otp.trim(), newPassword);
        if (res.error) {
          setError(sanitizeErrorMessage(res.error, "Failed to reset password. Please try again."));
          setLoading(false);
        } else {
          setSuccessMsg("Password Reset Complete!");
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setMode("signin");
            setOtp("");
            setNewPassword("");
            setPassword("");
            setError(null);
            setInfoMessage("Please login with your new password.");
            setMockOtpValue(null);
            setLoading(false);
          }, 1800);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes particle-burst {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-draw-check {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: draw-check 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.3s;
        }
        .animate-fade-scale {
          animation: fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-burst-1 {
          animation: particle-burst 1.2s ease-out infinite;
        }
        .animate-burst-2 {
          animation: particle-burst 1.6s ease-out infinite 0.4s;
        }
      `}</style>

      {showSuccess ? (
        <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-scale">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-burst-1"></div>
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-burst-2"></div>
            <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-400/30 rounded-full shadow-lg backdrop-blur-md">
              <svg className="w-10 h-10 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                <path className="animate-draw-check" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-wider uppercase mb-2">
            {successMsg}
          </h2>
          <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">
            Preparing your Hub workspace...
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2 mb-1.5">
              {mode !== "signin" && (
                <button
                  onClick={() => {
                    setError(null);
                    setInfoMessage(null);
                    if (mode === "otp") setMode("forgot");
                    else if (mode === "reset") setMode("otp");
                    else setMode("signin");
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200/50 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-slate-900 font-black tracking-wider uppercase text-lg leading-none">
                {mode === "signup" && "CREATE ACCOUNT"}
                {mode === "signin" && "WELCOME BACK"}
                {mode === "forgot" && "RESET PASSWORD"}
                {mode === "otp" && "ENTER OTP"}
                {mode === "reset" && "SET NEW PASSWORD"}
              </h2>
            </div>
            <p className="text-slate-600 font-semibold text-xs">
              {mode === "signup" && "Create your REES52 Academy account."}
              {mode === "signin" && (portal === "Teacher" ? "Sign in to create and manage learning content." : "Sign in to access your learning dashboard.")}
              {mode === "forgot" && "Receive a secure code to reset your account password."}
              {mode === "otp" && `Enter the OTP sent to ${email}.`}
              {mode === "reset" && "Enter a new secure password for your account."}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-50 px-4 py-3 text-xs text-rose-950 flex items-start gap-2 animate-fade-scale">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-600 mt-0.5 flex-shrink-0" />
              <span className="font-extrabold uppercase tracking-wide">{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-50 px-4 py-3 text-xs text-cyan-950 flex flex-col gap-1.5 animate-fade-scale">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <span className="font-extrabold uppercase tracking-wide">{infoMessage}</span>
              </div>
              {mockOtpValue && (
                <div className="ml-6 border-t border-cyan-200/50 pt-1.5 flex items-center gap-1.5">
                  <span className="text-[9px] uppercase text-cyan-700 font-bold">Copy Verification Code:</span>
                  <code className="bg-cyan-100/80 px-2 py-0.5 rounded text-[11px] font-black tracking-widest text-cyan-900 border border-cyan-200">
                    {mockOtpValue}
                  </code>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "signin" && (
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white/50 p-1.5" aria-label="Choose login type">
                <button
                  type="button"
                  onClick={() => setPortal("Student")}
                  aria-pressed={portal === "Student"}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${portal === "Student" ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                >
                  <UserRound className="h-4 w-4" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setPortal("Teacher")}
                  aria-pressed={portal === "Teacher"}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${portal === "Teacher" ? "bg-cyan-700 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Teacher
                </button>
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="glass-input rounded-xl text-xs py-2.5"
                />
              </div>
            )}

            {(mode === "signup" || mode === "signin" || mode === "forgot") && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === "signup" ? "you@example.com" : "Enter email"}
                  required
                  disabled={loading}
                  className="glass-input rounded-xl text-xs py-2.5"
                />
              </div>
            )}

            {mode === "signin" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setInfoMessage(null);
                      setMode("forgot");
                    }}
                    className="text-[9px] font-black uppercase tracking-widest text-cyan-700 hover:text-cyan-600 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="glass-input rounded-xl text-xs py-2.5"
                />
              </div>
            )}

            {mode === "otp" && (
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enter 6-Digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="glass-input rounded-xl text-xs py-2.5 text-center font-mono text-base tracking-widest"
                />
              </div>
            )}

            {mode === "reset" && (
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  disabled={loading}
                  className="glass-input rounded-xl text-xs py-2.5"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs tracking-widest font-black uppercase premium-btn-shimmer flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === "signin" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : mode === "forgot" ? "SEND CODE" : mode === "otp" ? "VERIFY CODE" : "RESET PASSWORD"}
                </>
              )}
            </Button>
          </form>

          {hasSupabaseEnv && (mode === "signin" || mode === "signup") && (
            <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-col gap-3">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <Button
                type="button"
                onClick={async () => {
                  setError(null);
                  setInfoMessage(null);
                  setLoading(true);
                  const res = await signInWithGoogle();
                  if (res?.error) {
                    setError(sanitizeErrorMessage(res.error, "Google sign-in failed. Please try again."));
                    setLoading(false);
                  }
                }}
                variant="default"
                className="w-full py-2.5 text-xs tracking-widest font-black uppercase glass-btn-secondary flex items-center justify-center gap-2 cursor-pointer bg-white/80 border border-slate-300 hover:bg-white transition-all text-slate-800"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3A11.973 11.973 0 0 0 12 0C7.054 0 2.766 2.81 0 6.903l5.266 2.862z"
                  />
                  <path
                    fill="#34A853"
                    d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.734-4.856L0 17.097A11.973 11.973 0 0 0 12 24c3.237 0 6.273-1.173 8.527-3.234l-4.487-2.753z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M19.91 3 15.423 5.75c-1.2-1-2.728-1.582-4.418-1.582A7.077 7.077 0 0 0 4.27 9.024L0 6.162A11.973 11.973 0 0 1 12 0c3.237 0 6.273 1.173 8.527 3.234z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M23.49 12.275c0-.852-.075-1.67-.216-2.455H12v4.637h6.47a5.534 5.534 0 0 1-2.399 3.633l4.487 2.753c2.627-2.42 4.143-5.986 4.143-9.568z"
                  />
                </svg>
                Google
              </Button>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200/60 text-center">
            <button
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                const nextMode = mode === "signup" ? "signin" : "signup";
                setMode(nextMode);
              }}
              type="button"
              className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-cyan-700 transition-colors border-none bg-transparent cursor-pointer"
            >
              {mode === "signup"
                ? "ALREADY HAVE AN ACCOUNT? SIGN IN"
                : "DON'T HAVE AN ACCOUNT? REGISTER"}
            </button>
          </div>
        </>
      )}
    </>
  );
}

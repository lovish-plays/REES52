'use client';

import { useEffect, useState } from "react";
import { ShieldAlert, Sparkles, CheckCircle2, ArrowLeft, GraduationCap, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetOtpAction, verifyOtpAction, resetPasswordWithOtpAction } from "@/app/actions/auth";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "signin" | "signup" | "forgot" | "otp" | "reset";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [portal, setPortal] = useState<"Student" | "Teacher">("Student");
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

  useEffect(() => {
    if (!isOpen) {
      const resetTimer = window.setTimeout(() => {
        setMode("signin");
        setPortal("Student");
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
  }, [isOpen]);

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
          setError(res.error);
          setLoading(false);
        } else {
          setSuccessMsg("Account Created Successfully!");
          setShowSuccess(true);
          setLoading(false);
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } else if (mode === "signin") {
        const res = await signIn(cleanEmail, password, portal);
        if (res.error) {
          setError(res.error);
          setLoading(false);
        } else {
          setSuccessMsg(portal === "Teacher" ? "Teacher Access Granted!" : "Welcome Back!");
          setShowSuccess(true);
          setLoading(false);
          setTimeout(() => {
            onClose();
            if (portal === "Teacher") router.push("/admin");
          }, 300);
        }
      } else if (mode === "forgot") {
        const res = await sendPasswordResetOtpAction(cleanEmail);
        if (res.error) {
          setError(res.error);
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
          setError(res.error);
          setLoading(false);
        } else {
          setInfoMessage("OTP Code Verified! Please enter your new password.");
          setMode("reset");
          setLoading(false);
        }
      } else if (mode === "reset") {
        const res = await resetPasswordWithOtpAction(cleanEmail, otp.trim(), newPassword);
        if (res.error) {
          setError(res.error);
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
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="max-w-md bg-[#F7F4EB] text-slate-800 border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
        {/* Style block for self-contained premium animations */}
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
          /* Celebratory Success View */
          <div className="py-10 flex flex-col items-center justify-center text-center animate-fade-scale">
            <div className="relative flex items-center justify-center w-24 h-24 mb-6">
              {/* Outer pulsing bursts */}
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-burst-1"></div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-burst-2"></div>
              
              {/* Main circle */}
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
          /* Normal Auth Forms View */
          <>
            <DialogHeader>
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
              <DialogTitle className="text-slate-900 font-black tracking-wider uppercase">
                {mode === "signup" && "CREATE ACCOUNT"}
                {mode === "signin" && "WELCOME BACK"}
                {mode === "forgot" && "RESET PASSWORD"}
                {mode === "otp" && "ENTER OTP"}
                {mode === "reset" && "SET NEW PASSWORD"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 font-semibold text-xs">
              {mode === "signup" && "Join REES52 Learning Hub in seconds."}
              {mode === "signin" && (portal === "Teacher" ? "Sign in to create and manage learning content." : "Sign in to access your learning dashboard.")}
              {mode === "forgot" && "Receive a secure code to reset your account password."}
              {mode === "otp" && `Enter the OTP sent to ${email}.`}
              {mode === "reset" && "Enter a new secure password for your account."}
            </DialogDescription>
            </DialogHeader>

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
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${portal === "Student" ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                  >
                    <UserRound className="h-4 w-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortal("Teacher")}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="glass-input rounded-xl text-xs py-2.5"
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="glass-input rounded-xl text-xs py-2.5"
                  />
                </div>
              )}

              {mode === "otp" && (
                <div className="space-y-1.5 animate-fade-in">
                  <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verification OTP Code</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    className="glass-input rounded-xl text-xs py-2.5 font-bold tracking-widest text-center bg-white/70"
                  />
                </div>
              )}

              {mode === "reset" && (
                <div className="space-y-1.5 animate-fade-in">
                  <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="glass-input rounded-xl text-xs py-2.5 bg-white/70"
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-xs tracking-widest font-black uppercase mt-2 glass-btn-primary flex items-center justify-center gap-1.5 cursor-pointer"
                disabled={loading}
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "PROCESSING..." : 
                 mode === "signup" ? "SIGN UP" : 
                 mode === "signin" ? "SIGN IN" : 
                 mode === "forgot" ? "SEND RESET OTP" :
                 mode === "otp" ? "VERIFY OTP" :
                 "RESET PASSWORD"}
              </Button>

              {hasSupabaseEnv && (mode === "signin" || mode === "signup") && (
                <>
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300/50"></div>
                    </div>
                    <span className="relative bg-[#F7F4EB] px-3 text-[9px] font-black uppercase tracking-widest text-slate-500">
                      OR
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={async () => {
                      setError(null);
                      setInfoMessage(null);
                      setLoading(true);
                      const res = await signInWithGoogle();
                      if (res?.error) {
                        setError(res.error);
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
                        d="M16.04 15.358c-1.076.75-2.5 1.196-4.04 1.196-3.805 0-7.027-2.545-8.177-5.973L.662 13.435C2.766 17.595 7.054 20.4 12 20.4c3.055 0 5.864-1.077 7.973-2.909l-3.932-2.133z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.273c0-.818-.082-1.609-.232-2.373H12v4.582h6.49A5.626 5.626 0 0 1 16.04 15.36l3.931 2.132c2.291-2.113 3.518-5.218 3.518-9.218z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M3.823 10.582a7.03 7.03 0 0 1 0-2.364L.663 5.356a11.93 11.93 0 0 0 0 8.87l3.16-2.844c-.3-.5-.468-1.091-.468-1.782z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </>
              )}

              {mode !== "otp" && mode !== "reset" && (
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = mode === "signup" ? "signin" : "signup";
                    setMode(nextMode);
                    if (nextMode === "signup") setPortal("Student");
                    setError(null);
                    setInfoMessage(null);
                  }}
                  className="w-full text-center text-[10px] font-black uppercase tracking-widest text-cyan-800 hover:text-cyan-700 transition-colors mt-2 cursor-pointer border-none bg-transparent"
                >
                  {mode === "signup"
                    ? "ALREADY HAVE AN ACCOUNT? SIGN IN"
                    : "DON'T HAVE AN ACCOUNT? SIGN UP"}
                </button>
              )}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

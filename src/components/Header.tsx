"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  LogOut,
  MoreVertical,
  Radio,
  Shield,
  Video,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TAGLINES = [
  "52 Weeks of Innovation. A New Breakthrough Every Week.",
  "Build. Code. Evolve. 52 Weeks a Year.",
  "Never Stop Inventing: 365 Days of Tech, 52 Weeks of Discovery.",
  "From Blueprint to Bot—A New Creation Every Single Week.",
  "Syllabus for the Future. Updated Weekly.",
  "52 Weeks of Hardware. A Lifetime of Engineering.",
  "One Year. 52 Projects. Infinite Possibilities.",
  "Where Robotics Meets Education—Every Single Week.",
  "Mastering Embedded Systems, One Week at a Time.",
  "52 Weeks to Build the Future. Start This Week."
];

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [authOpen, setAuthOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * TAGLINES.length);
    setTagline(TAGLINES[idx]);
  }, []);

  const onLogout = async () => {
    await signOut();
    setDirectoryOpen(false);
    router.push("/login");
  };

  const overlayLinkClass =
    "flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl transition-all hover:border-cyan-500/40 hover:bg-white hover:shadow-md";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 bg-[#F7F4EB]/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 p-2 shadow-sm group-hover:neon-glow">
              <GraduationCap className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-black tracking-wider text-slate-900">
                REES<span className="text-cyan-600">52</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                Infinity Learning Hub
              </span>
              {tagline && (
                <span className="hidden md:inline text-[9px] text-slate-800 font-bold uppercase tracking-wider animate-fade-in-up mt-0.5 max-w-[250px] md:max-w-md truncate">
                  {tagline}
                </span>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {!user ? (
              !isLoginPage && (
                <Button variant="primary" size="sm" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
              )
            ) : (
              <>
                {/* Avatar dropdown (My Learning / My Stuff / Admin / Sign out) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-2 py-2 hover:bg-white hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 cursor-pointer"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-cyan-100 text-cyan-900 font-bold">
                          {user.name?.trim()?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-xs font-extrabold text-slate-800">
                        Hi,{" "}
                        <span className="text-slate-900">
                          {user.name.split(" ")[0]}
                        </span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#F7F4EB]/95 border border-slate-200">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-xs font-black tracking-wider text-slate-900">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-slate-600 truncate">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild className="focus:bg-cyan-50 focus:text-cyan-950">
                      <Link href="/my-learning" className="flex items-center gap-2 w-full px-2 py-1.5 text-slate-800 hover:text-cyan-900 transition-colors">
                        <Video className="h-4 w-4 text-cyan-600" />
                        <span className="font-extrabold text-[10px] uppercase tracking-widest">My Learning</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-cyan-50 focus:text-cyan-950">
                      <Link href="/my-stuff" className="flex items-center gap-2 w-full px-2 py-1.5 text-slate-800 hover:text-cyan-900 transition-colors">
                        <BookOpen className="h-4 w-4 text-cyan-600" />
                        <span className="font-extrabold text-[10px] uppercase tracking-widest">My Stuff</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "Admin" && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-200" />
                        <DropdownMenuItem asChild className="focus:bg-slate-100 focus:text-slate-950">
                          <Link href="/admin" className="flex items-center gap-2 w-full px-2 py-1.5 text-slate-900 hover:text-slate-950 transition-colors">
                            <Shield className="h-4 w-4 text-slate-800" />
                            <span className="font-extrabold text-[10px] uppercase tracking-widest text-slate-900">Admin Control</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild>
                      <button onClick={onLogout} className="w-full text-left flex items-center gap-2 text-rose-800 hover:text-rose-950 focus:bg-rose-50 focus:text-rose-950 cursor-pointer border-none bg-transparent outline-none px-2 py-1.5">
                        <LogOut className="h-4 w-4 text-rose-600" />
                        <span className="font-extrabold text-[10px] uppercase tracking-widest">Sign Out</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Global directory explorer (3-dot menu) */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDirectoryOpen(true)}
                  aria-label="More navigation"
                  className="border border-slate-200 bg-white/70 hover:bg-white text-slate-800"
                >
                  <MoreVertical className="h-4 w-4 text-slate-700" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3-dot overlay */}
      {directoryOpen && (
        <div className="fixed inset-0 z-50 bg-[#F7F4EB]/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <button
            onClick={() => setDirectoryOpen(false)}
            className="absolute right-6 top-6 rounded-xl border border-slate-200 bg-white/70 p-2 text-slate-800 hover:bg-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-6">
            <h3 className="mb-2 text-center text-xl font-black tracking-wider text-slate-900">
              Explore Content
            </h3>
            <p className="mb-8 text-center text-sm text-slate-600">
              Jump into Ebooks, Video Lectures, or Live Webinars.
            </p>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <Link
                href="/?type=ebooks"
                onClick={() => setDirectoryOpen(false)}
                className={overlayLinkClass}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-cyan-300/40 bg-cyan-500/10 p-3">
                    <BookOpen className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black tracking-wider text-slate-900">
                      EBOOKS
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Guides, handbooks & PDFs
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/?type=videos"
                onClick={() => setDirectoryOpen(false)}
                className={overlayLinkClass}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-blue-300/40 bg-blue-500/10 p-3">
                    <Video className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black tracking-wider text-slate-900">
                      VIDEOS
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Preview lectures & walkthroughs
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/?type=live"
                onClick={() => setDirectoryOpen(false)}
                className={overlayLinkClass + " sm:col-span-2"}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-3">
                    <Radio className="h-6 w-6 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black tracking-wider text-slate-900">
                        LIVE WEBINARS
                      </p>
                      <span className="h-2 w-2 animate-ping rounded-full bg-cyan-500" />
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Live interactive sessions with engineers
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auth modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

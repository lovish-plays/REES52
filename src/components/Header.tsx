"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileQuestion,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  MoreVertical,
  Newspaper,
  PackageCheck,
  School,
  Shield,
  ShoppingBag,
  Sparkles,
  Trophy,
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
import { supabase } from "@/lib/supabaseClient";
import { getNotifications } from "@/app/actions/content";
import { isTeacherRole } from "@/lib/auth/roles";
import { schoolClassOptions } from "@/lib/lms/class-categories";

const STORE_URL = "https://rees52.com/collections/stem-kits";

const LEARNING_LINKS = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/ebooks", label: "Ebooks", icon: PackageCheck },
];

const TOP_NAV_LINKS = [
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const DIRECTORY_LINKS = [
  {
    href: "/courses",
    label: "Courses",
    description: "Structured robotics and electronics paths",
    icon: BookOpen,
    iconWrap: "border-cyan-300/40 bg-cyan-500/10",
    iconClass: "text-cyan-600",
  },
  {
    href: "/projects",
    label: "Project Library",
    description: "Circuit, code, components and guides",
    icon: FolderKanban,
    iconWrap: "border-blue-300/40 bg-blue-500/10",
    iconClass: "text-blue-600",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    description: "Monthly learner points from verified activity",
    icon: Trophy,
    iconWrap: "border-amber-300/40 bg-amber-500/10",
    iconClass: "text-amber-700",
  },
  {
    href: "/ebooks",
    label: "Ebooks",
    description: "Downloadable study material and manuals",
    icon: PackageCheck,
    iconWrap: "border-emerald-300/40 bg-emerald-500/10",
    iconClass: "text-emerald-600",
  },
  {
    href: "/about",
    label: "About REES52 Academy",
    description: "Learning approach, company and support details",
    icon: GraduationCap,
    iconWrap: "border-violet-300/40 bg-violet-500/10",
    iconClass: "text-violet-700",
  },
  {
    href: "/dashboard",
    label: "Student Dashboard",
    description: "Progress, saved projects and quiz results",
    icon: LayoutDashboard,
    iconWrap: "border-slate-300/40 bg-slate-500/10",
    iconClass: "text-slate-700",
  },
];

interface NotificationItem {
  id: string;
  message: string;
  link: string;
  created_at: string;
}

type RealtimeCleanupClient = {
  removeChannel: (channel: unknown) => unknown;
};

export default function Header() {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [authOpen, setAuthOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [realtimePopup, setRealtimePopup] = useState<NotificationItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!user) {
      const clearTimer = window.setTimeout(() => {
        setNotifications([]);
        setHasUnread(false);
        setNotifOpen(false);
        setRealtimePopup(null);
      }, 0);
      return () => window.clearTimeout(clearTimer);
    }

    async function loadNotifications() {
      try {
        const list = await getNotifications();
        setNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }

    loadNotifications();

    const channel = supabase
      .channel("realtime-notifications")
      .on("broadcast", { event: "new-notification" }, (payload: Record<string, unknown>) => {
        const nestedPayload = payload.payload;
        const source = (
          typeof nestedPayload === "object" && nestedPayload !== null ? nestedPayload : payload
        ) as Partial<NotificationItem>;
        if (!source.message) return;

        const newNotif = {
          id: source.id || Date.now().toString(),
          message: source.message,
          link: source.link || "",
          created_at: source.created_at || new Date().toISOString(),
        };

        setNotifications((prev) => [newNotif, ...prev]);
        setHasUnread(true);
        setRealtimePopup(newNotif);
        setIsAnimating(true);

        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => setRealtimePopup(null), 300);
        }, 5000);
      })
      .subscribe();

    return () => {
      (supabase as RealtimeCleanupClient).removeChannel(channel);
    };
  }, [user]);

  const onLogout = async () => {
    await signOut();
    setDirectoryOpen(false);
    router.push("/login");
  };

  const overlayLinkClass =
    "flex items-center justify-between rounded-lg border border-slate-200/80 bg-white/80 p-5 backdrop-blur-xl transition-all duration-200 hover:border-cyan-500/40 hover:bg-white hover:shadow-md";

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-sky-100/80 bg-[#F8FBFF]/86 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3 premium-logo-group">
            <div className="rounded-lg border border-slate-200 bg-cyan-50 p-2 shadow-sm premium-logo-icon">
              <GraduationCap className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-black tracking-wider text-slate-900 premium-logo-text">
                REES<span className="text-cyan-600">52</span> Academy
              </span>
              <span className="hidden text-[9px] font-bold uppercase tracking-wider text-slate-500 md:inline">
                Robotics and electronics courses
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[10px] font-black uppercase tracking-widest outline-none transition-all duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-sky-300 ${
                    LEARNING_LINKS.some((link) => pathname === link.href || pathname.startsWith(`${link.href}/`))
                      ? "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-500/25"
                      : "border-sky-200/80 bg-white/80 text-sky-900 shadow-sm hover:border-sky-300 hover:bg-white hover:shadow-md"
                  }`}
                  aria-label="Open classes and learning menu"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  Classes &amp; Learn
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-[min(92vw,680px)] origin-top animate-in fade-in zoom-in-95 border border-sky-100 bg-white/95 p-3 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.2)] backdrop-blur-2xl"
              >
                <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] text-sky-700">School classes</p>
                        <p className="mt-1 text-sm font-black text-slate-950">Choose Class 3–12</p>
                      </div>
                      <School className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {schoolClassOptions.map((schoolClass) => (
                        <DropdownMenuItem key={schoolClass} asChild className="p-0 focus:bg-transparent">
                          <Link
                            href={`/courses?class=${encodeURIComponent(schoolClass)}`}
                            aria-label={`View ${schoolClass} courses`}
                            className="group/class flex min-h-11 items-center justify-center rounded-lg border border-sky-200 bg-white px-2 py-2 text-xs font-black text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-600 hover:text-white hover:shadow-md focus-visible:ring-2 focus-visible:ring-sky-400"
                          >
                            {schoolClass.replace("Class ", "")}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                    <p className="mt-3 text-[10px] font-semibold leading-relaxed text-slate-600">
                      Every class stays visible, even while teachers are preparing its first course.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-2">
                    <DropdownMenuLabel className="px-3 pb-2 pt-2 text-[9px] text-slate-500">
                      Learning library
                    </DropdownMenuLabel>
                    {LEARNING_LINKS.map((link) => {
                      const Icon = link.icon;
                      return (
                        <DropdownMenuItem key={link.href} asChild className="focus:bg-sky-50 focus:text-sky-950">
                          <Link
                            href={link.href}
                            className="group/library flex w-full items-center justify-between px-3 py-2.5 text-slate-800"
                          >
                            <span className="flex items-center gap-3">
                              <span className="rounded-lg bg-sky-50 p-2 text-sky-700 transition-all duration-200 group-hover/library:bg-sky-600 group-hover/library:text-white">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                            </span>
                            <ArrowIndicator />
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {TOP_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5 ${
                    isActive
                      ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                      : "text-slate-700 hover:bg-white/90 hover:text-sky-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <Link
                href="/dashboard"
                aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  pathname.startsWith("/dashboard")
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-500/20"
                    : "text-slate-700 hover:bg-white/90 hover:text-sky-800"
                }`}
              >
                My Learning
              </Link>
            )}
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:text-sky-800"
            >
              Kits
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {isLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-1.5 shadow-sm" aria-label="Checking sign-in status">
                <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
                <div className="hidden h-2.5 w-14 animate-pulse rounded bg-slate-200 sm:block" />
              </div>
            ) : !user ? (
              !isLoginPage && (
                <Button variant="primary" size="sm" onClick={() => setAuthOpen(true)} className="gap-2 premium-btn-shimmer">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              )
            ) : (
              <>
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setHasUnread(false);
                    }}
                    className={`relative border border-slate-200/80 bg-white/70 text-slate-800 transition-all premium-bell-hover ${
                      hasUnread ? "border-cyan-400" : ""
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className={`h-4 w-4 text-slate-700 ${hasUnread ? "animate-bounce text-cyan-600" : ""}`} />
                    {hasUnread && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
                      </span>
                    )}
                  </Button>

                  {realtimePopup && (
                    <div
                      className={`absolute right-0 top-12 z-50 flex w-72 items-start gap-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-600 to-blue-600 p-4 text-white shadow-2xl transition-all duration-300 ${
                        isAnimating ? "animate-fade-in-up" : "translate-y-2 scale-95 opacity-0"
                      }`}
                    >
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 animate-bounce" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest text-cyan-200">
                          New Announcement
                        </p>
                        <p className="mt-0.5 line-clamp-3 text-[11px] font-bold leading-snug">
                          {realtimePopup.message}
                        </p>
                        {realtimePopup.link && (
                          <a
                            href={realtimePopup.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white underline hover:text-cyan-200"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {notifOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] sm:hidden"
                        onClick={() => setNotifOpen(false)}
                      />
                      <div className="notification-panel fixed inset-x-3 top-16 z-50 flex max-h-[75vh] flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200/80 p-4 shadow-2xl glassmorphism animate-in fade-in zoom-in-95 duration-200 sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-80 sm:max-h-96">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            Notifications ({notifications.length})
                          </h4>
                          <button
                            onClick={() => setNotifications([])}
                            className="cursor-pointer text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700"
                          >
                            Clear All
                          </button>
                        </div>

                        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                          {notifications.map((n) => {
                            const isExpanded = expandedId === n.id;
                            return (
                              <div
                                key={n.id}
                                onClick={() => setExpandedId(isExpanded ? null : n.id)}
                                className="group cursor-pointer rounded-xl border border-slate-100 bg-white/50 p-2.5 text-left transition-all hover:border-cyan-200 hover:bg-white"
                              >
                                <p className={`text-xs font-semibold leading-relaxed text-slate-800 ${isExpanded ? "" : "line-clamp-2"}`}>
                                  {n.message}
                                </p>

                                {isExpanded && n.link && (
                                  <a
                                    href={n.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-2 flex w-fit items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-800 transition-colors hover:bg-cyan-100/80 hover:text-cyan-900"
                                  >
                                    <span>Visit Link</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}

                                <div className="mt-2 flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-slate-500">
                                  <span>
                                    {new Date(n.created_at).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="text-cyan-600 group-hover:underline">
                                    {isExpanded ? "Show Less" : "Read More"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {notifications.length === 0 && (
                            <div className="py-8 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              No notifications yet
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-2 py-2 transition-all duration-300 hover:scale-[1.04] hover:border-cyan-400/40 hover:bg-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9 transition-transform duration-300 group-hover:scale-105">
                        <AvatarFallback className="bg-cyan-100 font-bold text-cyan-900">
                          {user.name?.trim()?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-xs font-extrabold text-slate-800 md:inline">
                        Hi, <span className="text-slate-900">{user.name.split(" ")[0]}</span>
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border border-sky-100 bg-[#F8FBFF]/95">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-xs font-black tracking-wider text-slate-900">
                          {user.name}
                        </span>
                        <span className="truncate text-[11px] text-slate-600">
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild className="focus:bg-cyan-50 focus:text-cyan-950">
                      <Link href="/dashboard" className="flex w-full items-center gap-2 px-2 py-1.5 text-slate-800 transition-transform duration-200 hover:translate-x-1.5 hover:text-cyan-900">
                        <LayoutDashboard className="h-4 w-4 text-cyan-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">My Learning</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-cyan-50 focus:text-cyan-950">
                      <Link href="/dashboard/my-ebooks" className="flex w-full items-center gap-2 px-2 py-1.5 text-slate-800 transition-transform duration-200 hover:translate-x-1.5 hover:text-cyan-900">
                        <BookOpen className="h-4 w-4 text-cyan-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">My Ebooks</span>
                      </Link>
                    </DropdownMenuItem>
                    {isTeacherRole(user.role) && (
                      <>
                        <DropdownMenuSeparator className="bg-slate-200" />
                        <DropdownMenuItem asChild className="focus:bg-slate-100 focus:text-slate-950">
                          <Link href="/admin" className="flex w-full items-center gap-2 px-2 py-1.5 text-slate-900 transition-transform duration-200 hover:translate-x-1.5 hover:text-slate-950">
                            <Shield className="h-4 w-4 text-slate-800" />
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900">Teacher Studio</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild>
                      <button onClick={onLogout} className="flex w-full cursor-pointer items-center gap-2 border-none bg-transparent px-2 py-1.5 text-left text-rose-800 outline-none transition-transform duration-200 hover:translate-x-1.5 hover:text-rose-950 focus:bg-rose-50 focus:text-rose-950">
                        <LogOut className="h-4 w-4 text-rose-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest">Sign Out</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDirectoryOpen(true)}
              aria-label="More navigation"
              className="group border border-slate-200 bg-white/70 text-slate-800 transition-all duration-300 hover:scale-105 hover:border-cyan-400/40 hover:bg-white hover:shadow-md"
            >
              <MoreVertical className="h-4 w-4 text-slate-700 transition-transform duration-300 group-hover:rotate-90" />
            </Button>
          </div>
        </div>
      </header>

      {directoryOpen && (
        <div className="fixed inset-0 z-50 bg-[#F8FBFF]/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <button
            onClick={() => setDirectoryOpen(false)}
            className="absolute right-6 top-6 rounded-xl border border-slate-200 bg-white/70 p-2 text-slate-800 hover:bg-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-start overflow-y-auto px-6 py-20 md:justify-center">
            <h3 className="mb-2 text-center text-xl font-black tracking-wider text-slate-900">
              REES52 Academy
            </h3>
            <p className="mb-5 text-center text-sm text-slate-600">
              Choose your school class or jump into any Academy learning resource.
            </p>

            <div className="mb-5 w-full rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.22em] text-sky-700">School classes</p>
                  <p className="mt-1 text-sm font-black text-slate-950">Browse learning for Class 3–12</p>
                </div>
                <School className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {schoolClassOptions.map((schoolClass) => (
                  <Link
                    key={schoolClass}
                    href={`/courses?class=${encodeURIComponent(schoolClass)}`}
                    onClick={() => setDirectoryOpen(false)}
                    aria-label={`Open ${schoolClass} courses`}
                    className="flex min-h-11 items-center justify-center rounded-lg border border-sky-200 bg-white px-2 py-2 text-xs font-black text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-600 hover:text-white hover:shadow-md"
                  >
                    {schoolClass.replace("Class ", "")}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              {DIRECTORY_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDirectoryOpen(false)}
                    className={overlayLinkClass}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg border p-3 ${item.iconWrap}`}>
                        <Icon className={`h-6 w-6 ${item.iconClass}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-wider text-slate-900">
                          {item.label}
                        </p>
                        <p className="text-[11px] font-medium text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}

              <a
                href={STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setDirectoryOpen(false)}
                className={overlayLinkClass + " sm:col-span-2"}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg border border-cyan-300/40 bg-cyan-500/10 p-3">
                    <ShoppingBag className="h-6 w-6 text-cyan-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Kits
                    </p>
                    <p className="text-[11px] font-medium text-slate-600">
                      Buy kits and components from REES52.com
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-cyan-700" />
              </a>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function ArrowIndicator() {
  return (
    <span aria-hidden="true" className="text-sm text-sky-500 transition-transform duration-200 group-hover/library:translate-x-1">
      →
    </span>
  );
}

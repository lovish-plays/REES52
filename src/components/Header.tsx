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
  Bell,
  ExternalLink,
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

  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Real-time animation popup toast
  const [realtimePopup, setRealtimePopup] = useState<any | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const idx = Math.floor(Math.random() * TAGLINES.length);
    setTagline(TAGLINES[idx]);
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const list = await getNotifications();
        setNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    
    if (user) {
      loadNotifications();
    }

    const channel = supabase
      .channel('realtime-notifications')
      .on('broadcast', { event: 'new-notification' }, (payload: any) => {
        const newNotif = {
          id: payload.payload.id || Date.now().toString(),
          message: payload.payload.message,
          link: payload.payload.link || '',
          created_at: payload.payload.created_at || new Date().toISOString()
        };

        setNotifications(prev => [newNotif, ...prev]);
        setHasUnread(true);

        // Trigger popup out of bell icon
        setRealtimePopup(newNotif);
        setIsAnimating(true);

        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => setRealtimePopup(null), 300);
        }, 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
                {/* Notification Bell Panel */}
                <div className="relative">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setHasUnread(false);
                    }}
                    className={`border border-slate-200/80 bg-white/70 hover:bg-white text-slate-800 relative transition-transform duration-200 hover:scale-105 ${
                      hasUnread ? 'border-cyan-400' : ''
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className={`h-4 w-4 text-slate-700 ${hasUnread ? 'animate-bounce text-cyan-600' : ''}`} />
                    {hasUnread && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                      </span>
                    )}
                  </Button>

                  {/* Realtime Announcement Popout speech bubble out of bell icon */}
                  {realtimePopup && (
                    <div className={`absolute right-0 top-12 z-50 w-72 bg-gradient-to-br from-cyan-600 to-blue-600 text-white p-4 rounded-2xl shadow-2xl border border-cyan-400/30 flex items-start gap-3 transition-all duration-300 ${
                      isAnimating ? 'animate-fade-in-up' : 'opacity-0 scale-95 translate-y-2'
                    }`}>
                      <Bell className="h-4 w-4 mt-0.5 animate-bounce flex-shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[9px] uppercase font-black tracking-widest text-cyan-200">
                          NEW ANNOUNCEMENT
                        </p>
                        <p className="text-[11px] font-bold line-clamp-3 leading-snug mt-0.5">
                          {realtimePopup.message}
                        </p>
                        {realtimePopup.link && (
                          <a
                            href={realtimePopup.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white mt-1.5 underline hover:text-cyan-200"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notification List Dropdown Panel */}
                  {notifOpen && (
                    <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto glassmorphism notification-panel p-4 rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                          Notifications ({notifications.length})
                        </h4>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
                        {notifications.map((n) => {
                          const isExpanded = expandedId === n.id;
                          return (
                            <div
                              key={n.id}
                              onClick={() => setExpandedId(isExpanded ? null : n.id)}
                              className="group p-2.5 rounded-xl border border-slate-100 bg-white/50 hover:bg-white hover:border-cyan-200 transition-all cursor-pointer text-left"
                            >
                              <p className={`text-xs text-slate-800 font-semibold leading-relaxed ${
                                isExpanded ? '' : 'line-clamp-2'
                              }`}>
                                {n.message}
                              </p>
                              
                              {isExpanded && n.link && (
                                <a
                                  href={n.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-2 w-fit px-3 py-1.5 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-800 hover:bg-cyan-100/80 hover:text-cyan-900 transition-colors"
                                >
                                  <span>Visit Link</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}

                              <div className="mt-2 flex items-center justify-between text-[8px] text-slate-500 font-extrabold uppercase tracking-wider">
                                <span>
                                  {new Date(n.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="text-cyan-600 group-hover:underline">
                                  {isExpanded ? 'Show Less' : 'Read More'}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {notifications.length === 0 && (
                          <div className="py-8 text-center text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                href="/my-stuff"
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
                href="/my-learning"
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

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

import {
  registerUser,
  loginUser,
  logoutUser,
  enrollInVideoAction,
  purchaseEbookAction,
  getCurrentUser,
  createLocalSessionForSupabaseUser,
  saveProgressAction,
  claimCertificateAction,
  updateStreakAction,
  addRecentlyViewedAction,
  trackAnalyticsEventAction
} from "@/app/actions/auth";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Admin";
  enrolled_videos: string[];
  purchased_ebooks: string[];
  avatar_url?: string;
  provider?: string;
  hasProfile?: boolean;
  progress?: Record<string, any>;
  certificates?: any[];
  badges?: any[];
  streak?: any;
  recently_viewed?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  session: Session | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success?: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success?: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success?: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enrollInVideo: (videoId: string) => Promise<{ success?: boolean; error?: string }>;
  purchaseEbook: (ebookId: string) => Promise<{ success?: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  saveProgress: (courseId: string, percentage: number, lastViewedLesson?: string) => Promise<any>;
  claimCertificate: (courseId: string, courseName: string) => Promise<any>;
  updateStreak: () => Promise<any>;
  addRecentlyViewed: (courseId: string) => Promise<any>;
  trackAnalyticsEvent: (eventType: string, eventData: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  enrolled_videos: string[] | null;
  purchased_ebooks: string[] | null;
  avatar_url: string | null;
  provider: string | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const loadProfile = async (authUserId: string, email: string, fallbackName?: string) => {
    console.log("[AuthContext] loadProfile started for authUserId:", authUserId);
    try {
      let data: ProfileRow | null = null;
      let error = null;

      try {
        console.log("[AuthContext] Querying Supabase profiles for id:", authUserId);
        const queryPromise = supabase
          .from("profiles")
          .select("id,name,role,enrolled_videos,purchased_ebooks,avatar_url,provider")
          .eq("id", authUserId)
          .maybeSingle<ProfileRow>();
          
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Supabase profile query timed out after 10 seconds")), 10000)
        );

        const response = await Promise.race([queryPromise, timeoutPromise]);
        data = response.data;
        error = response.error;

        if (error && (error.message.includes("column") || error.message.includes("avatar_url"))) {
          console.log("[AuthContext] Profiles table lacks avatar_url/provider. Retrying query without them.");
          const retryRes = await supabase
            .from("profiles")
            .select("id,name,role,enrolled_videos,purchased_ebooks")
            .eq("id", authUserId)
            .maybeSingle<any>();
          if (!retryRes.error) {
            data = {
              ...retryRes.data,
              avatar_url: null,
              provider: 'email'
            };
            error = null;
          } else {
            error = retryRes.error;
          }
        }

        console.log("[AuthContext] Supabase profile query finished. data:", data, "error:", error);
      } catch (err: any) {
        console.warn("[AuthContext] Supabase profile query failed or timed out:", err.message || err);
        error = err;
      }

      // If client query failed/timed out or returned no profile, fallback to the server action
      if (error || !data) {
        console.log("[AuthContext] Client profile query failed/empty. Trying server action fallback...");
        try {
          const serverUser = await getCurrentUser();
          if (serverUser && serverUser.id === authUserId) {
            console.log("[AuthContext] Profile retrieved via server action fallback:", serverUser);
            setUser(serverUser);
            return;
          }
        } catch (serverErr) {
          console.error("[AuthContext] Server action fallback failed:", serverErr);
        }
      }

      // Only create self-healing profile if the provider is 'email'
      const { data: sessionData } = await supabase.auth.getSession();
      const authProvider = sessionData?.session?.user?.app_metadata?.provider || "email";

      if (!data && !error && authProvider === "email") {
        console.log("[AuthContext] No profile found. Creating self-healing profile...");
        const role = "Student";
        const name = fallbackName?.trim() || email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Learner";
        
        const insertRes = await supabase
          .from("profiles")
          .insert({
            id: authUserId,
            name,
            email,
            role,
            enrolled_videos: [],
            purchased_ebooks: []
          })
          .select("id,name,role,enrolled_videos,purchased_ebooks")
          .maybeSingle<any>();

        if (!insertRes.error && insertRes.data) {
          console.log("[AuthContext] Self-healing profile created successfully:", insertRes.data);
          data = {
            ...insertRes.data,
            avatar_url: null,
            provider: 'email'
          };
        } else if (insertRes.error) {
          console.error("[AuthContext] Self-healing profile creation failed:", insertRes.error.message);
        }
      }

      const role = (data?.role?.toLowerCase() === "admin" ? "Admin" : "Student") as
        | "Admin"
        | "Student";

      const finalName =
        data?.name?.trim() ||
        fallbackName?.trim() ||
        email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ||
        "Learner";

      const hasProfile = data ? true : (error ? undefined : false);

      console.log("[AuthContext] Setting user state. role:", role, "name:", finalName, "hasProfile:", hasProfile);
      setUser({
        id: authUserId,
        email,
        name: finalName,
        role,
        enrolled_videos: data?.enrolled_videos ?? [],
        purchased_ebooks: data?.purchased_ebooks ?? [],
        avatar_url: data?.avatar_url ?? (sessionData?.session?.user?.user_metadata?.avatar_url as string | undefined) ?? (sessionData?.session?.user?.user_metadata?.picture as string | undefined),
        provider: data?.provider ?? authProvider,
        hasProfile: hasProfile,
        progress: (data as any)?.progress ?? {},
        certificates: (data as any)?.certificates ?? [],
        badges: (data as any)?.badges ?? [],
        streak: (data as any)?.streak ?? null,
        recently_viewed: (data as any)?.recently_viewed ?? []
      });
      console.log("[AuthContext] User state set successfully in loadProfile. Triggering streak update...");
      
      // Auto-update learning streak
      updateStreakAction().then(res => {
        if (res.success && res.streak) {
          setUser(prev => prev ? { ...prev, streak: res.streak } : null);
        }
      }).catch(err => console.warn("Streak auto-update error:", err));

    } catch (e: any) {
      console.error("[AuthContext] loadProfile encountered unexpected error:", e);
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      const s = data.session;
      if (!s?.user) {
        setUser(null);
        return;
      }
      await loadProfile(
        s.user.id,
        s.user.email ?? "",
        (s.user.user_metadata?.name as string | undefined) ?? undefined
      );
    } catch (e) {
      console.error('Error loading current user:', e);
    }
    setIsLoading(false);
  };

  // Track whether signIn already initiated a profile load so the listener
  // doesn't trigger a redundant second fetch for the same session.
  const profileLoadingRef = React.useRef(false);

  useEffect(() => {
    setIsLoading(true);

    let isSubscribed = true;

    // Listen to auth changes (including initial session load)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isSubscribed) return;
      setSession(newSession);

      if (newSession?.user) {
        if (profileLoadingRef.current) return;
        setIsLoading(true);
        await loadProfile(
          newSession.user.id,
          newSession.user.email ?? "",
          (newSession.user.user_metadata?.name as string | undefined) ?? undefined
        );
        if (isSubscribed) {
          setIsLoading(false);
        }
      } else {
        // Fallback to check local session via getCurrentUser server action
        if (isSubscribed) {
          setIsLoading(true);
        }
        try {
          const localUser = await getCurrentUser();
          if (localUser && isSubscribed) {
            setUser({
              id: localUser.id,
              name: localUser.name,
              email: localUser.email,
              role: localUser.role,
              enrolled_videos: localUser.enrolled_videos,
              purchased_ebooks: localUser.purchased_ebooks,
              avatar_url: localUser.avatar_url,
              provider: localUser.provider,
              hasProfile: true
            });
          } else if (isSubscribed) {
            setUser(null);
          }
        } catch (e) {
          console.error("Local session fetch failed:", e);
          if (isSubscribed) {
            setUser(null);
          }
        } finally {
          if (isSubscribed) {
            setIsLoading(false);
          }
        }
      }
    });

    return () => {
      isSubscribed = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("[AuthContext] signIn started for email:", email);
    setIsLoading(true);
    // Prevent the onAuthStateChange listener from triggering concurrent loadProfile calls
    profileLoadingRef.current = true;
    try {
      console.log("[AuthContext] Calling supabase.auth.signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.warn("[AuthContext] Supabase signIn failed:", error.message);
        console.log("[AuthContext] Trying local fallback loginUser...");
        const localRes = await loginUser({ email, password });
        console.log("[AuthContext] local fallback loginUser response:", localRes);
        if (localRes.success && localRes.user) {
          setUser({
            id: localRes.user.id,
            email: localRes.user.email,
            name: localRes.user.name,
            role: localRes.user.role as "Student" | "Admin",
            enrolled_videos: localRes.user.enrolled_videos ?? [],
            purchased_ebooks: localRes.user.purchased_ebooks ?? [],
            avatar_url: localRes.user.avatar_url,
            provider: localRes.user.provider || 'email',
            hasProfile: true
          });
          console.log("[AuthContext] Local fallback sign in successful. User state set.");
          profileLoadingRef.current = false;
          setIsLoading(false);
          return { success: true };
        } else {
          console.warn("[AuthContext] Local fallback sign in failed:", localRes.error);
          profileLoadingRef.current = false;
          setIsLoading(false);
          return { error: localRes.error || error.message };
        }
      }

      console.log("[AuthContext] Supabase signInWithPassword succeeded. data.user:", data.user?.id);
      console.log("[AuthContext] Setting session...");
      setSession(data.session ?? null);

      if (data.user) {
        const role = data.user.user_metadata?.role || 'Student';
        const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
        
        console.log("[AuthContext] Calling createLocalSessionForSupabaseUser...");
        const localSessionRes = await createLocalSessionForSupabaseUser(data.user.id, data.user.email ?? '', name, role);
        console.log("[AuthContext] createLocalSessionForSupabaseUser completed:", localSessionRes);

        console.log("[AuthContext] Starting loadProfile in background...");
        loadProfile(
          data.user.id,
          data.user.email ?? "",
          (data.user.user_metadata?.name as string | undefined) ?? undefined
        ).then(() => {
          console.log("[AuthContext] Background loadProfile resolved successfully");
        }).catch((err) => {
          console.error("[AuthContext] Background loadProfile failed:", err);
        }).finally(() => {
          profileLoadingRef.current = false;
          setIsLoading(false);
          console.log("[AuthContext] Background loadProfile finally completed. isLoading set to false.");
        });
      } else {
        console.log("[AuthContext] No data.user returned from Supabase sign in");
        profileLoadingRef.current = false;
        setIsLoading(false);
      }

      console.log("[AuthContext] signIn returning success: true");
      return { success: true };
    } catch (err: any) {
      console.error("[AuthContext] signIn encountered unexpected error:", err);
      profileLoadingRef.current = false;
      setIsLoading(false);
      return { error: err?.message || "An unexpected error occurred." };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    let localUser: any = null;
    try {
      const localRes = await registerUser({ name, email, password });
      if (localRes.success && localRes.user) {
        localUser = localRes.user;
      }
    } catch (err) {
      console.error("Local JSON registerUser failed:", err);
    }

    if (error) {
      console.warn("Supabase signUp failed, trying local fallback signup:", error.message);
      if (localUser) {
        setUser({
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          role: localUser.role as "Student" | "Admin",
          enrolled_videos: localUser.enrolled_videos ?? [],
          purchased_ebooks: localUser.purchased_ebooks ?? [],
          avatar_url: localUser.avatar_url,
          provider: localUser.provider || 'email',
          hasProfile: true
        });
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { error: error.message };
      }
    }

    // Create a matching profile row (best-effort; RLS must allow insert for anon signups).
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email: email.trim().toLowerCase(),
          role: "Student",
          enrolled_videos: [],
          purchased_ebooks: [],
        });
      } catch (err) {
        console.error("Supabase profiles write failed (can be skipped for dev/E2E):", err);
      }

      try {
        await createLocalSessionForSupabaseUser(data.user.id, email, name, "Student");
      } catch (syncErr) {
        console.error("Local JSON db sync failed on signUp:", syncErr);
      }
      
      // If email confirmation is required, login automatically via the local user state
      if (!data.session && localUser) {
        setUser({
          id: data.user.id,
          email: localUser.email,
          name: localUser.name,
          role: localUser.role as "Student" | "Admin",
          enrolled_videos: localUser.enrolled_videos ?? [],
          purchased_ebooks: localUser.purchased_ebooks ?? [],
          avatar_url: localUser.avatar_url,
          provider: localUser.provider || 'email',
          hasProfile: true
        });
      } else {
        await loadProfile(data.user.id, email, name);
      }
    }

    if (data.session) {
      setSession(data.session);
    }
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    }
    try {
      await logoutUser();
    } catch (err) {
      console.error("Local signOut error:", err);
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const enrollInVideo = async (videoId: string) => {
    if (!user) return { error: "Not authenticated" };
    const next = Array.from(new Set([...(user.enrolled_videos ?? []), videoId]));
    
    // 1. Try local database update first
    let localSuccess = false;
    try {
      const res = await enrollInVideoAction(videoId);
      if (res.success) {
        localSuccess = true;
      }
    } catch (err) {
      console.error("Local video enrollment fallback error:", err);
    }

    // 2. Try Supabase update
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ enrolled_videos: next })
        .eq("id", user.id)
        .select("id,name,role,enrolled_videos,purchased_ebooks")
        .single<ProfileRow>();

      if (!error && data) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                enrolled_videos: data.enrolled_videos ?? [],
              }
            : prev
        );
        return { success: true };
      } else {
        console.warn("Supabase profiles enroll error, using local fallback state:", error?.message);
      }
    } catch (err) {
      console.warn("Supabase profiles enroll exception:", err);
    }

    // If Supabase failed but local succeeded, update user state with next array
    if (localSuccess) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              enrolled_videos: next,
            }
          : prev
      );
      return { success: true };
    }

    return { error: "Failed to enroll in video" };
  };

  const purchaseEbook = async (ebookId: string) => {
    if (!user) return { error: "Not authenticated" };
    const next = Array.from(new Set([...(user.purchased_ebooks ?? []), ebookId]));

    // 1. Try local database update first
    let localSuccess = false;
    try {
      const res = await purchaseEbookAction(ebookId);
      if (res.success) {
        localSuccess = true;
      }
    } catch (err) {
      console.error("Local ebook purchase fallback error:", err);
    }

    // 2. Try Supabase update
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ purchased_ebooks: next })
        .eq("id", user.id)
        .select("id,name,role,enrolled_videos,purchased_ebooks")
        .single<ProfileRow>();

      if (!error && data) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                purchased_ebooks: data.purchased_ebooks ?? [],
              }
            : prev
        );
        return { success: true };
      } else {
        console.warn("Supabase profiles purchase error, using local fallback state:", error?.message);
      }
    } catch (err) {
      console.warn("Supabase profiles purchase exception:", err);
    }

    // If Supabase failed but local succeeded, update user state with next array
    if (localSuccess) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              purchased_ebooks: next,
            }
          : prev
      );
      return { success: true };
    }

    return { error: "Failed to purchase ebook" };
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const getURL = () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          if (
            hostname.includes("localhost") ||
            hostname.includes("127.0.0.1") ||
            hostname.includes("192.168.")
          ) {
            return window.location.origin + "/";
          }
        }
        let url =
          process.env.NEXT_PUBLIC_SITE_URL ??
          'https://rees52.tech/';
        url = url.startsWith('http') ? url : `https://${url}`;
        url = url.endsWith('/') ? url : `${url}/`;
        return url;
      };

      const redirectTo = `${getURL()}auth/callback`;
      console.log("[AuthContext] signInWithGoogle starting. Redirecting to:", redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        console.error("[AuthContext] Google signInWithOAuth failed:", error.message);
        setIsLoading(false);
        return { error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[AuthContext] Google signInWithOAuth encountered error:", err);
      setIsLoading(false);
      return { error: err.message || "An unexpected error occurred." };
    }
  };

  // Redirect to onboarding if authenticated but profile doesn't exist
  useEffect(() => {
    if (user && user.hasProfile === false && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path !== "/onboarding" && path !== "/auth/callback") {
        console.log("[AuthContext] Redirecting to /onboarding because profile does not exist.");
        window.location.href = "/onboarding";
      }
    }
  }, [user]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      enrollInVideo,
      purchaseEbook,
      refreshUser,
      saveProgress: async (cId, pct, lsn) => {
        const res = await saveProgressAction(cId, pct, lsn);
        if (res.success && !res.error) {
          setUser(prev => prev ? { ...prev, progress: res.progress, badges: res.badges } : null);
        }
        return res;
      },
      claimCertificate: async (cId, cName) => {
        const res = await claimCertificateAction(cId, cName);
        if (res.success && !res.error) {
          setUser(prev => prev ? { 
            ...prev, 
            certificates: Array.from(new Set([...(prev.certificates || []), res.certificate])) 
          } : null);
        }
        return res;
      },
      updateStreak: async () => {
        const res = await updateStreakAction();
        if (res.success && !res.error) {
          setUser(prev => prev ? { ...prev, streak: res.streak } : null);
        }
        return res;
      },
      addRecentlyViewed: async (cId) => {
        const res = await addRecentlyViewedAction(cId);
        if (res.success && !res.error) {
          setUser(prev => prev ? { ...prev, recently_viewed: res.recently_viewed } : null);
        }
        return res;
      },
      trackAnalyticsEvent: trackAnalyticsEventAction,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

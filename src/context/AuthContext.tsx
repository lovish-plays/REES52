'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { hasSupabaseEnv } from "@/lib/supabaseConfig";
import type { Session } from "@supabase/supabase-js";
import type { UserProgress, UserCertificate, UserBadge, UserStreak } from "@/lib/db";
import { isTeacherRole, normalizeRole, type AppRole } from "@/lib/auth/roles";
import { sanitizeErrorMessage } from "@/lib/utils";

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
  role: AppRole;
  enrolled_videos: string[];
  purchased_ebooks: string[];
  provider?: string;
  hasProfile?: boolean;
  progress?: Record<string, UserProgress>;
  certificates?: UserCertificate[];
  badges?: UserBadge[];
  streak?: UserStreak | null;
  recently_viewed?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  session: Session | null;
  signIn: (
    email: string,
    password: string,
    portal?: "Student" | "Teacher"
  ) => Promise<{ success?: boolean; error?: string; role?: AppRole }>;
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
  saveProgress: (courseId: string, percentage: number, lastViewedLesson?: string) => Promise<{ success?: boolean; progress?: UserProgress; badges?: UserBadge[]; error?: string }>;
  claimCertificate: (courseId: string, courseName: string) => Promise<{ success?: boolean; certificate?: UserCertificate; error?: string }>;
  updateStreak: () => Promise<{ success?: boolean; streak?: UserStreak; error?: string }>;
  addRecentlyViewed: (courseId: string) => Promise<{ success?: boolean; recently_viewed?: string[]; error?: string }>;
  trackAnalyticsEvent: (eventType: string, eventData: Record<string, unknown>) => Promise<{ success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  enrolled_videos: string[] | null;
  purchased_ebooks: string[] | null;
  provider: string | null;
  progress?: Record<string, UserProgress> | null;
  certificates?: UserCertificate[] | null;
  badges?: UserBadge[] | null;
  streak?: UserStreak | null;
  recently_viewed?: string[] | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const isLoadingProfileRef = React.useRef(false);

  const loadProfile = async (authUserId: string, email: string, fallbackName?: string) => {
    if (isLoadingProfileRef.current) {
      console.log("[AuthContext] loadProfile already in progress. Skipping duplicate call.");
      return;
    }
    isLoadingProfileRef.current = true;
    console.log("[AuthContext] loadProfile started for authUserId:", authUserId);
    
    const startTime = performance.now();
    console.time(`profile-query-${authUserId}`);
    
    try {
      let data: ProfileRow | null = null;
      let error = null;

      try {
        console.log("[AuthContext] Querying Supabase profiles for id:", authUserId);
        console.time(`supabase-db-query-${authUserId}`);
        
        const queryPromise = supabase
          .from("profiles")
          .select("id,name,role,enrolled_videos,purchased_ebooks,provider")
          .eq("id", authUserId)
          .single<ProfileRow>();
          
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Supabase profile query timed out")), 2500)
        );

        const response = await Promise.race([queryPromise, timeoutPromise]);
        data = response.data;
        error = response.error;
        console.timeEnd(`supabase-db-query-${authUserId}`);

        if (error) {
          if (error.message.includes("column") || error.message.includes("provider")) {
            console.log("[AuthContext] Profiles table lacks provider. Retrying query without it.");
            const retryRes = await supabase
              .from("profiles")
              .select("id,name,role,enrolled_videos,purchased_ebooks")
              .eq("id", authUserId)
              .single<Omit<ProfileRow, 'provider'>>();
            if (!retryRes.error) {
              data = {
                ...retryRes.data,
                provider: 'email'
              };
              error = null;
            } else {
              error = retryRes.error;
            }
          }
        }

        console.log("[AuthContext] Supabase profile query finished.");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.timeEnd(`supabase-db-query-${authUserId}`);
        console.warn("[AuthContext] Supabase profile query failed or timed out:", errorMsg);
        error = err instanceof Error ? err : new Error(errorMsg);
      }

      // If client query failed/timed out or returned no profile, fallback to the server action
      if (error || !data) {
        console.log("[AuthContext] Client profile query failed/empty. Trying server action fallback...");
        const fallbackStart = performance.now();
        console.time(`fallback-action-${authUserId}`);
        try {
          const serverUser = await getCurrentUser();
          console.timeEnd(`fallback-action-${authUserId}`);
          const fallbackDur = performance.now() - fallbackStart;
          console.log(`[AuthContext] Fallback query completed in ${fallbackDur.toFixed(2)}ms`);
          
          if (serverUser && serverUser.id === authUserId) {
            console.log("[AuthContext] Profile retrieved via server action fallback.");
            const normalizedRole = normalizeRole(serverUser.role);
            setUser({
              ...serverUser,
              role: normalizedRole
            });
            const totalDur = performance.now() - startTime;
            console.log(`[AuthContext] Total login/profile flow completed in ${totalDur.toFixed(2)}ms (via fallback)`);
            return;
          }
        } catch (serverErr) {
          console.timeEnd(`fallback-action-${authUserId}`);
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
          .single<Omit<ProfileRow, 'provider'>>();

        if (!insertRes.error && insertRes.data) {
          console.log("[AuthContext] Self-healing profile created successfully.");
          data = {
            ...insertRes.data,
            provider: 'email'
          };
        } else if (insertRes.error) {
          console.error("[AuthContext] Self-healing profile creation failed:", insertRes.error.message);
        }
      }

      const role = normalizeRole(data?.role);

      const finalName =
        data?.name?.trim() ||
        fallbackName?.trim() ||
        email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ||
        "Learner";

      const hasProfile = data ? true : (error ? undefined : false);

      console.log("[AuthContext] Setting authenticated user state.");
      setUser({
        id: authUserId,
        email,
        name: finalName,
        role,
        enrolled_videos: data?.enrolled_videos ?? [],
        purchased_ebooks: data?.purchased_ebooks ?? [],
        provider: data?.provider ?? authProvider,
        hasProfile: hasProfile,
        progress: data?.progress ?? {},
        certificates: data?.certificates ?? [],
        badges: data?.badges ?? [],
        streak: data?.streak ?? null,
        recently_viewed: data?.recently_viewed ?? []
      });
      console.log("[AuthContext] User state set successfully in loadProfile. Triggering streak update...");
      
      // Auto-update learning streak
      updateStreakAction().then(res => {
        if (res.success && res.streak) {
          setUser(prev => prev ? { ...prev, streak: res.streak } : null);
        }
      }).catch(err => console.warn("Streak auto-update error:", err));

      const totalDur = performance.now() - startTime;
      console.log(`[AuthContext] Total login/profile flow completed in ${totalDur.toFixed(2)}ms (success)`);

    } catch (e) {
      console.error("[AuthContext] loadProfile encountered unexpected error:", e);
    } finally {
      console.timeEnd(`profile-query-${authUserId}`);
      isLoadingProfileRef.current = false;
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
        setIsLoading(false);
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
    let isSubscribed = true;
    let authEventHandled = false;

    const setFallbackUser = async () => {
      try {
        const localUser = await Promise.race([
          getCurrentUser(),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 2500)),
        ]);

        if (!isSubscribed) return;

        if (localUser) {
          const finalRole = normalizeRole(localUser.role);
          setUser({
            id: localUser.id,
            name: localUser.name,
            email: localUser.email,
            role: finalRole,
            enrolled_videos: localUser.enrolled_videos || [],
            purchased_ebooks: localUser.purchased_ebooks || [],
            provider: localUser.provider,
            hasProfile: true
          });
        } else {
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
    };

    const resolveInitialAuth = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<{ data: { session: null } }>((resolve) =>
            window.setTimeout(() => resolve({ data: { session: null } }), 2500),
          ),
        ]);

        if (!isSubscribed || authEventHandled) return;

        const initialSession = data.session;
        setSession(initialSession ?? null);

        if (initialSession?.user) {
          const u = initialSession.user;
          const authProvider = u.app_metadata?.provider || "email";
          const role: AppRole = "Student";
          const name = u.user_metadata?.name || u.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Learner";

          setUser((prev) => {
            if (prev && prev.id === u.id && prev.hasProfile) {
              return prev;
            }
            return {
              id: u.id,
              email: u.email ?? "",
              name,
              role,
              enrolled_videos: prev?.enrolled_videos ?? [],
              purchased_ebooks: prev?.purchased_ebooks ?? [],
              provider: authProvider,
              hasProfile: prev?.hasProfile
            };
          });
          setIsLoading(false);

          loadProfile(
            u.id,
            u.email ?? "",
            (u.user_metadata?.name as string | undefined) ?? undefined
          );
        } else {
          await setFallbackUser();
        }
      } catch (e) {
        console.error("[AuthContext] Initial auth check failed:", e);
        if (isSubscribed) {
          setSession(null);
          await setFallbackUser();
        }
      }
    };

    // Listen to auth changes (including initial session load)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isSubscribed) return;
      authEventHandled = true;

      console.log("[AuthContext] Authentication state changed:", event);

      if (newSession?.user) {
        const u = newSession.user;
        const authProvider = u.app_metadata?.provider || "email";
        const role: AppRole = "Student";
        const name = u.user_metadata?.name || u.email?.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Learner";

        // Set session and default user state synchronously in one rendering cycle
        setSession(newSession);
        setUser((prev) => {
          if (prev && prev.id === u.id && prev.hasProfile) {
            return prev;
          }
          return {
            id: u.id,
            email: u.email ?? "",
            name: name,
            role: role,
            enrolled_videos: prev?.enrolled_videos ?? [],
            purchased_ebooks: prev?.purchased_ebooks ?? [],
            provider: authProvider,
            hasProfile: prev?.hasProfile
          };
        });
        setIsLoading(false);

        // Load profile in the background
        loadProfile(
          u.id,
          u.email ?? "",
          (u.user_metadata?.name as string | undefined) ?? undefined
        );
      } else {
        setSession(null);
        await setFallbackUser();
      }
    });

    resolveInitialAuth();

    return () => {
      isSubscribed = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, portal: "Student" | "Teacher" = "Student") => {
    console.log("[AuthContext] Sign-in started.");
    const loginStart = performance.now();
    let authenticatedRole: AppRole = "Student";
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
        if (localRes.success && localRes.user) {
          const finalRole = normalizeRole(localRes.user.role);
          if (portal === "Teacher" && !isTeacherRole(finalRole)) {
            await logoutUser();
            profileLoadingRef.current = false;
            setIsLoading(false);
            return { error: "This account has student access. Please use Student login or ask an administrator to assign the Teacher role." };
          }
          setUser({
            id: localRes.user.id,
            email: localRes.user.email,
            name: localRes.user.name,
            role: finalRole,
            enrolled_videos: localRes.user.enrolled_videos ?? [],
            purchased_ebooks: localRes.user.purchased_ebooks ?? [],
            provider: localRes.user.provider || 'email',
            hasProfile: true
          });
          console.log("[AuthContext] Local fallback sign in successful. User state set.");
          profileLoadingRef.current = false;
          setIsLoading(false);
          const loginDuration = performance.now() - loginStart;
          console.log(`[AuthContext] signIn authentication completed in ${loginDuration.toFixed(2)}ms (local fallback)`);
          return { success: true, role: finalRole };
        } else {
          console.warn("[AuthContext] Local fallback sign in failed:", localRes.error);
          profileLoadingRef.current = false;
          setIsLoading(false);
          return { error: sanitizeErrorMessage(localRes.error || error, "Failed to sign in. Please check your credentials.") };
        }
      }

      console.log("[AuthContext] Supabase sign-in succeeded.");
      console.log("[AuthContext] Setting session...");
      setSession(data.session ?? null);

      if (data.user) {
        const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
        
        console.log("[AuthContext] Calling createLocalSessionForSupabaseUser...");
        const localSessionRes = await createLocalSessionForSupabaseUser();
        console.log("[AuthContext] Authenticated profile synchronization completed.");

        if (!localSessionRes.success || !localSessionRes.user) {
          await Promise.all([supabase.auth.signOut(), logoutUser()]);
          setSession(null);
          setUser(null);
          profileLoadingRef.current = false;
          setIsLoading(false);
          return { error: localSessionRes.error || "Unable to load your learning profile." };
        }

        const role = normalizeRole(localSessionRes.user?.role);
        authenticatedRole = role;

        if (portal === "Teacher" && !isTeacherRole(role)) {
          await Promise.all([supabase.auth.signOut(), logoutUser()]);
          setSession(null);
          setUser(null);
          profileLoadingRef.current = false;
          setIsLoading(false);
          return { error: "This account has student access. Please use Student login or ask an administrator to assign the Teacher role." };
        }

        // Update authenticated state immediately so user sees UI change instantly
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          name: name,
          role: role,
          enrolled_videos: [],
          purchased_ebooks: [],
          provider: data.user.app_metadata?.provider || 'email',
          hasProfile: undefined
        });
        setIsLoading(false);

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
          console.log("[AuthContext] Background loadProfile completed.");
        });
      } else {
        console.log("[AuthContext] No data.user returned from Supabase sign in");
        profileLoadingRef.current = false;
        setIsLoading(false);
      }

      const loginDuration = performance.now() - loginStart;
      console.log(`[AuthContext] signIn authentication completed in ${loginDuration.toFixed(2)}ms`);
      return { success: true, role: authenticatedRole };
    } catch (err) {
      console.error("[AuthContext] signIn encountered unexpected error:", err);
      profileLoadingRef.current = false;
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : "An unexpected error occurred." };
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    if (!hasSupabaseEnv) {
      try {
        const localRes = await registerUser({ name, email, password });
        if (localRes.success && localRes.user) {
          const localUser = localRes.user;
          const role = normalizeRole(localUser.role);

          setUser({
            id: localUser.id,
            email: localUser.email,
            name: localUser.name,
            role,
            enrolled_videos: localUser.enrolled_videos ?? [],
            purchased_ebooks: localUser.purchased_ebooks ?? [],
            provider: localUser.provider || 'email',
            hasProfile: true
          });
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { error: localRes.error || "Unable to create account in local mode." };
      } catch (err) {
        console.error("Local JSON registerUser failed:", err);
        setIsLoading(false);
        return { error: err instanceof Error ? err.message : "Failed to create local account." };
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      console.warn("Supabase signUp failed:", error.message);
      setIsLoading(false);
      return { error: sanitizeErrorMessage(error, "Failed to create account. Please check your details and try again.") };
    }

    // Create a matching profile row (best-effort; the database trigger also handles email signups).
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          full_name: name,
          email: email.trim().toLowerCase(),
          role: "Student",
          enrolled_videos: [],
          purchased_ebooks: [],
          provider: data.user.app_metadata?.provider || "email",
        });
      } catch (err) {
        console.error("Supabase profiles write failed (can be skipped for dev/E2E):", err);
      }

      try {
        await createLocalSessionForSupabaseUser();
      } catch (syncErr) {
        console.error("Local JSON db sync failed on signUp:", syncErr);
      }

      if (data.session) {
        setSession(data.session);
        await loadProfile(data.user.id, email, name);
      } else {
        setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          name,
          role: "Student",
          enrolled_videos: [],
          purchased_ebooks: [],
          provider: data.user.app_metadata?.provider || 'email',
          hasProfile: true
        });
      }
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
    if (!hasSupabaseEnv) {
      setIsLoading(false);
      return { error: "Google sign-in is not available in local mode. Please use email and password." };
    }

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
    } catch (err) {
      console.error("[AuthContext] Google signInWithOAuth encountered error:", err);
      setIsLoading(false);
      return { error: err instanceof Error ? err.message : "An unexpected error occurred." };
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
        if (res.success && !res.error && res.progress) {
          setUser(prev => prev ? {
            ...prev,
            progress: {
              ...(prev.progress || {}),
              [cId]: res.progress!
            },
            badges: res.badges ?? prev.badges
          } : null);
        }
        return res;
      },
      claimCertificate: async (cId, cName) => {
        const res = await claimCertificateAction(cId, cName);
        if (res.success && !res.error && res.certificate) {
          setUser(prev => prev ? { 
            ...prev, 
            certificates: prev.certificates?.some(c => c.id === res.certificate!.id)
              ? prev.certificates
              : [...(prev.certificates || []), res.certificate!]
          } : null);
        }
        return res;
      },
      updateStreak: async () => {
        const res = await updateStreakAction();
        if (res.success && !res.error && res.streak) {
          setUser(prev => prev ? { ...prev, streak: res.streak! } : null);
        }
        return res;
      },
      addRecentlyViewed: async (cId) => {
        const res = await addRecentlyViewedAction(cId);
        if (res.success && !res.error && res.recently_viewed) {
          setUser(prev => prev ? { ...prev, recently_viewed: res.recently_viewed! } : null);
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

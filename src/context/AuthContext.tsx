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
  createLocalSessionForSupabaseUser
} from "@/app/actions/auth";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Admin";
  enrolled_videos: string[];
  purchased_ebooks: string[];
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
  signOut: () => Promise<void>;
  enrollInVideo: (videoId: string) => Promise<{ success?: boolean; error?: string }>;
  purchaseEbook: (ebookId: string) => Promise<{ success?: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  enrolled_videos: string[] | null;
  purchased_ebooks: string[] | null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const loadProfile = async (authUserId: string, email: string, fallbackName?: string) => {
    let { data, error } = await supabase
      .from("profiles")
      .select("id,name,role,enrolled_videos,purchased_ebooks")
      .eq("id", authUserId)
      .maybeSingle<ProfileRow>();

    if (error) {
      console.error("Supabase profile read failed:", error.message);
    }

    if (!data && !error) {
      // Self-healing: if the user authenticated successfully but has no profile row, create it
      const role = "Student";
      const name = fallbackName?.trim() || email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Learner";
      
      const { data: newProfile, error: insertError } = await supabase
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
        .maybeSingle<ProfileRow>();

      if (!insertError && newProfile) {
        data = newProfile;
      } else if (insertError) {
        console.error("Self-healing profile creation failed:", insertError.message);
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

    // Supabase is the single source of truth — no local DB sync needed.
    setUser({
      id: authUserId,
      email,
      name: finalName,
      role,
      enrolled_videos: data?.enrolled_videos ?? [],
      purchased_ebooks: data?.purchased_ebooks ?? [],
    });
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
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.warn("Supabase signIn failed, trying local fallback:", error.message);
      try {
        const localRes = await loginUser({ email, password });
        if (localRes.success && localRes.user) {
          setUser({
            id: localRes.user.id,
            email: localRes.user.email,
            name: localRes.user.name,
            role: localRes.user.role as "Student" | "Admin",
            enrolled_videos: localRes.user.enrolled_videos ?? [],
            purchased_ebooks: localRes.user.purchased_ebooks ?? [],
          });
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { error: localRes.error || error.message };
        }
      } catch (err) {
        setIsLoading(false);
        return { error: error.message };
      }
    }

    // ── Fast path ───────────────────────────────────────────────────────────
    // Set the session immediately so the UI can close the modal / redirect
    // right away. Profile loading is handled asynchronously in the
    // onAuthStateChange listener that fires after signInWithPassword resolves.
    setSession(data.session ?? null);

    if (data.user) {
      try {
        const role = data.user.user_metadata?.role || 'Student';
        const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User';
        await createLocalSessionForSupabaseUser(data.user.id, data.user.email ?? '', name, role);
      } catch (syncErr) {
        console.error("Local JSON db sync failed on signIn:", syncErr);
      }

      // Signal to the listener that we are already loading the profile
      profileLoadingRef.current = true;
      // Load profile in the background — do NOT await here
      loadProfile(
        data.user.id,
        data.user.email ?? "",
        (data.user.user_metadata?.name as string | undefined) ?? undefined
      ).finally(() => {
        profileLoadingRef.current = false;
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return { success: true };
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

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signOut,
      enrollInVideo,
      purchaseEbook,
      refreshUser,
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

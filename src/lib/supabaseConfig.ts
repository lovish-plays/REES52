type RuntimeSupabaseConfig = {
  url?: string;
  anonKey?: string;
};

const runtimeConfig =
  typeof window !== "undefined"
    ? (
        window as typeof window & {
          __REES52_SUPABASE__?: RuntimeSupabaseConfig;
        }
      ).__REES52_SUPABASE__
    : undefined;

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? runtimeConfig?.url;

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  runtimeConfig?.anonKey;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const missingSupabaseMessage =
  "Supabase environment variables are missing. The app is using local LMS mock data.";

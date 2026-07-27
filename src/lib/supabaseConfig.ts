export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export const missingSupabaseMessage =
  "Supabase environment variables are missing. The app is using local LMS mock data.";

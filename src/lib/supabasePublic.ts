import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
  );
}

// Public client that does not read or write request cookies.
// Safe for sitemap compilation and static page generation.
export const supabasePublic = createSupabaseClient(supabaseUrl!, supabaseKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

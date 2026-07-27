import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from '@/lib/supabaseConfig';

function createNoopQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    in: () => query,
    is: () => query,
    limit: () => query,
    order: () => query,
    single: async () => ({ data: null, error: new Error("Supabase is not configured.") }),
    maybeSingle: async () => ({ data: null, error: null }),
  };
  return query;
}

function createNoopClient() {
  return {
    from: () => createNoopQuery(),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}

// Public client that does not read or write request cookies.
// Safe for sitemap compilation and static page generation.
export const supabasePublic =
  hasSupabaseEnv && supabaseUrl && supabaseAnonKey
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      })
    : createNoopClient() as unknown as ReturnType<typeof createSupabaseClient>;

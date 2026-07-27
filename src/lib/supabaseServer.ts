import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from "@/lib/supabaseConfig";

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
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      exchangeCodeForSession: async () => ({
        data: { user: null, session: null },
        error: new Error("Supabase is not configured."),
      }),
    },
    from: () => createNoopQuery(),
  };
}

export async function createClient() {
  if (!hasSupabaseEnv || !supabaseUrl || !supabaseAnonKey) {
    return createNoopClient() as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

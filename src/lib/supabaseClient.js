import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createNoopQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    order: () => query,
    single: async () => ({ data: null, error: new Error("Supabase is not configured.") }),
    maybeSingle: async () => ({ data: null, error: null }),
  };
  return query;
}

function createNoopClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      }),
      signInWithPassword: async () => ({ data: {}, error: new Error("Supabase is not configured.") }),
      signUp: async () => ({ data: {}, error: new Error("Supabase is not configured.") }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: {}, error: new Error("Supabase is not configured.") }),
    },
    from: () => createNoopQuery(),
    channel: () => ({
      on() {
        return this;
      },
      subscribe() {
        return this;
      },
    }),
    removeChannel() {},
  };
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createBrowserClient(supabaseUrl, supabaseKey)
    : createNoopClient();

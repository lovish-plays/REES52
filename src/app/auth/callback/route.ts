import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createLocalSessionForSupabaseUser } from '@/app/actions/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log(`[OAuth Callback] GET request received with code: ${code ? 'present' : 'missing'}, next: ${next}`);

  // Create a placeholder redirect response first
  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    
    // Parse cookies from request headers to pass to the supabase client
    const cookieHeader = request.headers.get('cookie') || '';
    const parsedCookies: { name: string; value: string }[] = cookieHeader
      .split(';')
      .map(v => v.split('='))
      .reduce((acc, v) => {
        if (v[0]) {
          acc.push({ name: v[0].trim(), value: v[1] ? v[1].trim() : '' });
        }
        return acc;
      }, [] as { name: string; value: string }[]);

    // 1. Create a Supabase client that writes session cookies directly to the redirectResponse
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return parsedCookies;
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`[OAuth Callback] Setting Supabase cookie: ${name}`);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    console.log("[OAuth Callback] Exchanging code for session...");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("[OAuth Callback] exchangeCodeForSession failed:", error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (!data?.user) {
      console.error("[OAuth Callback] No user returned after code exchange");
      return NextResponse.redirect(`${origin}/login?error=No user found`);
    }

    const user = data.user;
    const session = data.session;
    console.log(`[OAuth Callback] Exchange successful. User ID: ${user.id}, Email: ${user.email}`);
    console.log(`[OAuth Callback] Session details - Access Token: ${session?.access_token ? 'Present' : 'Missing'}, Refresh Token: ${session?.refresh_token ? 'Present' : 'Missing'}`);

    // Query profiles table to see if user has already onboarded
    let { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, name, role, avatar_url, provider')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr && (profileErr.message.includes("column") || profileErr.message.includes("avatar_url"))) {
      console.log("[OAuth Callback] Profiles table lacks avatar_url/provider. Retrying query without them.");
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('id', user.id)
        .maybeSingle();
      profile = retryProfile as any;
    }

    console.log(`[OAuth Callback] Profile lookup result: profile exists = ${!!profile}`);

    if (profile) {
      // User profile already exists. Complete login flow by creating the local session.
      const role = profile.role || 'Student';
      const name = profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
      const provider = profile.provider || user.app_metadata?.provider || 'google';

      console.log(`[OAuth Callback] Profile exists. Creating local session for user: ${user.id}`);
      await createLocalSessionForSupabaseUser(user.id, user.email ?? '', name, role, avatarUrl, provider);
      
      // Since createLocalSessionForSupabaseUser sets 'session' in the Next.js cookies() store,
      // we must copy it to our redirectResponse.
      const cookieStore = await cookies();
      const localSessionToken = cookieStore.get('session')?.value;
      if (localSessionToken) {
        console.log("[OAuth Callback] Copying session token to redirectResponse");
        redirectResponse.cookies.set('session', localSessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7,
          path: '/'
        });
      } else {
        console.warn("[OAuth Callback] Local session token was not found in cookieStore!");
      }
      
      console.log(`[OAuth Callback] Redirecting to: ${origin}${next}`);
      return redirectResponse;
    } else {
      // User profile does not exist yet. Redirect to onboarding!
      console.log("[OAuth Callback] Profile does not exist. Redirecting to onboarding");
      const onboardingResponse = NextResponse.redirect(`${origin}/onboarding`);
      
      // Copy the Supabase session cookies that were set on redirectResponse to onboardingResponse
      redirectResponse.cookies.getAll().forEach(c => {
        onboardingResponse.cookies.set(c.name, c.value, {
          path: c.path,
          domain: c.domain,
          maxAge: c.maxAge,
          expires: c.expires,
          sameSite: c.sameSite,
          secure: c.secure,
          httpOnly: c.httpOnly
        });
      });
      return onboardingResponse;
    }
  }

  console.error("[OAuth Callback] No code provided in query parameters");
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}

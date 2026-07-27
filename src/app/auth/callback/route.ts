import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getRedirectOrigin(requestUrl: string) {
  const urlObj = new URL(requestUrl);
  if (
    urlObj.hostname.includes("localhost") || 
    urlObj.hostname.includes("127.0.0.1") || 
    urlObj.hostname.includes("192.168.")
  ) {
    return urlObj.origin;
  }
  return "https://rees52.tech";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectOrigin = getRedirectOrigin(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  console.log(`[OAuth Callback] GET request received with code: ${code ? 'present' : 'missing'}, next: ${next}`);

  // Create a placeholder redirect response first
  const redirectResponse = NextResponse.redirect(`${redirectOrigin}${next}`);

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    
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
      return NextResponse.redirect(`${redirectOrigin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (!data?.user) {
      console.error("[OAuth Callback] No user returned after code exchange");
      return NextResponse.redirect(`${redirectOrigin}/login?error=No user found`);
    }

    const user = data.user;
    const session = data.session;
    const cleanEmail = user.email?.trim().toLowerCase();
    
    console.log(`[OAuth Callback] Google email detected: ${cleanEmail}`);
    console.log(`[OAuth Callback] Exchange successful. User ID: ${user.id}`);
    console.log(`[OAuth Callback] Session details - Access Token: ${session?.access_token ? 'Present' : 'Missing'}, Refresh Token: ${session?.refresh_token ? 'Present' : 'Missing'}`);

    if (!cleanEmail) {
      console.error("[OAuth Callback] User does not have an email address associated with their account");
      return NextResponse.redirect(`${redirectOrigin}/login?error=Email address is required`);
    }

    // Query profiles table by email instead of auth.uid() to find existing account for linking
    console.log(`[OAuth Callback] Querying profiles table by email: ${cleanEmail}`);
    let { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (profileErr) {
      console.log("[OAuth Callback] Profiles query failed. Retrying with LMS core fields.");
      const { data: retryProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, avatar_url')
        .eq('email', cleanEmail)
        .maybeSingle();
      profile = retryProfile as any;
    }

    console.log(`[OAuth Callback] Existing profile found: ${profile ? 'Yes' : 'No'}`);

    if (profile) {
      console.log(`[OAuth Callback] Existing profile details - ID: ${profile.id}, Provider: ${profile.provider}`);
      
      // If the existing profile has a different ID, link them!
      if (profile.id !== user.id) {
        console.log(`[OAuth Callback] Linking Google account ${user.id} to existing profile ${profile.id} with email ${cleanEmail}`);
        
        // 1. Insert/upsert new profile row with the new user.id, copying all data
        let { error: linkError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: profile.full_name || profile.name || user.user_metadata?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: profile.role?.toLowerCase() === 'admin' ? 'admin' : 'student',
          });

        if (linkError) {
          console.error("[OAuth Callback] Upsert failed with new columns. Retrying link with core fields.");
          const { error: coreLinkError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name: profile.name || profile.full_name || user.user_metadata?.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              role: profile.role || 'Student',
              enrolled_videos: profile.enrolled_videos || [],
              purchased_ebooks: profile.purchased_ebooks || [],
              provider: 'google'
            });
          linkError = coreLinkError;
        }

        if (linkError) {
          console.error("[OAuth Callback] Failed to insert/upsert linked profile:", linkError.message);
        } else {
          console.log("[OAuth Callback] Linked profile created successfully. Deleting old profile: " + profile.id);
          
          // 2. Delete the old profile row to prevent duplicate profile rows
          const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);
          
          if (deleteError) {
            console.error("[OAuth Callback] Failed to delete old profile:", deleteError.message);
          } else {
            console.log("[OAuth Callback] Account linked successfully and old profile deleted.");
          }
        }
      } else {
        // If IDs match, just make sure the provider is set to google/linked (or update details)
        console.log(`[OAuth Callback] Profiles IDs match. Updating provider to google.`);
        await supabase
          .from('profiles')
          .update({ provider: 'google' })
          .eq('id', user.id);
      }

      // Supabase session cookies are the only production identity token.
      console.log(`[OAuth Callback] Redirecting to: ${redirectOrigin}${next}`);
      return redirectResponse;
    } else {
      // User profile does not exist yet. Redirect to onboarding!
      console.log("[OAuth Callback] Profile does not exist. Redirecting to onboarding");
      const onboardingResponse = NextResponse.redirect(`${redirectOrigin}/onboarding`);
      
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
  return NextResponse.redirect(`${redirectOrigin}/login?error=Authentication failed`);
}

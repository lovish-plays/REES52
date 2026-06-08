import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { createLocalSessionForSupabaseUser } from '@/app/actions/auth';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;
      
      // Query profiles table to see if user has already onboarded
      let { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url, provider')
        .eq('id', user.id)
        .maybeSingle();

      if (profileErr && (profileErr.message.includes("column") || profileErr.message.includes("avatar_url"))) {
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('id', user.id)
          .maybeSingle();
        profile = retryProfile as any;
      }

      if (profile) {
        // User profile already exists. Complete login flow by creating the local session.
        const role = profile.role || 'Student';
        const name = profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const avatarUrl = profile.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const provider = profile.provider || user.app_metadata?.provider || 'google';

        await createLocalSessionForSupabaseUser(user.id, user.email ?? '', name, role, avatarUrl, provider);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // User profile does not exist yet. Redirect to onboarding!
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}

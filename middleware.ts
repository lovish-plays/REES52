import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1];
    const pad = 4 - (payload.length % 4);
    if (pad < 4) {
      payload += '='.repeat(pad);
    }
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. Refresh Supabase session token
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  // 2. Validate local fallback session token if present
  let hasLocalSession = false;
  const localSession = request.cookies.get("session")?.value;
  if (localSession) {
    const payload = decodeJwtPayload(localSession);
    if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
      hasLocalSession = true;
    }
  }

  const isAuthenticated = !!supabaseUser || hasLocalSession;

  const { pathname } = request.nextUrl;

  // Exclude API routes from redirect checks
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  const isLoginPage = pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    if (pathname !== "/") {
      redirectUrl.searchParams.set("redirect_to", pathname + request.nextUrl.search);
    }
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (isAuthenticated && isLoginPage) {
    const redirectTo = request.nextUrl.searchParams.get("redirect_to") || "/";
    const redirectUrl = new URL(redirectTo, request.url);
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any png, jpg, jpeg, gif, svg, webp (image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

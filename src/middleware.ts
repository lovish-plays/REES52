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

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google; " +
    "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com; " +
    "img-src 'self' data: https://*.youtube.com https://img.youtube.com https://*.rees52.com https://*.google-analytics.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com https://tpc.googlesyndication.com; " +
    "media-src 'self'; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "frame-src 'self' https://*.youtube.com https://www.youtube.com https://*.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google;"
  );
  return response;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return addSecurityHeaders(supabaseResponse);
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

  // Exclude API routes and public metadata assets (ads.txt, robots.txt, sitemap.xml) from redirect checks
  if (
    pathname === "/ads.txt" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/api")
  ) {
    return addSecurityHeaders(supabaseResponse);
  }

  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";
  const isInformationalPage = ["/about", "/contact", "/privacy", "/terms", "/cookie-policy"].includes(pathname);

  if (!isAuthenticated && !isLoginPage && !isHomePage && !isInformationalPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect_to", pathname + request.nextUrl.search);
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return addSecurityHeaders(redirectResponse);
  }

  if (isAuthenticated && isLoginPage) {
    const redirectTo = request.nextUrl.searchParams.get("redirect_to") || "/";
    const redirectUrl = new URL(redirectTo, request.url);
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return addSecurityHeaders(redirectResponse);
  }

  return addSecurityHeaders(supabaseResponse);
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

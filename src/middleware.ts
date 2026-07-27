import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { decodeOpaquePath, opaquePathFor } from "@/lib/opaque-route";

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
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleadservices.com https://*.googleadservices.com; " +
    "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleadservices.com https://*.googleadservices.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com; " +
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googlesyndication.com; " +
    "img-src 'self' data: https://*.youtube.com https://img.youtube.com https://*.rees52.com https://*.google-analytics.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com https://tpc.googlesyndication.com https://*.adtrafficquality.google https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleadservices.com https://*.googleadservices.com; " +
    "media-src 'self'; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleadservices.com https://*.googleadservices.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "frame-src 'self' https://*.youtube.com https://www.youtube.com https://*.google.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.adtrafficquality.google https://adtrafficquality.google https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://googleadservices.com https://*.googleadservices.com;"
  );
  return response;
}

const publicPaths = new Set([
  "/",
  "/login",
  "/ads.txt",
  "/robots.txt",
  "/sitemap.xml",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/auth/callback",
]);
const canonicalOrigin = (process.env.NEXT_PUBLIC_SITE_URL || "https://rees52.tech").replace(/\/$/, "");

function isPublicPath(pathname: string) {
  return publicPaths.has(pathname) || [
    "/courses",
    "/projects",
    "/ebooks",
    "/videos",
    "/learn",
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function shouldMaskPath(pathname: string) {
  return (
    !isPublicPath(pathname) &&
    pathname !== "/ads.txt" &&
    pathname !== "/robots.txt" &&
    pathname !== "/sitemap.xml" &&
    pathname !== "/auth/callback" &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next")
  );
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  return target;
}

function rewriteOpaquePath(request: NextRequest, response: NextResponse, pathname: string, search: string) {
  const targetUrl = new URL(`${pathname}${search}`, request.url);
  return addSecurityHeaders(copyResponseCookies(response, NextResponse.rewrite(targetUrl, { request })));
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname: originalPathname } = request.nextUrl;
  const opaqueToken = originalPathname.startsWith("/r/")
    ? originalPathname.slice(3).split("/")[0]
    : null;
  const decodedOpaquePath = opaqueToken ? decodeOpaquePath(opaqueToken) : null;
  const isOpaqueRequest = Boolean(opaqueToken);
  const effectiveUrl = decodedOpaquePath ? new URL(decodedOpaquePath, request.url) : null;
  const pathname = effectiveUrl?.pathname || originalPathname;
  const search = effectiveUrl?.search || request.nextUrl.search;

  if (isOpaqueRequest && !decodedOpaquePath) {
    return addSecurityHeaders(NextResponse.rewrite(new URL("/_not-found", request.url), { request }));
  }

  if (
    host.includes("rees-52.vercel.app") ||
    (host.endsWith(".vercel.app") && 
     !host.includes("localhost") && 
     !host.includes("127.0.0.1") && 
     !host.includes("192.168."))
  ) {
    const targetUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, canonicalOrigin);
    return addSecurityHeaders(NextResponse.redirect(targetUrl, { status: 301 }));
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV === "production" && !isPublicPath(pathname)) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: "Authentication service is not configured." },
          { status: 503 }
        )
      );
    }

    if (request.method === "GET" && !request.headers.has("next-action")) {
      if (isOpaqueRequest) {
        return rewriteOpaquePath(request, supabaseResponse, pathname, search);
      }
      if (shouldMaskPath(pathname)) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = opaquePathFor(pathname, request.nextUrl.search);
        redirectUrl.search = "";
        return addSecurityHeaders(NextResponse.redirect(redirectUrl, { status: 307 }));
      }
    }

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

  // Refresh and verify the Supabase session. Local development sessions are
  // intentionally never accepted as production route-gating credentials.
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  const isAuthenticated = !!supabaseUser;

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

  // Skip page redirect logic for Server Actions and non-GET requests
  if (request.method !== "GET" || request.headers.has("next-action")) {
    return addSecurityHeaders(supabaseResponse);
  }

  if (!isAuthenticated && !isLoginPage && !isHomePage && !isInformationalPage && !isPublicPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect_to", pathname + search);
    
    // Normalize domain for production redirect
    const redirectHost = redirectUrl.hostname;
    if (
      !redirectHost.includes("localhost") &&
      !redirectHost.includes("127.0.0.1") &&
      !redirectHost.includes("192.168.")
    ) {
      redirectUrl.protocol = new URL(canonicalOrigin).protocol;
      redirectUrl.host = new URL(canonicalOrigin).host;
    }
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return addSecurityHeaders(redirectResponse);
  }

  if (isAuthenticated && isLoginPage) {
    const redirectTo = new URLSearchParams(search).get("redirect_to") || "/";
    const redirectUrl = new URL(redirectTo, request.url);
    
    // Normalize domain for production redirect
    const redirectHost = redirectUrl.hostname;
    if (
      !redirectHost.includes("localhost") &&
      !redirectHost.includes("127.0.0.1") &&
      !redirectHost.includes("192.168.")
    ) {
      redirectUrl.protocol = new URL(canonicalOrigin).protocol;
      redirectUrl.host = new URL(canonicalOrigin).host;
    }
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Copy updated cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return addSecurityHeaders(redirectResponse);
  }

  if (isOpaqueRequest) {
    return rewriteOpaquePath(request, supabaseResponse, pathname, search);
  }

  if (shouldMaskPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = opaquePathFor(pathname, request.nextUrl.search);
    redirectUrl.search = "";
    return addSecurityHeaders(NextResponse.redirect(redirectUrl, { status: 307 }));
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

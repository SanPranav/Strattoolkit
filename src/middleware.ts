import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

import { getSBServerClient } from "./lib/supabase/sbServer";
import { UserRole } from "./lib/types/rbac";
import {
  checkPermissionsForRoute,
  syncRoutePermissionsWithTTL
} from "./lib/rbac/routePermissions";
import { logger } from "./lib/logger";
import { sanitizePathname } from "./lib/utils";

export async function middleware(request: NextRequest) {
  const originalPath = request.nextUrl.pathname;
  const segments = originalPath.split("/").filter(Boolean);

  if (originalPath.startsWith("/ph")) {
    return posthogMiddleware(request);
  }

  // Sync route permissions from feature flag (with TTL to avoid excessive calls)
  // Non-blocking: silently fail if PostHog API key is not configured
  syncRoutePermissionsWithTTL().catch((error) => {
    logger.warn({ error }, "[Middleware] Failed to sync route permissions from feature flag. Using default permissions.");
  });

  let response = NextResponse.next({
    request
  });

  const supabase = getSBServerClient({
    getAll: () => {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) =>
        request.cookies.set(name, value)
      );
      response = NextResponse.next({
        request
      });
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
    }
  });

  if (!segments || !segments.length) {
    return response;
  }

  let role: UserRole = "guest";

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: userData } = await supabase
      .from("UserData")
      .select("user_role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userData) {
      role = userData.user_role;
    }
  }

  logger.debug(
    {
      requestUrl: request.url,
      nextUrl: response.url,
      role,
      userId: user?.id || "Unknown ID"
    },
    "[Middleware] Resolved request role"
  );

  let hasPermission = true;
  try {
    hasPermission = await checkPermissionsForRoute(originalPath, role);
  } catch (error) {
    logger.warn(
      { error, path: originalPath },
      "[Middleware] Failed to check route permissions (missing SUPABASE_SERVICE_KEY?). Allowing access with public permissions only."
    );
    // If permission check fails (e.g., missing service key), allow access only if no role is required
    hasPermission = !role || role === "public";
  }

  logger.debug(
    {
      path: originalPath,
      role,
      allowed: hasPermission
    },
    "[Middleware] Permission evaluation result"
  );

  if (!hasPermission) {
    if (user?.id) {
      logger.debug(
        { path: originalPath, role, userId: user.id },
        "[Middleware] Authenticated user lacks permissions, redirecting"
      );
      return mwRedirect(response, request.nextUrl.clone(), "/unauthorized", {
        next: originalPath
      });
    }

    logger.debug(
      { path: originalPath },
      "[Middleware] Guest user requires login, redirecting"
    );

    const next = sanitizePathname(request.nextUrl.pathname);

    return mwRedirect(response, request.nextUrl.clone(), "/auth/login", {
      next
    });
  }

  return response;
}

function mwRedirect(
  response: NextResponse,
  url: URL,
  pathname: string,
  params: Record<string, string>
) {
  if (pathname === url.pathname) {
    return response;
  }

  const searchParams = new URLSearchParams(params);
  const redirectUrl = new URL(pathname, url);
  redirectUrl.search = searchParams.toString();

  const redirect = NextResponse.redirect(redirectUrl);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  return redirect;
}

function posthogMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.pathname.startsWith("/ph/static/")
    ? "us-assets.i.posthog.com"
    : "us.i.posthog.com";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("host", hostname);

  url.protocol = "https";
  url.hostname = hostname;
  url.port = "443";
  url.pathname = url.pathname.replace(/^\/ph/, "");

  return NextResponse.rewrite(url, {
    headers: requestHeaders
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth (authentication pages)
     * - info (information pages)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static assets (e.g., favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|auth|info|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
} satisfies MiddlewareConfig;

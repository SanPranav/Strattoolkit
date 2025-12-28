import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

import { hasPermission } from "./lib/rbac/rbac";
import { getSBServerClient } from "./lib/supabase/sbServer";
import { UserRole } from "./lib/types/rbac";
import { getRequiredPermissionsForRoute } from "./lib/rbac/routePermissions";
import { ensureRoutePermissionsInitialized } from "./lib/rbac/routePermissionsInit";
import { logger } from "./lib/logger";

export async function middleware(request: NextRequest) {
  const originalPath = request.nextUrl.pathname;
  const segments = originalPath.split("/").filter(Boolean);

  if (originalPath.startsWith("/ph")) {
    return posthogMiddleware(request);
  }

  await ensureRoutePermissionsInitialized();

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

  const requiredPermissions = await getRequiredPermissionsForRoute(segments);

  if (!requiredPermissions) {
    logger.debug({ path: originalPath }, "[Middleware] No RBAC for route");
    return response;
  }

  const hasAllRequiredPermissions = await Promise.all(
    requiredPermissions.map((permission) =>
      hasPermission(role, permission, supabase)
    )
  ).then((results) => results.every(Boolean));

  logger.debug(
    {
      path: originalPath,
      role,
      requiredPermissions,
      allowed: hasAllRequiredPermissions
    },
    "[Middleware] Permission evaluation result"
  );

  if (!hasAllRequiredPermissions) {
    if (user?.id) {
      logger.debug(
        { path: originalPath, role, userId: user.id },
        "[Middleware] Authenticated user lacks permissions, redirecting"
      );
      return mwRedirect(response, request.nextUrl.clone(), "/unauthorized", {
        page: originalPath
      });
    }

    logger.debug(
      { path: originalPath },
      "[Middleware] Guest user requires login, redirecting"
    );

    return mwRedirect(response, request.nextUrl.clone(), "/auth/login", {
      next: request.nextUrl.pathname
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

import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

import { hasPermission } from "./lib/permissions";
import { getDisabledPages, runFlag } from "./lib/flags";
import { getSBServerClient } from "./lib/supabase/sbServer";
import { UserData } from "./lib/types/db";

const ROUTE_PERMISSIONS: Partial<
  Record<string, Parameters<typeof hasPermission>[1]>
> = {
  outreach: "outreach:view",
  scouting: "scouting:view",
  settings: "settings:view"
};

const FLAG_EXEMPT_PAGES = new Set(["settings"]);

export async function middleware(request: NextRequest) {
  const originalPath = request.nextUrl.pathname;
  const segments = originalPath.split("/").filter(Boolean);
  const page = segments.at(0);

  if (originalPath.startsWith("/ph")) {
    return postHogMiddleware(request);
  }

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

  const claims = await supabase.auth.getClaims();

  if (!page) {
    return response;
  }

  let role: UserData["role"] = "guest";
  let userId: string | undefined;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    userId = user.id;

    const { data: userData } = await supabase
      .from("UserData")
      .select("role")
      .eq("user", user.id)
      .limit(1)
      .single();

    if (userData) {
      role = userData.role;
    }
  }

  const disabled = await getDisabledPages(role);
  if (!disabled) return response;

  if (disabled.includes(page)) {
    return mwRedirect(response, request.nextUrl.clone(), "/disabled", {
      page: originalPath,
      reason: "page_disabled"
    });
  }

  const requiredPermission = ROUTE_PERMISSIONS[page];
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    if (user?.id) {
      return mwRedirect(response, request.nextUrl.clone(), "/unauthorized", {
        page: originalPath
      });
    }

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

function postHogMiddleware(request: NextRequest) {
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

import { NextResponse } from "next/server";
import { getSBServerClientWithNextJSCookies } from "@/lib/supabase/sbServer";
import { buildURL, sanitizePathname } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin, protocol } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizePathname(searchParams.get("next") || "/");

  if (code) {
    const supabase = await getSBServerClientWithNextJSCookies();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer (if any)
      return NextResponse.redirect(
        `${protocol || "https:"}//${forwardedHost || origin}${next}`
      );
    }
  }

  // return the user to an error page with instructions
  const redirectUrl = buildURL("/error", origin, {
    message: "Authentication Failed. Please try again later.",
    next
  });

  return NextResponse.redirect(redirectUrl.toString());
}

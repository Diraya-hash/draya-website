import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n";
import { isSupabaseConfigured } from "./lib/supabase/env";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // Redirect locale-less paths to the default locale (Arabic).
  if (!pathnameHasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Locale is present. Refresh the auth session when Supabase is configured;
  // otherwise pass through unchanged so the app still runs without env.
  const response = NextResponse.next({ request });
  if (isSupabaseConfigured()) {
    return updateSession(request, response);
  }
  return response;
}

export const config = {
  // Skip Next internals, API routes, the /auth callback, and static files.
  matcher: ["/((?!_next|api|auth|.*\\..*).*)"],
};

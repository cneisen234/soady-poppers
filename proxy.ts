// Proxy (Next.js 16's renamed Middleware) — runs on the Edge before admin routes.
//
// This is an OPTIMISTIC gate only: it redirects unauthenticated visitors to the
// login page for a clean UX, and bounces signed-in admins away from the login
// page. The authoritative check lives in requireAdmin() (lib/auth/dal.ts), which
// every admin page and action calls. Keep this file Edge-safe: it may only import
// the jose-based verify (no next/headers, no bcrypt, no db).

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // The login page: send already-authenticated admins to the dashboard.
  if (pathname === "/admin/login") {
    return authed
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  // Everything else under the matcher requires a session.
  if (!authed) {
    // API calls get a 401; pages get redirected to login.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

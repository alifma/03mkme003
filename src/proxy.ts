import { NextResponse } from "next/server";
import { auth } from "@/features/auth/config";

// Route-level gate only: redirects unauthenticated visitors away from
// /dashboard. This is NOT where authorization happens — Server Actions and
// route handlers must still call requirePermission()/assertPermission()
// themselves (see features/rbac/guard.ts). Next.js doesn't treat Server
// Functions as separate routes, so a matcher change here can silently stop
// covering one; defense-in-depth in the action itself is what actually
// protects the data.
const PROTECTED_PREFIX = "/dashboard";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected =
    pathname === PROTECTED_PREFIX ||
    pathname.startsWith(`${PROTECTED_PREFIX}/`);

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

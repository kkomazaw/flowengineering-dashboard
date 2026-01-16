import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";

/**
 * Middleware for protecting routes
 * This runs before every request to check authentication
 */
export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ["/auth/signin", "/api/auth"];

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If trying to access protected route without session, redirect to signin
  if (!isPublicPath && !session) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If already signed in and trying to access signin page, redirect to home
  if (pathname === "/auth/signin" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};

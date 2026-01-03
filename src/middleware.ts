import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Public routes that don't need auth
  const publicRoutes = ["/sign-in"];
  const isPublicRoute = publicRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for token
  const token = req.cookies.get("token");

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Allow access if token exists
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

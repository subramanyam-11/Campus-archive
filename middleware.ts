import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that do not require authentication
const PUBLIC_PATHS = ['/sign-in', '/verify', '/favicon.ico', '/_next'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, verify endpoint, and sign-in page
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Root redirect to dashboard (or portal default)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // In Next.js client-side Firebase Auth, the token or session cookie is checked.
  // Next.js passes through to client layouts which enforce role guards via AuthContext.
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

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * NextJS middleware function
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const cookieStore = await cookies();
  if (!cookieStore.get('refresh_token')) {
    // Optional redirect to login/auth
    if (pathname !== '/login') {
      return NextResponse.redirect(
        new URL(
          `/login?next=${encodeURI(request.nextUrl.href)}`,
          request.nextUrl.origin
        )
      );
    }

    return NextResponse.next();
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /api (API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - paths that contain a dot (e.g., public assets like .png, .jpg, .css, .js)
     * - /login (your specific login route)
     * - /another-excluded-route
     * - /admin (example of an entire segment to exclude)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

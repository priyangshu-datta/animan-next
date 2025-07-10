import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { PUBLIC_PATH } from './lib/constants';

/**
 * NextJS middleware function
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const cookieStore = await cookies();

  const accessingPublicRoute = PUBLIC_PATH.includes(pathname);
  const localSessionExists = !!cookieStore.get('refresh_token');

  if (!localSessionExists) {
    if (!accessingPublicRoute) {
      return NextResponse.redirect(
        new URL(
          `/login?next=${encodeURI(request.nextUrl.href)}`,
          request.nextUrl.origin
        )
      );
    }
    return NextResponse.next();
  }

  if (accessingPublicRoute) {
    return NextResponse.redirect(new URL('/home', request.nextUrl.origin));
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

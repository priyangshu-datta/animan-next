import { NextRequest, NextResponse } from 'next/server';

/**
 * NextJS middleware function
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export function middleware(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Optional redirect to login/auth
    return new NextResponse(null, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/anilist/:path*', '/api/mal/:path*', '/api/notes/:path*'],
};

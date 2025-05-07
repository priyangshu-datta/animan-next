import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import * as arctic from 'arctic';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * @param {import("next/server").NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  const cookieStore = await cookies();

  const mal = new arctic.MyAnimeList(
    process.env.MAL_CLIENT_ID,
    process.env.MAL_CLIENT_SECRET,
    process.env.MAL_CALLBACK_URL
  );

  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const url = mal.createAuthorizationURL(state, codeVerifier);

  cookieStore.set({
    name: 'state',
    value: state,
    secure: false, // set to false in localhost
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  cookieStore.set({
    name: 'code_verifier',
    value: codeVerifier,
    secure: false, // set to false in localhost
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return NextResponse.redirect(url);
}

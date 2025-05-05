import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/index';
import { createSessionAndReturnTokenResponse } from '@/lib/server/auth/create_session';
import axios from 'axios';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils';

/**
 * All these take place in a popup
 *
 * This is the soul of auth system in AniMan. This handles whether session should renew or redirect to login
 *
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
async function AuthSoul(request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token');
  const provider = request.nextUrl.searchParams.get('provider');

  if (!provider) {
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  /**
   * as there is no refresh token, in provider auth logic, remember to
   * delete the previous all sessions after user authenticates
   */
  if (!refreshToken) {
    return NextResponse.redirect(
      new URL(`/api/auth/${provider}`, process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  let dbSession = await db('sessions')
    .where('refresh_token', refreshToken.value)
    .first();

  if (!dbSession) {
    return NextResponse.redirect(
      new URL(`/api/auth/${provider}`, process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  dbSession = snakeKeysToCamelKeys(dbSession);
  if (await shouldRedirectToProviderAuth(provider, dbSession.userId)) {
    return NextResponse.redirect(
      new URL(`/api/auth/${provider}`, process.env.NEXT_PUBLIC_APP_URL)
    );
  }

  let oldSession = await db('sessions')
    .where('refresh_token', refreshToken.value)
    .andWhere('expires_at', '>', new Date())
    .del();

  try {
    if (oldSession < 1) {
      throw new AppError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Something went horribly wrong',
        details:
          'This should not happen as, at line 40, we check for its existence',
        status: 500,
      });
    }

    oldSession = snakeKeysToCamelKeys(oldSession);

    return await createSessionAndReturnTokenResponse(
      {
        userId: dbSession.userId,
        timesRotated: dbSession.timesRotated,
      },
      cookieStore,
      true
    );
  } catch (err) {
    return respondError(err);
  }
}

/**
 * Checks if the user needs to be redirected to the provider's authentication flow.
 * This is based on whether their current session is expired or, in the case of MAL,
 * if the refresh token can no longer be used.
 *
 * @async
 * @function shouldRedirectToProviderAuth
 * @param {string} provider - The name of the OAuth provider (e.g., "mal", "anilist").
 * @param {string} userId - The user's unique identifier in the database.
 * @returns {Promise<boolean>} - Returns `true` if the user should be redirected to reauthenticate.
 */
async function shouldRedirectToProviderAuth(provider, userId) {
  let providerSession = await db('oauth_accounts')
    .where('user_id', userId)
    .andWhere('provider', provider)
    .andWhere('refresh_token_expiration', '>', new Date())
    .first();

  // No valid session found — reauthentication needed
  if (!providerSession) {
    return true;
  }

  providerSession = snakeKeysToCamelKeys(providerSession);

  /**
   * MyAnimeList (MAL) supports token refreshing via its refresh token mechanism.
   * If the refresh token is still valid, a new access token can be obtained.
   *
   * AniList does not implement token rotation in the same way. Both access and refresh tokens
   * expire after 1 year — at the same time. Therefore, if the refresh token is expired,
   * the access token will be too. No refresh logic is needed for AniList — the user must reauthenticate.
   */
  if (provider === 'mal') {
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/mal/refresh',
        {
          refreshToken: providerSession.refreshToken,
        }
      );

      if (response.status !== 200) {
        return true; // Refresh failed
      }
    } catch (error) {
      throw new AppError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Something went wrong, please contact the Developer',
        details: {
          error,
        },
      });
    }
  }

  return false; // All good, no redirect needed
}

export const GET = AuthSoul;

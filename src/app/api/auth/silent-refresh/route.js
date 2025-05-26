import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/index';
import { createSessionAndReturnTokenResponse } from '@/lib/server/auth/create_session';
import axios from 'axios';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';

/**
 * All these take place in a popup
 *
 * This is the soul of auth system in AniMan. This handles whether session should renew or redirect to login
 *
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
async function AuthRefreshFlow() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token');

    if (!refreshToken) {
      throw new AppError({
        code: ERROR_CODES.NO_REFRESH_TOKEN,
        status: 401,
        message: 'No refresh token found on client cookies. Try fresh login.',
      });
    }

    const refreshTokenQuery = db('sessions').where(
      'refresh_token',
      refreshToken.value
    );

    let dbSession = await refreshTokenQuery.first();

    if (!dbSession) {
      throw new AppError({
        code: ERROR_CODES.NO_REFRESH_TOKEN,
        status: 401,
        message: 'No session found on server. Try fresh login.',
      });
    }

    dbSession = snakeKeysToCamelKeys(dbSession);

    // await shouldTryFreshLogin(provider, dbSession.userId);

    // delete old sessions and issue new tokens, as provider tokens are valid
    await refreshTokenQuery.del();

    return await createSessionAndReturnTokenResponse(
      {
        userId: dbSession.userId,
        timesRotated: dbSession.timesRotated,
      },
      true,
      'iframe'
    );
  } catch (err) {
    console.error({ err });
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
async function shouldTryFreshLogin(provider, userId) {
  let providerSession = await db('oauth_accounts')
    .where('user_id', userId)
    .andWhere('provider', provider)
    .andWhere('refresh_token_expiration', '>', new Date())
    .first();

  // No valid session found — reauthentication needed
  if (!providerSession) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Something went horribly wrong',
      status: 401,
    });
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
    const response = await axios.post(
      'http://localhost:3000/api/auth/mal/refresh',
      {
        malRefreshToken: providerSession.refreshToken,
      }
    );

    if (response.status !== 200) {
      throw new AppError({
        code: ERROR_CODES.MAL_ERROR,
        message: 'Something went wrong, try fresh login.',
        details: 'MAL Refresh Flow failed',
        status: 401,
      });
    }
  }

  // All good, no redirect needed
}

export const GET = AuthRefreshFlow;

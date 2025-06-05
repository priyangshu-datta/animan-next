import db from '@/db/index';
import { QUARTER_HOUR_IN_MS, HOUR_IN_MS, MONTH_IN_MS } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import * as arctic from 'arctic';
import { NextResponse } from 'next/server';

/**
 *
 * @param {import("next/server").NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const { malRefreshToken } = await request.json();

    if (!malRefreshToken) {
      // as there is no refresh token, in provider auth logic, remember to
      // delete the previous all sessions after user authenticates

      console.error('No refresh token was sent');

      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'No refresh token was sent',
        status: 400,
      });
    }

    const malClient = new arctic.MyAnimeList(
      process.env.MAL_CLIENT_ID,
      process.env.MAL_CLIENT_SECRET,
      process.env.MAL_CALLBACK_URL
    );

    const tokens = await malClient.refreshAccessToken(malRefreshToken);
    const malNewAccessToken = tokens.accessToken();
    const malNewRefreshToken = tokens.refreshToken();

    const updatedSession = await db('oauth_accounts')
      .where('refresh_token', malRefreshToken)
      .andWhere('provider', 'mal')
      .update(
        camelKeysToSnakeKeys({
          accessToken: malNewAccessToken,
          refreshToken: malNewRefreshToken,
          accessTokenExpiration: new Date(
            Date.now() + HOUR_IN_MS - QUARTER_HOUR_IN_MS
          ),
          refreshTokenExpiration: new Date(
            Date.now() + MONTH_IN_MS - QUARTER_HOUR_IN_MS
          ),
        })
      )
      .returning('id');

    if (updatedSession.length < 1) {
      throw new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Something went wrong re-newing session',
        status: 500,
      });
    }
    return respondSuccess(null);
  } catch (e) {
    handleError(e);
  }
}

/**
 *
 * @param {any} err
 * @returns {NextResponse}
 */
function handleError(err) {
  try {
    if (err instanceof arctic.OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI

      throw new AppError({
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
    }
    if (err instanceof arctic.ArcticFetchError) {
      // Failed to call `fetch()`

      throw new AppError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: err.message,
        stack: err.stack,
      });
    }

    throw new AppError({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Something went wrong',
      details: { description: 'Token parsing error', error: err },
      status: 500,
    });
  } catch (_err) {
    return respondError(_err);
  }
}

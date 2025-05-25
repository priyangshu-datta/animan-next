import db from '@/db/index';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import {
  buildTokenResponse,
  createNewUserWithOAuth,
  createSessionAndReturnTokenResponse,
  handleError,
} from '@/utils/auth';
import { snakeKeysToCamelKeys } from '@/utils/general';
import * as arctic from 'arctic';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const malClient = new arctic.MyAnimeList(
      process.env.MAL_CLIENT_ID,
      process.env.MAL_CLIENT_SECRET,
      process.env.MAL_CALLBACK_URL
    );

    const cookieStore = await cookies();

    const codeVerifier = cookieStore.get('code_verifier').value;
    const tokens = await malClient.validateAuthorizationCode(
      code,
      codeVerifier
    );
    const malAccessToken = tokens.accessToken();
    const malRefreshToken = tokens.refreshToken();

    let linkUserId = cookieStore.get('link_user_id');

    if (linkUserId) {
      const animanUser = await db('users')
        .where('id', linkUserId.value)
        .first();
      if (!animanUser) {
        linkUserId = null;
      }
    }

    const myAnimeListUser = await getMyAnimeListUserInfo(malAccessToken);

    let existingOAuth = await db('oauth_accounts')
      .where('provider_user_id', myAnimeListUser.id)
      .first();

    let userId;

    if (existingOAuth) {
      existingOAuth = snakeKeysToCamelKeys(existingOAuth);
      userId = existingOAuth.userId;
    } else {
      userId = await createNewUserWithOAuth(
        linkUserId.value,
        myAnimeListUser.name,
        myAnimeListUser.id,
        malAccessToken,
        malRefreshToken,
        'mal'
      );
      // redirect to profile page for first time setup
    }

    if (linkUserId) {
      const cookieStore = await cookies();
      cookieStore.delete('link_user_id');

      return buildTokenResponse(
        { linked: { mal: myAnimeListUser.id } },
        'popup'
      );
    }
    return await createSessionAndReturnTokenResponse({ userId }, false);
  } catch (error) {
    handleError(error);
  }
}

async function getMyAnimeListUserInfo(accessToken) {
  const response = await fetch('https://api.myanimelist.net/v2/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text(); // MAL sometimes returns plain text on errors
    throw new AppError({
      code: ERROR_CODES.MAL_ERROR,
      message: 'Something went wrong with MAL response',
      details: { description: response.statusText, error: errorBody },
      status: response.status,
    });
  }

  return await response.json();
}

/**
 * @typedef {object} MyAnimeListUserInfo
 * @property {number} id - Unique identifier for the user.
 * @property {string} name - Username of the user.
 * @property {string} birthday - User's birthday in YYYY-MM-DD format.
 * @property {string} joined_at - ISO timestamp of when the user joined.
 * @property {string} location - User's location (empty string if not set).
 */

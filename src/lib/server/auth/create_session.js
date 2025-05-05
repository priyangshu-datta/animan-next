import db from '@/db/index';
import { NextResponse } from 'next/server';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../errors/errorCodes';
import { issueAccessToken, issueRefreshToken } from '../jwt';
import { MS_IN_MINUTE, MS_IN_WEEK } from '@/lib/constants';
import { camelKeysToSnakeKeys } from '@/utils';

/**
 * Creates a session, issues tokens, stores the session in DB,
 * sets the cookie, and returns an HTML response that sends the access token to the opener.
 * @param {object} userAndSessionInfo - User session data.
 * @param {string} userAndSessionInfo.userId - The unique ID of the user.
 * @param {string} [userAndSessionInfo.timesRotated] - Previous rotation count.
 * @param {object} cookieStore - Cookie store object with a `.set()` method.
 * @param {boolean} refreshGrant - Whether this is a token rotation scenario.
 * @param {"iframe" | "popup"} type
 * @returns {Promise<import('next/server').NextResponse>} - A Next.js HTML response with token info.
 */
export async function createSessionAndReturnTokenResponse(
  userAndSessionInfo,
  cookieStore,
  refreshGrant,
  type = 'popup'
) {
  const userId = userAndSessionInfo.userId;
  const timesRotated = refreshGrant ? +userAndSessionInfo.timesRotated + 1 : 0;

  const accessToken = await issueAccessToken(userId);
  const refreshToken = issueRefreshToken();

  const sessionCreated = await storeSession(userId, refreshToken, timesRotated);

  if (!sessionCreated) {
    throw new AppError({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'Failed to create user session',
      details: 'Database inset error',
      status: 500,
    });
  }

  setRefreshTokenCookie(cookieStore, refreshToken);

  return buildTokenResponse(accessToken, userId, type);
}

/**
 * Stores a new session in the database.
 * @param {string} userId - ID of the user.
 * @param {string} refreshToken - Newly issued refresh token.
 * @param {number} timesRotated - Number of times the refresh token has been rotated.
 * @returns {Promise<boolean>} - Whether the session was successfully created.
 */
async function storeSession(userId, refreshToken, timesRotated) {
  const inserted = await db('sessions')
    .insert(
      camelKeysToSnakeKeys({
        userId,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + MS_IN_WEEK),
        timesRotated: timesRotated,
      })
    )
    .returning('id');

  return inserted.length > 0;
}

/**
 * Sets the secure HTTP-only refresh token cookie.
 * @param {object} cookieStore - Object for setting cookies.
 * @param {string} token - Refresh token to store in the cookie.
 */
function setRefreshTokenCookie(cookieStore, token) {
  cookieStore.set({
    name: 'refresh_token',
    value: token,
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: MS_IN_WEEK / 1000,
  });
}

/**
 * Builds an HTML response that posts the access token to the opener window and closes the popup.
 * @param {string} accessToken - Access token to be sent to the frontend.
 * @param {string} userId
 * @param {"iframe" | "popup"} type
 * @returns {import('next/server').NextResponse} - An HTML response with embedded script.
 */
function buildTokenResponse(accessToken, userId, type) {
  const payload = {
    accessToken: accessToken,
    userId: userId,
  };

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Authentication Complete</title>
  </head>
  <body>
    <script>
      (function () {
        const payload = ${JSON.stringify(payload)};
        const targetOrigin = "${process.env.NEXT_PUBLIC_APP_URL.replace(
          /"/g,
          '\\"'
        )}";

        window.${
          type === 'iframe' ? 'parent' : 'opener'
        }?.postMessage(payload, targetOrigin);
      })();
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-type': 'text/html; charset=utf-8',
    },
  });
}

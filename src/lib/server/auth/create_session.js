import db from '@/db/index';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { issueAccessToken, issueRefreshToken } from '@/utils/token-utils';
import {
  QUARTER_HOUR_IN_MS,
  HOUR_IN_MS,
  MONTH_IN_MS,
  WEEK_IN_MS,
} from '@/lib/constants';
import { camelKeysToSnakeKeys } from '@/utils/general';
import { cookies } from 'next/headers';

export async function createSessionAndReturnTokenResponse(
  userAndSessionInfo,
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
      details: 'Database insert error',
      status: 500,
    });
  }

  setRefreshTokenCookie(refreshToken);

  return buildTokenResponse({ accessToken, userId }, type);
}

export async function storeSession(userId, refreshToken, timesRotated) {
  const inserted = await db('sessions')
    .insert(
      camelKeysToSnakeKeys({
        userId,
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + WEEK_IN_MS),
        timesRotated: timesRotated,
      })
    )
    .returning('id');

  return inserted.length > 0;
}

export async function setRefreshTokenCookie(refreshToken) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: 'refresh_token',
    value: refreshToken,
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: WEEK_IN_MS / 1000,
  });
}

export function buildTokenResponse(payload, type) {
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

export async function createNewUserWithOAuth(
  linkUserId,
  username,
  providerUserId,
  accessToken,
  refreshToken,
  provider
) {
  let userId = linkUserId;
  if (!linkUserId) {
    const userInsertResult = await db('users')
      .insert({ username: `${provider}-${username}` })
      .returning('id');

    if (!userInsertResult.length) {
      throw new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Failed to create new user',
        status: 500,
      });
    }

    userId = userInsertResult[0].id;
  }

  const oauthInsertResult = await db('oauth_accounts')
    .insert(
      camelKeysToSnakeKeys({
        userId,
        provider,
        providerUserId: providerUserId,
        accessToken: accessToken,
        accessTokenExpiration: new Date(
          Date.now() + HOUR_IN_MS - QUARTER_HOUR_IN_MS
        ),
        refreshToken: refreshToken,
        refreshTokenExpiration: new Date(
          Date.now() + MONTH_IN_MS - QUARTER_HOUR_IN_MS
        ),
      })
    )
    .returning('id');

  if (!oauthInsertResult.length) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Failed to link Anilist account',
      status: 500,
    });
  }

  return userId;
}

import db from '@/db/index';
import {
  MS_IN_15_MINUTES,
  MS_IN_HOUR,
  MS_IN_MONTH,
  MS_IN_WEEK,
} from '@/lib/constants';
import { validateAccessToken } from '@/utils/token-utils';
import { camelKeysToSnakeKeys, snakeKeysToCamelKeys } from '@/utils/general';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { issueAccessToken, issueRefreshToken } from './token-utils';
import { respondError } from '@/lib/server/responses';
import { ArcticFetchError, OAuth2RequestError } from 'arctic';

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
        expiresAt: new Date(Date.now() + MS_IN_WEEK),
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
    maxAge: MS_IN_WEEK / 1000,
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
      ${type === 'popup' && 'window.close()'}
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
  username,
  providerUserId,
  accessToken,
  refreshToken,
  provider
) {
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

  let userId = userInsertResult[0].id;

  const oauthInsertResult = await db('oauth_accounts')
    .insert(
      camelKeysToSnakeKeys({
        userId,
        provider,
        providerUserId: providerUserId,
        accessToken: accessToken,
        accessTokenExpiration: new Date(
          Date.now() + MS_IN_HOUR - MS_IN_15_MINUTES
        ),
        refreshToken: refreshToken,
        refreshTokenExpiration: new Date(
          Date.now() + MS_IN_MONTH - MS_IN_15_MINUTES
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

export async function withAuthProvider(request, provider) {
  let tokenPayload = await isAnimanTokenValid(request);

  const animanUserId = tokenPayload.sub;

  return await getProviderSession(animanUserId, provider);
}

export async function getProviderSession(animanUserId, provider) {
  let providerSession = await db('oauth_accounts')
    .where('user_id', animanUserId)
    .andWhere('provider', provider)
    .select(['access_token', 'provider_user_id'])
    .first();

  if (!providerSession || !providerSession.access_token) {
    throw new AppError({
      code: ERROR_CODES.FORBIDDEN,
      message: `Not linked with ${provider} yet | Tampered \`access_token\``,
      details: `Missing ${provider} access token for user`,
      status: 403,
    });
  }

  providerSession = snakeKeysToCamelKeys(providerSession);

  return {
    providerUserId: providerSession.providerUserId,
    providerAccessToken: providerSession.accessToken,
  };
}

export async function isAnimanTokenValid(request) {
  const authHeader = request.headers.get('Authorization');
  const accessToken = authHeader.split(' ').at(1);

  let validity = await validateAccessToken(accessToken);

  if (!validity?.valid) {
    throw new AppError({
      code: ERROR_CODES.ACCESS_TOKEN_EXPIRED,
      message: 'Invalid or tampered `access_token`',
      details: validity.error,
      status: 401,
    });
  }
  return validity.payload.payload;
}

export function handleError(err) {
  try {
    if (err instanceof OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI

      throw new AppError({
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
    }
    if (err instanceof ArcticFetchError) {
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

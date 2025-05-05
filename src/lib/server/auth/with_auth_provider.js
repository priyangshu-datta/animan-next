import db from '@/db/index';
import { validateAccessToken } from '@/lib/server/jwt';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../errors/errorCodes';
import { snakeKeysToCamelKeys } from '@/utils';

/**
 * Validate the user access token and fetch provider access token
 *
 * @param {import("next/server").NextRequest} request - Incoming Next.js request
 * @param {import("@/types").Provider} provider - The name of the provider (e.g. "anilist", "mal")
 * @returns {Promise<{ providerUserId: string; providerAccessToken: string; }>}
 */
export async function withAuthProvider(request, provider) {
  let tokenPayload = await isAnimanTokenValid(request);

  const animanUserId = tokenPayload.sub;

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

/**
 * Validates the Animan access token from the request headers.
 *
 * @param {import("next/server").NextRequest} request - Incoming Next.js request
 * @returns {Promise<object>} The payload of the validated token.
 * @throws {AppError} If the token is invalid or tampered with.
 */
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

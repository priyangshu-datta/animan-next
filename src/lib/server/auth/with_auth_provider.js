import db from '@/db/index';
import { validateAccessToken } from '@/lib/server/jwt';
import { AppError } from '../errors/AppError';
import { ERROR_CODES } from '../errors/errorCodes';

/**
 * Validate the user access token and fetch provider access token
 *
 * @param {import("next/server").NextRequest} request - Incoming Next.js request
 * @param {import("@/types").Provider} provider - The name of the provider (e.g. "anilist", "mal")
 * @returns {Promise<{ provider_user_id: string; provider_access_token: string; }>}
 */
export async function withAuthProvider(request, provider) {
  let tokenPayload = await isAnimanTokenValid(request);

  const animanUserId = tokenPayload.sub;

  const providerSession = await db('oauth_accounts')
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

  return {
    provider_user_id: providerSession.provider_user_id,
    provider_access_token: providerSession.access_token,
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
      code: ERROR_CODES.UNAUTHORIZED,
      message: 'Invalid or tampered `access_token`',
      details: validity.error,
      status: 401,
    });
  }
  return validity.payload.payload;
}

import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { respondError, respondSuccess } from '@/lib/server/responses';
import db from '@/db/index';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { snakeKeysToCamelKeys } from '@/utils';
import Joi from 'joi';

export async function GET(request) {
  try {
    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    let oauthAccounts = await db('oauth_accounts')
      .select('provider', 'provider_user_id', 'sync', 'created_at')
      .where('user_id', animanUserId);

    if (!oauthAccounts.length) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        status: 400,
        message: 'No OAuth accounts is linked to the authenticated user.',
      });
    }

    oauthAccounts = oauthAccounts.map((oauthAccount) =>
      snakeKeysToCamelKeys(oauthAccount)
    );

    return respondSuccess(
      {
        oauthAccounts: {
          ...Object.fromEntries(
            oauthAccounts.map((oauthAccount) => [
              oauthAccount.provider,
              oauthAccount,
            ])
          ),
        },
      },
      null,
      200
    );
  } catch (err) {
    return respondError(err);
  }
}

export async function PATCH(request) {
  try {
    const schema = Joi.object({
      unlink: Joi.array().items(Joi.string()),
      sync: Joi.array().items(Joi.string()),
    });
    const body = await request.json();

    const { error: validationError, value } = schema.validate(body);
    if (validationError) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: validationError.message,
        details: validationError.message,
        status: 400,
        stack: validationError.stack,
      });
    }

    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    if (value?.unlink?.length) {
      await db('oauth_accounts')
        .where('user_id', animanUserId)
        .andWhere('provider', 'in', value.unlink)
        .del();
    }

    if (value?.sync?.length) {
      await db('oauth_accounts')
        .where('user_id', animanUserId)
        .where('provider', 'in', value.sync)
        .update('sync', true);

      await db('oauth_accounts')
        .where('user_id', animanUserId)
        .where('provider', 'not in', value.sync)
        .update('sync', false);
    }

    return respondSuccess(null);
  } catch (err) {
    return respondError(err);
  }
}

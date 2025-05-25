import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import Joi from 'joi';

export async function patchUserInfo(context, { animanUserId }) {
  const contextSchema = Joi.object({
    username: Joi.string(),
    locale: Joi.string(),
    timezone: Joi.string(),
    colorScheme: Joi.string().valid('dark', 'light', 'system'),
  });

  const { value, error } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  await db('users')
    .update(camelKeysToSnakeKeys(value))
    .where('id', animanUserId);

  return respondSuccess(null);
}

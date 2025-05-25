import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import Joi from 'joi';

export async function getUserInfo(_, { animanUserId, ...metadata }) {
  const metaSchema = Joi.object({
    providerName: Joi.string().valid('anilist', 'mal', 'kitsu'),
    providerUserId: Joi.string(),
  });

  const { value, error } = metaSchema.validate(metadata, {
    stripUnknown: true,
  });

  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }

  const user = await db('users').where('id', animanUserId).first();

  if (!user) {
    throw new AppError({
      code: ERROR_CODES.INTERNAL_ERROR,
      details: 'User not found at this stage.',
      status: 500,
      message: 'Something went wrong!',
    });
  }

  return respondSuccess({ ...value, ...snakeKeysToCamelKeys(user) });
}

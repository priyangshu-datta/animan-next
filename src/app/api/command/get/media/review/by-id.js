import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import Joi from 'joi';

export async function getMediaReviewById(context, { animanUserId }) {
  const contextSchema = Joi.object({
    id: Joi.string(),
    mediaType: Joi.string().valid('anime', 'manga').lowercase(),
  });

  const { value, error } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.details,
      stack: error.stack,
      status: 400,
    });
  }

  const review = await db(`${value.mediaType}_reviews`)
    .where('id', value.id)
    .andWhere('user_id', animanUserId)
    .first();

  if (review) {
    return respondSuccess(snakeKeysToCamelKeys(review));
  } else {
    throw new AppError({
      code: ERROR_CODES.NOT_FOUND,
      message: 'Review not found',
      status: 404,
    });
  }
}

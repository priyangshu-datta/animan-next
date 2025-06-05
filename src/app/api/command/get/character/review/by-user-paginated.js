import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import Joi from 'joi';

export async function getCharacterReviewsByUserPaginated(_, metadata) {
  const metaSchema = Joi.object({
    animanUserId: Joi.string().required(),
    cursor: Joi.date().iso(),
    limit: Joi.number().default(10),
  });
  const { error: metaError, value: metaValue } = metaSchema.validate(metadata, {
    stripUnknown: true,
  });
  if (metaError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      message: metaError.message,
      details: metaError.details,
      stack: metaError.stack,
    });
  }

  const { animanUserId, cursor, limit } = metaValue;

  const query = db(`character_reviews`)
    .where('user_id', animanUserId)
    .orderBy('updated_at', 'desc');

  const cursorValue = cursor ? new Date(decodeURIComponent(cursor)) : undefined;

  if (cursorValue) {
    query.where('updated_at', '<', cursorValue);
  }

  let reviews = await query.limit(limit);

  reviews = reviews.map((review) => snakeKeysToCamelKeys(review));

  let nextCursor = null;

  if (reviews.length === limit) {
    const lastReview = reviews.at(-1);

    const nextItem = await db(`character_reviews`)
      .where('user_id', animanUserId)
      .where('updated_at', '<', lastReview.updatedAt)
      .orderBy('updated_at', 'desc')
      .first();

    if (nextItem) {
      nextCursor = snakeKeysToCamelKeys(lastReview).updatedAt || null;
    }
  }

  return respondSuccess({ reviews }, null, 200, { nextCursor });
}

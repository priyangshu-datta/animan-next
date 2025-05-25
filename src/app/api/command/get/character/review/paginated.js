import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { snakeKeysToCamelKeys } from '@/utils/general';
import Joi from 'joi';

export async function getCharacterReviewsPaginated(context, metadata) {
  const contextSchema = Joi.object({
    characterId: Joi.number().required(),
  });
  const { error: contextError, value: contextValue } = contextSchema.validate(
    context,
    { stripUnknown: true }
  );
  if (contextError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      status: 400,
      message: contextError.message,
      details: contextError.details,
      stack: contextError.stack,
    });
  }

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

  const { characterId } = contextValue;
  const { animanUserId, cursor, limit } = metaValue;

  const query = db(`character_reviews`)
    .where('user_id', animanUserId)
    .andWhere(`character_id`, characterId)
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
      .andWhere(`character_id`, characterId)
      .where('updated_at', '<', lastReview.updatedAt)
      .orderBy('updated_at', 'desc')
      .first();

    if (nextItem) {
      nextCursor = snakeKeysToCamelKeys(lastReview).updatedAt || null;
    }
  }

  return respondSuccess({ reviews }, null, 200, { nextCursor });
}

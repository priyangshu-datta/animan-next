import db from '@/db';
import { CHARACTER_ROLES, MEDIA_TYPES } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import Joi from 'joi';

export async function patchCharacterReview(
  context,
  { animanUserId, ...metadata }
) {
  const contextSchema = Joi.object({
    rating: Joi.number().precision(2).min(0).max(10.0).default(0),
    reviewText: Joi.string().min(10).required(),
    favourite: Joi.boolean().default(false),
    emotions: Joi.array().items(Joi.string()).default([]),
    associatedMediaId: Joi.number().allow(null).default(null),
    associatedMediaType: Joi.string()
      .valid(...MEDIA_TYPES)
      .allow(null)
      .default(null),
    role: Joi.string()
      .valid(...CHARACTER_ROLES)
      .allow(null)
      .default(null),
  });

  const { error: contextError, value: contextValue } =
    contextSchema.validate(context);
  if (contextError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: contextError.message,
      details: contextError.details,
      status: 400,
      stack: contextError.stack,
    });
  }

  const metaSchema = Joi.object({
    reviewId: Joi.string(),
  });
  const { error: metadataError, value: metadataValue } = metaSchema.validate(
    metadata,
    { stripUnknown: true }
  );

  if (metadataError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: metadataError.message,
      details: metadataError.message,
      status: 400,
      stack: metadataError.stack,
    });
  }

  const updatedReview = await db('character_reviews')
    .where('id', metadataValue.reviewId)
    .update(
      camelKeysToSnakeKeys({
        ...contextValue,
        emotions: contextValue.emotions.join(';'),
      })
    );

  if (updatedReview.length < 1) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Something went wrong',
      details: 'Review was not saved to database',
      status: 500,
    });
  }

  return respondSuccess(null, null, 200);
}

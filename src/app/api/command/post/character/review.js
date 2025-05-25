import db from '@/db';
import { CHARACTER_ROLES, MEDIA_TYPES } from '@/lib/constants';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import Joi from 'joi';

export async function postCharacterReview(context, { animanUserId }) {
  const contextSchema = Joi.object({
    characterId: Joi.number().required(),
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

  const { error, value } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: error.message,
      details: error.message,
      status: 400,
      stack: error.stack,
    });
  }

  const insertedReview = await db('character_reviews').insert(
    camelKeysToSnakeKeys({
      userId: animanUserId,
      ...value,
      emotions: value.emotions.join(';'),
    })
  );

  if (insertedReview.length < 1) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Something went wrong',
      details: 'Review was not saved to database',
      status: 500,
    });
  }

  return respondSuccess(null, null, 201);
}

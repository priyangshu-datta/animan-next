import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import Joi from 'joi';

export async function patchMediaReview(context, { animanUserId, ...metadata }) {
  const contextSchema = Joi.object({
    rating: Joi.number().precision(2).min(0).max(10.0).default(0),
    reviewText: Joi.string().min(10).required(),
    favourite: Joi.boolean().default(false),
    emotions: Joi.array().items(Joi.string()).default([]),

    mediaType: Joi.string().valid('anime', 'manga').lowercase().required(),
  })
    .when(
      Joi.object({
        mediaType: Joi.string().valid('anime').lowercase().required(),
      }).unknown(),
      {
        then: Joi.object({
          episodeNumber: Joi.number().default(null),
          season: Joi.string()
            .valid('winter', 'spring', 'summer', 'fall')
            .allow(null),
          year: Joi.number().default(null),
        }),
      }
    )
    .when(
      Joi.object({
        mediaType: Joi.string().valid('manga').lowercase().required(),
      }).unknown(),
      {
        then: Joi.object({
          chapterNumber: Joi.number().default(null),
          volume: Joi.number().default(null),
        }),
      }
    );

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
      details: metadataError.details,
      status: 400,
      stack: metadataError.stack,
    });
  }

  const { mediaType, ...restValue } = contextValue;

  const updatedReview = await db(`${mediaType}_reviews`)
    .where('id', metadataValue.reviewId)
    .update(
      camelKeysToSnakeKeys({
        ...restValue,
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

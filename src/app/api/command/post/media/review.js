import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys } from '@/utils/general';
import Joi from 'joi';

export async function postMediaReview(context, { animanUserId }) {
  const contextSchema = Joi.object({
    rating: Joi.number().precision(2).min(0).max(10.0).default(0),
    reviewText: Joi.string().min(10).required(),
    favourite: Joi.boolean().default(false),
    emotions: Joi.array().items(Joi.string()).default([]),
    mediaType: Joi.string().valid('anime', 'manga').lowercase().required(),
    subjectType: Joi.alternatives().conditional('mediaType', [
      { is: 'anime', then: Joi.string().valid('episode', 'anime') },
      { is: 'manga', then: Joi.string().valid('chapter', 'volume', 'manga') },
    ]),
  })
    .when(
      Joi.object({
        mediaType: Joi.string().valid('anime').lowercase().required(),
      }).unknown(),
      {
        then: Joi.object({
          animeId: Joi.number().required(),
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
          mangaId: Joi.number().required(),
          chapterNumber: Joi.number().default(null),
          volume: Joi.number().default(null),
        }),
      }
    );

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

  const { mediaType, ...restValue } = value;

  const insertedReview = await db(`${mediaType}_reviews`).insert(
    camelKeysToSnakeKeys({
      userId: animanUserId,
      ...restValue,
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

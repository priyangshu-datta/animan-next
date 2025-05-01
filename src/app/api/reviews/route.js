import db from '@/db/index';
import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import {
  createReviewSchema,
  deleteReviewSchema,
  updateReviewSchema,
} from './joi_schemas';
import Joi from 'joi';

export async function POST(request) {
  try {
    const mediaType = request.headers.get('x-media-type');

    if (!mediaType) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'x-media-type is missing',
        details: 'x-media-type is missing',
        status: 400,
      });
    }

    const baseSchema = {
      rating: Joi.number().precision(2).max(10).min(0),
      review_text: Joi.string().min(10),
      favourite: Joi.boolean(),
      emotions: Joi.array().items(Joi.string()),
      media_id: Joi.number(),
      mediaType: Joi.string().valid('ANIME', 'MANGA'),
    };

    const animeReviewSchema = Joi.object({
      subject_type: Joi.string().valid('anime', 'episode', 'season'),
      episode_number: Joi.number(),
      season: Joi.string().valid('winter', 'spring', 'summer', 'fall'),
      year: Joi.number(),
      ...baseSchema,
    });

    const mangaReviewSchema = Joi.object({
      subject_type: Joi.string().valid('manga', 'chapter', 'volume'),
      chapter_number: Joi.number(),
      volume: Joi.number(),
      ...baseSchema,
    });

    const schemas = { ANIME: animeReviewSchema, MANGA: mangaReviewSchema };

    const body = await request.json();

    const { error: validationError, value } = schemas[mediaType].validate(body);

    if (validationError) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: validationError.message,
        details: validationError.message,
        status: 400,
        stack: validationError.stack,
      });
    }

    let tokenPayload = await isAnimanTokenValid(request);

    const animanUserId = tokenPayload.sub;

    let mutationData = {
      user_id: animanUserId,
      subject_type: value.subject_type,
      rating: value.rating,
      review_text: value.review_text,
      favourite: value.favourite,
      emotions: value.emotions.join(';'),
    };

    if (mediaType === 'ANIME') {
      mutationData = {
        ...mutationData,
        anime_id: value.media_id,
        episode_number: value.episode_number,
        season: value.season,
        year: value.year,
      };
    } else {
      mutationData = {
        ...mutationData,
        manga_id: value.media_id,
        chapter_number: value.chapter_number,
        volume: value.volume,
      };
    }

    const insertedNote = await db(`${mediaType.toLowerCase()}_reviews`)
      .insert(mutationData)
      .returning('id');

    if (insertedNote.length < 1) {
      throw new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Something went wrong',
        details: 'Review was not saved to database',
        status: 500,
      });
    }

    return respondSuccess(null, null, 201);
  } catch (err) {
    return respondError(err);
  }
}

export async function DELETE(request) {
  try {
    const mediaType = request.headers.get('x-media-type');

    if (!mediaType) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'x-media-type is missing',
        details: 'x-media-type is missing',
        status: 400,
      });
    }

    const body = await request.json();

    const { error: validationError, value } = deleteReviewSchema.validate(body);
    console.log(value);
    if (validationError) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: validationError.message,
        details: validationError.message,
        status: 400,
        stack: validationError.stack,
      });
    }

    let tokenPayload = await isAnimanTokenValid(request);

    const animanUserId = tokenPayload.sub;

    const deletedNote = await db(`${mediaType.toLowerCase()}_reviews`)
      .where('user_id', animanUserId)
      .andWhere('id', value.review_id)
      .del();

    if (deletedNote < 1) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'No reviewes were found to delete',
        details:
          "The combination of user_id and review's id was not found in episodes_notes table.",
        status: 400,
      });
    }

    return respondSuccess(null, null, 200);
  } catch (err) {
    return respondError(err);
  }
}

export async function PATCH(request) {
  try {
    const mediaType = request.headers.get('x-media-type');

    if (!mediaType) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'x-media-type is missing',
        details: 'x-media-type is missing',
        status: 400,
      });
    }

    const baseSchema = {
      review_id: Joi.string(),
      rating: Joi.number().precision(2).max(10).min(0),
      review_text: Joi.string().min(10),
      favourite: Joi.boolean(),
      emotions: Joi.array().items(Joi.string()),
      media_id: Joi.number(),
      mediaType: Joi.string().valid('ANIME', 'MANGA'),
    };

    const animeReviewSchema = Joi.object({
      subject_type: Joi.string().valid('anime', 'episode', 'season'),
      episode_number: Joi.number().optional(),
      season: Joi.string().valid('winter', 'spring', 'summer', 'fall'),
      year: Joi.number().optional(),
      ...baseSchema,
    });

    const mangaReviewSchema = Joi.object({
      subject_type: Joi.string().valid('manga', 'chapter', 'volume'),
      chapter_number: Joi.number().optional(),
      volume: Joi.number().allow(null),
      ...baseSchema,
    });

    const schemas = { ANIME: animeReviewSchema, MANGA: mangaReviewSchema };

    const body = await request.json();

    const { error: validationError, value } = schemas[mediaType].validate(body);
    if (validationError) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: validationError.message,
        details: validationError.message,
        status: 400,
        stack: validationError.stack,
      });
    }

    let tokenPayload = await isAnimanTokenValid(request);

    const animanUserId = tokenPayload.sub;

    let updationData = {
      user_id: animanUserId,
      subject_type: value?.subject_type,
      rating: value?.rating,
      review_text: value?.review_text,
      favourite: value?.favourite,
      emotions: value?.emotions?.join(';'),
    };

    if (mediaType === 'ANIME') {
      updationData = {
        ...updationData,
        anime_id: value?.media_id,
        episode_number: value.episode_number,
        season: value.season,
        year: value.year,
      };
    } else {
      updationData = {
        ...updationData,
        manga_id: value?.media_id,
        chapter_number: value.chapter_number,
        volume: value.volume,
      };
    }

    const insertedNote = await db(`${mediaType.toLowerCase()}_reviews`)
      .where('id', value.review_id)
      .andWhere('user_id', animanUserId)
      .update(updationData);

    if (insertedNote < 1) {
      throw new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Something went wrong',
        details: 'Review was not updated',
        status: 500,
      });
    }

    return respondSuccess(null, null, 200);
  } catch (err) {
    return respondError(err);
  }
}

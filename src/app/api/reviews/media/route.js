import db from '@/db/index';
import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import {
  createAnimeReviewSchema,
  createMangaReviewSchema,
  deleteReviewSchema,
  updateAnimeReviewSchema,
  updateMangaReviewSchema,
} from '../joi-schemas';
import { camelKeysToSnakeKeys, snakeKeysToCamelKeys } from '@/utils';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    const mediaType = searchParams.get('mediaType');
    const mediaId = searchParams.get('mediaId');
    const subjectType = searchParams.get('subjectType');

    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    const hasReviewId = !!reviewId;
    const hasMediaType = !!mediaType;
    const hasMediaId = !!mediaId;
    const hasSubjectType = !!subjectType;

    if (hasReviewId && (hasMediaType || hasMediaId || hasSubjectType)) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        status: 400,
        message:
          'Please provide either reviewId for a single review OR mediaType, mediaId, and subjectType for all reviews, but not a combination of both.',
      });
    }

    if (hasReviewId) {
      const review = await db(`${mediaType?.toLowerCase()}_reviews`) // Assuming mediaType might be relevant for table name
        .where('user_id', animanUserId)
        .andWhere('id', reviewId)
        .first();

      if (!review) {
        throw new AppError({
          status: 404,
          message: 'Review not found',
          code: ERROR_CODES.NOT_FOUND,
        });
      }

      return respondSuccess(
        { review: snakeKeysToCamelKeys(review) },
        null,
        200
      );
    }

    if (hasMediaType && hasMediaId && hasSubjectType) {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const cursorValue = cursor ? new Date(cursor) : undefined;

      const query = db(`${mediaType.toLowerCase()}_reviews`)
        .where('user_id', animanUserId)
        .andWhere(`${mediaType.toLowerCase()}_id`, mediaId)
        .andWhere('subject_type', subjectType)
        .orderBy('updated_at', 'desc');

      if (cursorValue) {
        query.where('updated_at', '<', cursorValue);
      }

      let reviews = await query.limit(limitNumber);

      reviews = reviews.map((review) => snakeKeysToCamelKeys(review));

      let nextCursor = null;

      if (reviews.length === limit) {
        const lastReview = reviews.at(-1);
        const nextItem = await db(`${mediaType.toLowerCase()}_reviews`)
          .where('user_id', animanUserId)
          .andWhere(`${mediaType.toLowerCase()}_id`, mediaId)
          .andWhere('subject_type', subjectType)
          .where('updated_at', '<', lastReview.updatedAt)
          .orderBy('updated_at', 'desc')
          .first();

        if (nextItem) {
          nextCursor = lastReview.updatedAt?.toString() || null;
        }
      }

      return respondSuccess({ reviews }, null, 200, { nextCursor });
    }

    throw new AppError({
      status: 400,
      code: ERROR_CODES.BAD_REQUEST,
      message:
        'Please provide either reviewId for a single review OR mediaType, mediaId, and subjectType for all reviews.',
    });
  } catch (error) {
    return respondError(error);
  }
}

export async function POST(request) {
  try {
    const mediaType = retrieveMediaType(request);

    const schemas = {
      ANIME: createAnimeReviewSchema,
      MANGA: createMangaReviewSchema,
    };

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
      userId: animanUserId,
      subjectType: value.subjectType,
      rating: value.rating,
      reviewText: value.reviewText,
      favourite: value.favourite,
      emotions: value.emotions.join(';'),
    };

    if (mediaType === 'ANIME') {
      mutationData = {
        ...mutationData,
        animeId: value.mediaId,
        episodeNumber: value.episodeNumber,
        season: value.season,
        year: value.year,
      };
    } else {
      mutationData = {
        ...mutationData,
        mangaId: value.mediaId,
        chapterNumber: value.chapterNumber,
        volume: value.volume,
      };
    }

    const insertedNote = await db(`${mediaType.toLowerCase()}_reviews`)
      .insert(camelKeysToSnakeKeys(mutationData))
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
      .andWhere('id', value.reviewId)
      .del();

    if (deletedNote < 1) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'No reviewes were found to delete',
        details: `The combination of user_id and review's id was not found in ${mediaType.toLowerCase()}_reviews table.`,
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
    const mediaType = retrieveMediaType(request);

    const schemas = {
      ANIME: updateAnimeReviewSchema,
      MANGA: updateMangaReviewSchema,
    };

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
      subjectType: value?.subjectType,
      rating: value?.rating,
      reviewText: value?.reviewText,
      favourite: value?.favourite,
      emotions: value?.emotions?.join(';'),
    };

    if (mediaType === 'ANIME') {
      updationData = {
        ...updationData,
        animeId: value?.mediaId,
        episodeNumber: value.episodeNumber,
        season: value.season,
        year: value.year,
      };
    } else {
      updationData = {
        ...updationData,
        mangaId: value?.mediaId,
        chapterNumber: value.chapterNumber,
        volume: value.volume,
      };
    }

    updationData = Object.fromEntries(
      Object.entries(updationData).filter(([k, v]) => !!v)
    );

    const insertedNote = await db(`${mediaType.toLowerCase()}_reviews`)
      .where('id', value.reviewId)
      .andWhere('user_id', animanUserId)
      .update(camelKeysToSnakeKeys(updationData));

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

const retrieveMediaType = (request) => {
  const mediaType = request.headers.get('x-media-type');

  if (!mediaType) {
    throw new AppError({
      code: ERROR_CODES.BAD_REQUEST,
      message: 'x-media-type is missing',
      details: 'x-media-type is missing',
      status: 400,
    });
  }

  return mediaType;
};

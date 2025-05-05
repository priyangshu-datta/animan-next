import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import { camelKeysToSnakeKeys, snakeKeysToCamelKeys } from '@/utils';
import db from '@/db/index';
import {
  createCharacterReviewSchema,
  deleteReviewSchema,
  updateCharacterReviewSchema,
} from '../joi-schemas';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    const characterId = searchParams.get('characterId');

    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    const hasReviewId = !!reviewId;
    const hasCharacterId = !!characterId;

    if (hasReviewId && hasCharacterId) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        status: 400,
        message:
          'Please provide either reviewId for a single review OR characterId for all reviews, but not both.',
      });
    }

    if (hasReviewId) {
      const review = await db(`character_reviews`) // Assuming mediaType might be relevant for table name
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

    if (hasCharacterId) {
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      const cursorValue = cursor ? new Date(cursor) : undefined;

      const query = db(`character_reviews`)
        .where('user_id', animanUserId)
        .andWhere(`character_id`, characterId)
        .orderBy('updated_at', 'desc');

      if (cursorValue) {
        query.where('updated_at', '<', cursorValue);
      }

      let reviews = await query.limit(limitNumber);

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
          nextCursor = lastReview.updatedAt?.toString() || null;
        }
      }

      return respondSuccess({ reviews }, null, 200, { nextCursor });
    }

    throw new AppError({
      status: 400,
      code: ERROR_CODES.BAD_REQUEST,
      message:
        'Please provide either reviewId for a single review OR characterId for all reviews.',
    });
  } catch (error) {
    return respondError(error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { error: validationError, value } =
      createCharacterReviewSchema.validate(body);

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
      ...value,
      emotions: value.emotions.join(';'),
    };

    const insertedNote = await db('character_reviews')
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

    const deletedNote = await db(`character_reviews`)
      .where('user_id', animanUserId)
      .andWhere('id', value.reviewId)
      .del();

    if (deletedNote < 1) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'No reviewes were found to delete',
        details: `The combination of user_id and review's id was not found in character_reviews table.`,
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
    const body = await request.json();

    const { error: validationError, value } =
      updateCharacterReviewSchema.validate(body);
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
      rating: value?.rating,
      reviewText: value?.reviewText,
      favourite: value?.favourite,
      emotions: value?.emotions?.join(';'),
      associatedMediaId: value?.associatedMediaId,
      associatedMediaType: value?.associatedMediaType,
      role: value?.role,
    };

    updationData = Object.fromEntries(
      Object.entries(updationData).filter(([k, v]) => !!v)
    );

    const insertedNote = await db(`character_reviews`)
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

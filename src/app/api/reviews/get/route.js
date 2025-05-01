import db from '@/db/index';
import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import { getReviewSchema } from '../joi_schemas';

export async function POST(request) {
  try {
    const mediaType = request.headers.get('x-media-type');
    const subjectType = request.headers.get('x-subject-type');

    if (!mediaType) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'x-media-type is missing',
        details: 'x-media-type is missing',
        status: 400,
      });
    }
    if (!subjectType) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'x-subject-type is missing',
        details: 'x-subject-type is missing',
        status: 400,
      });
    }

    const body = await request.json();

    const { error: validationError, value } = getReviewSchema.validate(body);
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

    let reviews;

    if (value.id_or_all === 'all') {
      reviews = await db(`${mediaType.toLowerCase()}_reviews`)
        .where('user_id', animanUserId)
        .andWhere(`${mediaType.toLowerCase()}_id`, value.media_id)
        .andWhere('subject_type', 'in', subjectType.split(';'))
        .returning('*');
    } else {
      reviews = await db(`${mediaType.toLowerCase()}_reviews`)
        .where('user_id', animanUserId)
        .andWhere('id', value.id_or_all)
        .andWhere(`${mediaType.toLowerCase()}_id`, value.media_id)
        .andWhere('subject_type', 'in', subjectType.split(';'))
        .returning('*');
    }

    return respondSuccess(
      { reviews },
      reviews.length < 1
        ? value.id_or_all === 'all'
          ? 'No reviews saved yet'
          : `No note found for id: ${value.id_or_all}`
        : null,
      200
    );
  } catch (err) {
    return respondError(err);
  }
}

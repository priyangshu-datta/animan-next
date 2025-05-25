import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import Joi from 'joi';

export async function deleteMediaReviewByIds(context, { animanUserId }) {
  const contextSchema = Joi.object({
    reviewIds: Joi.array().items(Joi.string()).required(),
    mediaType: Joi.string().valid('anime', 'manga').lowercase(),
  });
  const { error: validationError, value } = contextSchema.validate(context);
  if (validationError) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: validationError.message,
      details: validationError.details,
      status: 400,
      stack: validationError.stack,
    });
  }

  const { mediaType, reviewIds } = value;

  const deletedNote = await db(`${mediaType}_reviews`)
    .where('user_id', animanUserId)
    .andWhere('id', 'in', reviewIds)
    .del();

  if (deletedNote < 1) {
    throw new AppError({
      code: ERROR_CODES.BAD_REQUEST,
      message: 'No reviews were found to delete',
      details: `The combination of user_id and review's id was not found in ${mediaType}_reviews table.`,
      status: 400,
    });
  }

  return respondSuccess(null, null, 200);
}

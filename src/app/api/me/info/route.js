import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { respondError, respondSuccess } from '@/lib/server/responses';
import db from '@/db/index';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { snakeKeysToCamelKeys } from '@/utils';
import Joi from 'joi';

export async function GET(request) {
  try {
    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    let userInfo = await db('users')
      .select('username', 'created_at', 'updated_at')
      .where('id', animanUserId)
      .first();

    if (!userInfo) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        status: 400,
        message: 'No authenticated user us found.',
      });
    }

    return respondSuccess(
      {
        ...snakeKeysToCamelKeys(userInfo),
      },
      null,
      200
    );
  } catch (err) {
    return respondError(err);
  }
}

export async function PATCH(request) {
  try {
    const schema = Joi.object({
      username: Joi.string(),
    });
    const body = await request.json();

    const { error: validationError, value } = schema.validate(body);
    if (validationError) {
      throw new AppError({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: validationError.message,
        details: validationError.message,
        status: 400,
        stack: validationError.stack,
      });
    }

    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    await db('users')
      .update({ username: value.username })
      .where('id', animanUserId);

    return respondSuccess(null);
  } catch (err) {
    return respondError(err);
  }
}

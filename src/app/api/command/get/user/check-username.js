import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondSuccess } from '@/lib/server/responses';
import Joi from 'joi';

export async function checkUsername(context) {
  const contextSchema = Joi.object({
    username: Joi.string(),
  });
  const { value, error } = contextSchema.validate(context);
  if (error) {
    throw new AppError({
      code: ERROR_CODES.VALIDATION_ERROR,
      ...error,
      status: 400,
    });
  }
  const { username } = value;

  const user = await db('users').where('username', username).first();

  return respondSuccess({
    exists: !!user,
  });
}

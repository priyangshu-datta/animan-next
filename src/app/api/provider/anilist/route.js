import { NextRequest, NextResponse } from 'next/server';
import Joi from 'joi';
import { getAnilistClient } from '@/lib/server/anilist';
import { withAuthProvider } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';

/**
 * @typedef {object} GraphQLRequest
 * @property {string} query - The GraphQL query string
 * @property {object} [variables] - Optional variables object
 */

/** @type {import('joi').ObjectSchema<GraphQLRequest>} */
const schema = Joi.object({
  query: Joi.string().required(),
  variables: Joi.object().optional(),
});

/**
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const body = await request.json();

    /** @type {{ error?: import('joi').ValidationError, value: GraphQLRequest }} */
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

    const {
      providerUserId: anilistUserId,
      providerAccessToken: anilistAccessToken,
    } = await withAuthProvider(request, 'anilist');

    const { query, variables } = value;

    const data = await getAnilistClient(
      query,
      { ...variables, userId: anilistUserId },
      {
        Authorization: `Bearer ${anilistAccessToken}`,
      }
    );

    console.log('Fetching from ANILIST');

    return respondSuccess(data);
  } catch (err) {
    return respondError(err);
  }
}

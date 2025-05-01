import { NextResponse } from 'next/server';
import { AppError } from './errors/AppError.js';
import { ERROR_CODES } from './errors/errorCodes.js';
import { logError } from '../logger.js';

/**
 * @template T
 * @param {T} data
 * @param {string} [message]
 * @param {number} [status]
 * @param {object} [meta] - Optional metadata (e.g., for pagination)
 * @returns {NextResponse}
 */
export function respondSuccess(data, message = 'Success', status = 200, meta) {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * @param {unknown} err
 * @returns {NextResponse}
 */
export function respondError(err) {
  if (err instanceof AppError) {
    logError(err.code, err.details ?? err.stack);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      { status: err.status }
    );
  }

  // console.dir(err.response.data, {depth: Infinity});

  logError('UNHANDLED_ERROR', err);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Something went wrong',
      },
    },
    { status: 500 }
  );
}

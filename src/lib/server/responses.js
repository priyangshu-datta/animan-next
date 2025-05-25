import { NextResponse } from 'next/server';
import { AppError } from './errors/AppError.js';
import { ERROR_CODES } from './errors/errorCodes.js';
import { logError } from '../logger.js';
import { AxiosError } from 'axios';

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
    logError(err.code, err);

    if (err.status === 401) {
      const payload = null;

      const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Authentication Complete</title>
  </head>
  <body>
    <script>
      (function () {
        const payload = ${JSON.stringify(payload)};
        const targetOrigin = "${process.env.NEXT_PUBLIC_APP_URL.replace(
          /"/g,
          '\\"'
        )}";

        window.parent?.postMessage(payload, targetOrigin);
      })();
    </script>
  </body>
</html>`;

      return new NextResponse(html, {
        status: 401,
        headers: {
          'Content-type': 'text/html; charset=utf-8',
        },
      });
    }

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

  if (err instanceof AxiosError) {
    logError(err.code, err.response.data);
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

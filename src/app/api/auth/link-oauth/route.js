import { isAnimanTokenValid } from '@/lib/server/auth/with_auth_provider';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const cookieStore = await cookies();

    if (request.headers.has('Authorization')) {
      const tokenPayload = await isAnimanTokenValid(request);
      const animanUserId = tokenPayload.sub;

      cookieStore.set({
        name: 'link_user_id',
        value: animanUserId,
        secure: false, // set to false in localhost
        path: '/',
        httpOnly: true,
        maxAge: 60 * 10, // 10 min
      });

      return respondSuccess(null, null, 200);
    } else {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Send Authorization header.',
        status: 400,
      });
    }
  } catch (err) {
    respondError(err);
  }
}

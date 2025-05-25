import db from '@/db';
import { AppError } from '@/lib/server/errors/AppError';
import { ERROR_CODES } from '@/lib/server/errors/errorCodes';
import { respondError, respondSuccess } from '@/lib/server/responses';
import { isAnimanTokenValid } from '@/utils/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  const trxProvider = db.transactionProvider();
  const trx = await trxProvider();

  try {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get('refresh_token').value;

    if (!request.headers.has('Authorization')) {
      throw new AppError({
        code: ERROR_CODES.BAD_REQUEST,
        message: 'Send Authorization header.',
        status: 400,
      });
    }

    const tokenPayload = await isAnimanTokenValid(request);
    const animanUserId = tokenPayload.sub;

    await trx('sessions')
      .where('user_id', animanUserId)
      .where('refresh_token', refreshToken)
      .del();

    await trx('sessions')
      .where('user_id', animanUserId)
      .where('expires_at', '<=', new Date())
      .del();

    await trx.commit();

    if (trx.isCompleted()) {
      cookieStore.delete('refresh_token');
      return respondSuccess({ redirect: '/login' }, null, 302);
    } else {
      throw new AppError({
        code: ERROR_CODES.DATABASE_ERROR,
        details: 'Transaction not complete.',
        message: 'Something went wrong',
        status: 500,
      });
    }
  } catch (err) {
    await trx.rollback();
    return respondError(err);
  }
}

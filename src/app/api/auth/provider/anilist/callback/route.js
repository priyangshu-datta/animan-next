import db from '@/db/index';
import { getAnilistClient } from '@/lib/server/anilist';
import {
  createNewUserWithOAuth,
  createSessionAndReturnTokenResponse,
  handleError,
} from '@/utils/auth';
import { snakeKeysToCamelKeys } from '@/utils/general';
import * as arctic from 'arctic';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const aniListClient = new arctic.AniList(
      process.env.ANILIST_CLIENT_ID,
      process.env.ANILIST_CLIENT_SECRET,
      process.env.ANILIST_CALLBACK_URL
    );

    const cookieStore = await cookies();

    const tokens = await aniListClient.validateAuthorizationCode(code);
    const anilistAccessToken = tokens.accessToken();
    const anilistRefreshToken = tokens.refreshToken();

    const userInfo = await getAnilistUserInfo(anilistAccessToken);
    const anilistUser = userInfo.Viewer;

    let existingOAuth = await db('oauth_accounts')
      .where('provider_user_id', anilistUser.id)
      .first();

    let userId;

    if (existingOAuth) {
      existingOAuth = snakeKeysToCamelKeys(existingOAuth);
      userId = existingOAuth.userId;
    } else {
      userId = await createNewUserWithOAuth(
        anilistUser.name,
        anilistUser.id,
        anilistAccessToken,
        anilistRefreshToken,
        'anilist'
      );

      // redirect to profile page for first time setup
    }

    return await createSessionAndReturnTokenResponse({ userId }, false);
  } catch (error) {
    handleError(error);
  }
}

async function getAnilistUserInfo(accessToken) {
  const query = `query {
	Viewer {
		id
		name
	}
}`;

  /** @type {{ Viewer: {id: number; name: string;}}} */
  const user = await getAnilistClient(
    query,
    {},
    {
      Authorization: `Bearer ${accessToken}`,
    }
  );

  return user;
}

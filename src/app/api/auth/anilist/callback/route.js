import db from "@/db/index";
import { getAnilistClient } from "@/lib/server/anilist";
import { createSessionAndReturnTokenResponse } from "@/lib/server/auth/create_session";
import { MS_IN_15_MINUTES, MS_IN_YEAR } from "@/lib/constants";
import { AppError } from "@/lib/server/errors/AppError";
import { ERROR_CODES } from "@/lib/server/errors/errorCodes";
import { respondError } from "@/lib/server/responses";
import * as arctic from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles the OAuth callback for AniList login via GET request.
 *
 * This function:
 * - Extracts the authorization code from the request query.
 * - Exchanges the code for access and refresh tokens using the AniList API.
 * - Fetches the AniList user's profile information.
 * - Checks if an OAuth account already exists in the database.
 *   - If not, it creates a new user and links their AniList account.
 * - Creates a session and returns a response with authentication tokens.
 *
 * @param {import("next/server").NextRequest} request - The incoming HTTP request containing the authorization code.
 * @returns {Promise<import("next/server").NextResponse>} A response containing the session tokens or an error.
 */
export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const aniListClient = new arctic.AniList(
      process.env.ANILIST_CLIENT_ID,
      process.env.ANILIST_CLIENT_SECRET,
      process.env.ANILIST_CALLBACK_URL
    );

    const tokens = await aniListClient.validateAuthorizationCode(code);
    const accessToken = tokens.accessToken();
    const refreshToken = tokens.refreshToken();

    const userInfo = await getAnilistUserInfo(accessToken);
    const viewer = userInfo.Viewer;

    const existingOAuth = await db("oauth_accounts")
      .where("provider_user_id", viewer.id)
      .first();

    let userId;

    if (existingOAuth) {
      userId = existingOAuth.user_id;
    } else {
      userId = await createNewUserWithOAuth(
        viewer.name,
        viewer.id,
        accessToken,
        refreshToken
      );
    }

    const cookieStore = await cookies();

    return await createSessionAndReturnTokenResponse(
      { user_id: userId },
      cookieStore,
      false
    );
  } catch (error) {
    handleError(error);
  }
}

/**
 * Creates a new user in the database and links their AniList account via OAuth.
 *
 * This function:
 * - Inserts a new user record with a username based on the AniList username.
 * - Creates an associated OAuth account entry with access and refresh tokens.
 *
 * @param {string} username - The AniList username of the user.
 * @param {string|number} providerUserId - The AniList user ID.
 * @param {string} accessToken - The OAuth access token from AniList.
 * @param {string} refreshToken - The OAuth refresh token from AniList.
 * @returns {Promise<number>} The newly created user's ID.
 * @throws {Error} If user creation or OAuth linking fails.
 */
async function createNewUserWithOAuth(
  username,
  providerUserId,
  accessToken,
  refreshToken
) {
  const userInsertResult = await db("users")
    .insert({ username: `al-${username}` })
    .returning("id");

  if (!userInsertResult.length) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to create new user",
      status: 500,
    });
  }

  const userId = userInsertResult[0].id;

  const oauthInsertResult = await db("oauth_accounts")
    .insert({
      user_id: userId,
      provider: "anilist",
      provider_user_id: providerUserId,
      access_token: accessToken,
      access_token_expiration: new Date(
        Date.now() + MS_IN_YEAR - MS_IN_15_MINUTES
      ),
      refresh_token: refreshToken,
      refresh_token_expiration: new Date(
        Date.now() + MS_IN_YEAR - MS_IN_15_MINUTES
      ),
    })
    .returning("id");

  if (!oauthInsertResult.length) {
    throw new AppError({
      code: ERROR_CODES.DATABASE_ERROR,
      message: "Failed to link Anilist account",
      status: 500,
    });
  }

  return userId;
}

/**
 *
 * @param {string} accessToken
 * @returns {Promise<{Viewer: {id: number; name: string}}>}
 */
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

  console.log(user);

  return user;
}

/**
 *
 * @param {any} err
 * @returns {NextResponse}
 */
function handleError(err) {
  try {
    if (err instanceof arctic.OAuth2RequestError) {
      // Invalid authorization code, credentials, or redirect URI
      const code = err.code;

      throw new AppError({
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
    }
    if (err instanceof arctic.ArcticFetchError) {
      // Failed to call `fetch()`
      const cause = err.cause;

      throw new AppError({
        code: ERROR_CODES.INTERNAL_ERROR,
        message: err.message,
        stack: err.stack,
      });
    }

    throw new AppError({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "Something went wrong",
      details: { description: "Token parsing error", error: err },
      status: 500,
    });
  } catch (_err) {
    return respondError(_err);
  }
}

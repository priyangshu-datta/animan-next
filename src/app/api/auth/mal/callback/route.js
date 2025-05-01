import db from "@/db/index";
import { createSessionAndReturnTokenResponse } from "@/lib/server/auth/create_session";
import { MS_IN_15_MINUTES, MS_IN_HOUR, MS_IN_MONTH } from "@/lib/constants";
import { AppError } from "@/lib/server/errors/AppError";
import { ERROR_CODES } from "@/lib/server/errors/errorCodes";
import { respondError } from "@/lib/server/responses";
import * as arctic from "arctic";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 *
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const malClient = new arctic.MyAnimeList(
      process.env.MAL_CLIENT_ID,
      process.env.MAL_CLIENT_SECRET,
      process.env.MAL_CALLBACK_URL
    );

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("code_verifier").value;

    const tokens = await malClient.validateAuthorizationCode(
      code,
      codeVerifier
    );
    const accessToken = tokens.accessToken();
    const refreshToken = tokens.refreshToken();

    const myAnimeListUser = await getMyAnimeListUserInfo(accessToken);

    const existingOAuth = await db("oauth_accounts")
      .where("provider_user_id", myAnimeListUser.id)
      .first();

    let userId;

    if (existingOAuth) {
      userId = existingOAuth.user_id;
    } else {
      userId = await createNewUserWithOAuth(
        myAnimeListUser.name,
        myAnimeListUser.id,
        accessToken,
        refreshToken
      );
    }

    return await createSessionAndReturnTokenResponse(
      { user_id: userId },
      cookieStore,
      false
    );
  } catch (e) {
    handleError(e);
  }
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

      throw new AppError({
        code: err.code,
        message: err.message,
        stack: err.stack,
      });
    }
    if (err instanceof arctic.ArcticFetchError) {
      // Failed to call `fetch()`

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
    .insert({ username: `mal-${username}` })
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
      provider: "mal",
      provider_user_id: providerUserId,
      access_token: accessToken,
      access_token_expiration: new Date(
        Date.now() + MS_IN_HOUR - MS_IN_15_MINUTES
      ),
      refresh_token: refreshToken,
      refresh_token_expiration: new Date(
        Date.now() + MS_IN_MONTH - MS_IN_15_MINUTES
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
 * Fetches user information from MyAnimeList using the given access token.
 *
 * @param {string} accessToken - The OAuth access token.
 * @returns {Promise<MyAnimeListUserInfo>} The user information object.
 * @throws {Error} If the request fails or the response is not OK.
 */
async function getMyAnimeListUserInfo(accessToken) {
  const response = await fetch("https://api.myanimelist.net/v2/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text(); // MAL sometimes returns plain text on errors
    throw new AppError({
      code: ERROR_CODES.MAL_ERROR,
      message: "Something went wrong with MAL response",
      details: { description: response.statusText, error: errorBody },
      status: response.status,
    });
  }

  return await response.json();
}

/**
 * @typedef {object} MyAnimeListUserInfo
 * @property {number} id - Unique identifier for the user.
 * @property {string} name - Username of the user.
 * @property {string} birthday - User's birthday in YYYY-MM-DD format.
 * @property {string} joined_at - ISO timestamp of when the user joined.
 * @property {string} location - User's location (empty string if not set).
 */

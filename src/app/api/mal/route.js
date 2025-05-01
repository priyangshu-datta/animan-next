import { withAuthProvider } from "@/lib/server/auth/with_auth_provider";
import { AppError } from "@/lib/server/errors/AppError"
import { ERROR_CODES } from "@/lib/server/errors/errorCodes"
import { respondError, respondSuccess } from "@/lib/server/responses";
import { NextRequest, NextResponse } from "next/server";

/**
 *
 * @param {NextRequest} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const { providerAccessToken } = await withAuthProvider(request, "mal");

    const response = await fetch("https://api.myanimelist.net/v2/users/@me", {
      headers: {
        Authorization: `Bearer ${providerAccessToken}`,
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

    const data = await response.json();

    return respondSuccess(data);
  } catch (error) {
    return respondError(error);
  }
}

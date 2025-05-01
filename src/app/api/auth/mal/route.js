import * as arctic from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * @returns {Promise<NextResponse>}
 */
export async function GET() {
  const mal = new arctic.MyAnimeList(
    process.env.MAL_CLIENT_ID,
    process.env.MAL_CLIENT_SECRET,
    process.env.MAL_CALLBACK_URL
  );

  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const url = mal.createAuthorizationURL(state, codeVerifier);

  const cookieStore = await cookies();

  cookieStore.set({
    name: "state",
    value: state,
    secure: false, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  cookieStore.set({
    name: "code_verifier",
    value: codeVerifier,
    secure: false, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });


  return NextResponse.redirect(url);
}

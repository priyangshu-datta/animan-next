import * as arctic from "arctic";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * @returns {Promise<NextResponse>}
 */
export async function GET() {
  const aniList = new arctic.AniList(
    process.env.ANILIST_CLIENT_ID,
    process.env.ANILIST_CLIENT_SECRET,
    process.env.ANILIST_CALLBACK_URL
  );

  const state = arctic.generateState();
  const url = aniList.createAuthorizationURL(state);

  const cookieStore = await cookies();

  cookieStore.set({
    name: "state",
    value: state,
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return NextResponse.redirect(url);
}

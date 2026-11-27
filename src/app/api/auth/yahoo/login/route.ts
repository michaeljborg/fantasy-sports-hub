import { NextResponse, type NextRequest } from "next/server";
import { authorizeUrl, yahooConfig } from "@/lib/yahoo/oauth";
import { STATE_COOKIE, stateCookieOptions } from "@/lib/yahoo/session";

/** Starts Yahoo sign-in: remembers a random `state`, then sends the user to Yahoo. */
export async function GET(request: NextRequest) {
  let config;
  try {
    config = yahooConfig(request.nextUrl.origin);
  } catch (error) {
    return new Response((error as Error).message, { status: 500 });
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(authorizeUrl(config, state));
  response.cookies.set(STATE_COOKIE, state, stateCookieOptions);
  return response;
}

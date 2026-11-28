import { NextResponse, type NextRequest } from "next/server";
import { fetchYahooGuid } from "@/lib/yahoo/identity";
import { exchangeCode, yahooConfig } from "@/lib/yahoo/oauth";
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  sealSession,
  sessionCookieOptions,
  sessionFromTokens,
  stateCookieOptions,
} from "@/lib/yahoo/session";

/** Yahoo redirects here after the user approves (or declines) access. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const yahooError = params.get("error");
  if (yahooError) {
    return new Response(`Yahoo sign-in failed: ${params.get("error_description") || yahooError}`, {
      status: 400,
    });
  }

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("Sign-in check failed (state mismatch). Please try signing in again.", {
      status: 400,
    });
  }

  let sealed: string;
  try {
    const tokens = await exchangeCode(yahooConfig(request.nextUrl.origin), code);
    const session = sessionFromTokens(tokens);
    // Saved data is keyed by the Yahoo user ID, which the tokens usually don't include.
    session.guid ??= await fetchYahooGuid(session.accessToken);
    sealed = await sealSession(session);
  } catch (error) {
    return new Response(`Couldn't complete Yahoo sign-in: ${(error as Error).message}`, {
      status: 502,
    });
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions);
  response.cookies.set(STATE_COOKIE, "", { ...stateCookieOptions, maxAge: 0 });
  return response;
}

import { NextResponse, type NextRequest } from "next/server";
import { fetchYahooGuid } from "@/lib/yahoo/identity";
import { YahooOAuthError, refreshTokens, yahooConfig } from "@/lib/yahoo/oauth";
import {
  SESSION_COOKIE,
  needsRefresh,
  sealSession,
  sessionCookieOptions,
  sessionFromTokens,
  unsealSession,
  type YahooSession,
} from "@/lib/yahoo/session";

/**
 * Keeps the Yahoo session complete before a page renders. Server Components
 * can read cookies but not write them, so it's done here:
 * - Refreshes the 1-hour access token when it's about to expire.
 * - Fills in the Yahoo user ID if the session lacks it (one call, then it's
 *   stored), since saved data in the database is keyed by it.
 * The updated session goes to the page being rendered (request cookie) and
 * back to the browser (response cookie).
 */
export async function proxy(request: NextRequest) {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!value) return NextResponse.next();

  const session = await unsealSession(value);
  if (!session) return signedOut(request);

  if (!needsRefresh(session)) {
    if (session.guid) return NextResponse.next();
    const guid = await fetchYahooGuid(session.accessToken);
    // If Yahoo didn't answer, carry on and try again on the next request.
    return guid ? withSession(request, { ...session, guid }) : NextResponse.next();
  }

  try {
    const tokens = await refreshTokens(yahooConfig(request.nextUrl.origin), session.refreshToken);
    const next = sessionFromTokens(tokens, session);
    next.guid ??= await fetchYahooGuid(next.accessToken);
    return withSession(request, next);
  } catch (error) {
    // Yahoo rejected the refresh token (revoked, password changed): sign out.
    if (error instanceof YahooOAuthError && error.status >= 400 && error.status < 500) {
      return signedOut(request);
    }
    // Network blip or Yahoo outage: keep the session and try again next request.
    return NextResponse.next();
  }
}

async function withSession(request: NextRequest, session: YahooSession) {
  const sealed = await sealSession(session);
  request.cookies.set(SESSION_COOKIE, sealed);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions);
  return response;
}

function signedOut(request: NextRequest) {
  request.cookies.delete(SESSION_COOKIE);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only, and only for visitors who have a Yahoo session cookie.
      source: "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
      has: [{ type: "cookie", key: "fsh_yahoo" }],
    },
  ],
};

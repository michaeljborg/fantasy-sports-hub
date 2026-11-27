import { NextResponse, type NextRequest } from "next/server";
import { YahooOAuthError, refreshTokens, yahooConfig } from "@/lib/yahoo/oauth";
import {
  SESSION_COOKIE,
  needsRefresh,
  sealSession,
  sessionCookieOptions,
  sessionFromTokens,
  unsealSession,
} from "@/lib/yahoo/session";

/**
 * Keeps the Yahoo access token fresh. Server Components can't write cookies,
 * so when the 1-hour token is about to expire we refresh it here and pass the
 * new session both to the page being rendered (request cookie) and back to the
 * browser (response cookie).
 */
export async function proxy(request: NextRequest) {
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!value) return NextResponse.next();

  const session = await unsealSession(value);
  if (!session) return signedOut(request);
  if (!needsRefresh(session)) return NextResponse.next();

  try {
    const tokens = await refreshTokens(yahooConfig(request.nextUrl.origin), session.refreshToken);
    const sealed = await sealSession(sessionFromTokens(tokens, session));
    request.cookies.set(SESSION_COOKIE, sealed);
    const response = NextResponse.next({ request: { headers: request.headers } });
    response.cookies.set(SESSION_COOKIE, sealed, sessionCookieOptions);
    return response;
  } catch (error) {
    // Yahoo rejected the refresh token (revoked, password changed): sign out.
    if (error instanceof YahooOAuthError && error.status >= 400 && error.status < 500) {
      return signedOut(request);
    }
    // Network blip or Yahoo outage: keep the session and try again next request.
    return NextResponse.next();
  }
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

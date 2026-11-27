/**
 * The Yahoo session lives in one encrypted, httpOnly cookie, so it works the
 * same locally and on Vercel and needs no database. Each browser holds its own
 * session, so league mates can sign in later without changes here.
 *
 * Tokens are refreshed in `src/proxy.ts` before a page renders, because
 * Server Components can read cookies but can't write them.
 */
import { cookies } from "next/headers";
import { seal, unseal } from "./crypto";
import type { TokenResponse } from "./oauth";

export const SESSION_COOKIE = "fsh_yahoo";
export const STATE_COOKIE = "fsh_yahoo_state";

/** Refresh this long before Yahoo's 1-hour access token actually expires. */
const REFRESH_MARGIN_MS = 2 * 60 * 1000;

export type YahooSession = {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms */
  expiresAt: number;
  guid?: string;
  name?: string;
};

export const sessionCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  // The refresh token is long-lived; keep the cookie for 60 days.
  maxAge: 60 * 60 * 24 * 60,
};

export const stateCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/api/auth/yahoo",
  maxAge: 10 * 60,
};

/** Reads name/guid out of an OpenID id_token, if Yahoo sent one. */
function decodeIdToken(idToken?: string): { sub?: string; name?: string; given_name?: string } {
  const payload = idToken?.split(".")[1];
  if (!payload) return {};
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

export function sessionFromTokens(tokens: TokenResponse, previous?: YahooSession): YahooSession {
  const id = decodeIdToken(tokens.id_token);
  return {
    accessToken: tokens.access_token,
    // Yahoo may rotate the refresh token; always keep the newest one.
    refreshToken: tokens.refresh_token || previous?.refreshToken || "",
    expiresAt: Date.now() + tokens.expires_in * 1000,
    guid: id.sub ?? tokens.xoauth_yahoo_guid ?? previous?.guid,
    name: id.name ?? id.given_name ?? previous?.name,
  };
}

export function needsRefresh(session: YahooSession) {
  return Date.now() > session.expiresAt - REFRESH_MARGIN_MS;
}

export const sealSession = (session: YahooSession) => seal(session);
export const unsealSession = (value: string) => unseal<YahooSession>(value);

/** The current visitor's Yahoo session, or null when signed out. */
export async function getSession(): Promise<YahooSession | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? unsealSession(value) : null;
}

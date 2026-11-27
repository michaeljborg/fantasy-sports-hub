/**
 * Yahoo OAuth 2.0 (authorization code flow).
 * Docs: https://developer.yahoo.com/oauth2/guide/flows_authcode/
 */
const AUTHORIZE_URL = "https://api.login.yahoo.com/oauth2/request_auth";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";

export const CALLBACK_PATH = "/api/auth/yahoo/callback";

export type YahooConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  /** Seconds; Yahoo issues 3600 */
  expires_in: number;
  token_type: string;
  /** Deprecated by Yahoo but still sent */
  xoauth_yahoo_guid?: string;
  /** Only present when OpenID scopes are granted */
  id_token?: string;
};

export class YahooOAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Yahoo's `error` code, e.g. "invalid_grant" */
    readonly code?: string,
  ) {
    super(message);
    this.name = "YahooOAuthError";
  }
}

/**
 * Reads credentials from the environment. The redirect URI falls back to this
 * app's own callback on the current origin, but it must exactly match one
 * registered on the Yahoo app.
 */
export function yahooConfig(origin: string): YahooConfig {
  const clientId = process.env.YAHOO_CLIENT_ID;
  const clientSecret = process.env.YAHOO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET must be set in .env.local");
  }
  const redirectUri = process.env.YAHOO_REDIRECT_URI || `${origin}${CALLBACK_PATH}`;
  return { clientId, clientSecret, redirectUri };
}

export function authorizeUrl(config: YahooConfig, state: string) {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  return url;
}

async function requestToken(config: YahooConfig, params: Record<string, string>) {
  const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ redirect_uri: config.redirectUri, ...params }),
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as Partial<TokenResponse> & {
    error?: string;
    error_description?: string;
  };
  if (!res.ok || !body.access_token || !body.refresh_token) {
    throw new YahooOAuthError(
      body.error_description || body.error || `Token request failed (${res.status})`,
      res.status,
      body.error,
    );
  }
  return body as TokenResponse;
}

export function exchangeCode(config: YahooConfig, code: string) {
  return requestToken(config, { grant_type: "authorization_code", code });
}

export function refreshTokens(config: YahooConfig, refreshToken: string) {
  return requestToken(config, { grant_type: "refresh_token", refresh_token: refreshToken });
}

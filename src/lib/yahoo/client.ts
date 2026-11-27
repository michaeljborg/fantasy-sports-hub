/**
 * Thin, read-only client for the Yahoo Fantasy Sports API.
 * Docs: https://sports.yahoo.com/developer/docs/
 */
import { getSession } from "./session";

const BASE_URL = "https://fantasysports.yahooapis.com/fantasy/v2";

export class YahooAuthError extends Error {
  constructor(message = "Not signed in to Yahoo") {
    super(message);
    this.name = "YahooAuthError";
  }
}

export class YahooApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "YahooApiError";
  }
}

/**
 * GETs a Fantasy API path such as `/users;use_login=1/games` and returns the
 * `fantasy_content` payload. Use the helpers in `./parse` to flatten it.
 */
export async function yahooGet(path: string): Promise<Record<string, unknown>> {
  const session = await getSession();
  if (!session) throw new YahooAuthError();

  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}format=json`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  if (res.status === 401) throw new YahooAuthError("Your Yahoo session has expired");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new YahooApiError(`Yahoo API ${res.status} for ${path}: ${text.slice(0, 300)}`, res.status);
  }

  const body = (await res.json()) as { fantasy_content?: Record<string, unknown> };
  if (!body.fantasy_content) throw new YahooApiError(`Unexpected Yahoo response for ${path}`, res.status);
  return body.fantasy_content;
}

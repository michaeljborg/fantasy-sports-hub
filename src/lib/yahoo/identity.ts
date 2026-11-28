import { fields, list, str } from "./parse";

const USER_URL = "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json";

/**
 * The signed-in user's Yahoo GUID, from the Fantasy API. The token response's
 * `xoauth_yahoo_guid` is deprecated (and often missing), and the OpenID
 * `id_token` needs an OpenID scope this app doesn't request, so ask the API.
 * Takes the token directly because it runs in sign-in and the proxy, before a
 * session cookie exists. Returns undefined on any failure.
 */
export async function fetchYahooGuid(accessToken: string): Promise<string | undefined> {
  if (process.env.NODE_ENV === "development") console.log("Yahoo GET /users;use_login=1 (user ID for saved data)");
  try {
    const res = await fetch(USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const body = (await res.json()) as { fantasy_content?: { users?: unknown } };
    const user = list(body.fantasy_content?.users, "user")[0];
    return str(fields(user).guid) || undefined;
  } catch {
    return undefined;
  }
}

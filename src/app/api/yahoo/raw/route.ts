import type { NextRequest } from "next/server";
import { YahooApiError, YahooAuthError, yahooGet } from "@/lib/yahoo/client";

/**
 * DEV ONLY. Returns the raw Yahoo response for a Fantasy API path, so field
 * names can be checked against real data (Yahoo's docs are incomplete):
 *   /api/yahoo/raw?path=/team/466.l.12345.t.3/roster/players/stats
 * Uses your own Yahoo session. Returns 404 in production builds.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });

  const path = request.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith("/")) {
    return new Response("Pass ?path=/… e.g. ?path=/users;use_login=1/games", { status: 400 });
  }

  try {
    return Response.json(await yahooGet(path));
  } catch (error) {
    const status = error instanceof YahooAuthError ? 401 : error instanceof YahooApiError ? error.status : 500;
    return new Response((error as Error).message, { status });
  }
}

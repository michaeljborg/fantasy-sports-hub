/**
 * Data loaders for My Teams pages. Each one is `use cache: private`: it can
 * read the session cookie, and its result is kept in the visitor's browser
 * (never on the server) for 5 minutes. Together with `<Link prefetch={true}>`
 * on links into My Teams, that lets the router load a team's page ahead of the
 * click, so opening a team or switching tabs shows it immediately.
 *
 * Results are plain data (no Error objects) so they can be cached. Each also
 * reports when its Yahoo data was fetched (`fetchedAt`), for the DataAge line.
 */
import { cacheLife } from "next/cache";
import { fallbackTo, rethrowNextErrors } from "@/lib/next-errors";
import { getMyTeams } from "@/lib/yahoo/api";
import { YahooAuthError } from "@/lib/yahoo/client";
import { getSession } from "@/lib/yahoo/session";
import { dataAge, scopeToTeam } from "@/lib/yahoo/snapshots";
import {
  currentWeekOf,
  getActivity,
  getDraft,
  getLeague,
  getRoster,
  getSeasonStats,
  getTeamDetails,
  getThisWeek,
} from "@/lib/yahoo/team";

/** Browser lifetime for loaded pages; at least 30s is needed for prefetching to work. */
const STALE_SECONDS = 300;

export type Problem = { expired: boolean; message: string };

export type Loaded<T> =
  | { status: "ok"; data: T; fetchedAt?: string }
  | { status: "signed-out" }
  | { status: "error"; problem: Problem };

export function toProblem(error: unknown): Problem {
  return {
    expired: error instanceof YahooAuthError,
    message: error instanceof Error ? error.message : String(error),
  };
}

async function load<T>(teamKey: string, leagueKey: string, read: () => Promise<T>): Promise<Loaded<T>> {
  if (!(await getSession())) return { status: "signed-out" };
  // All saved data for this team comes back in one database query.
  scopeToTeam(teamKey, leagueKey);
  try {
    const data = await read();
    return { status: "ok", data, fetchedAt: dataAge()?.toISOString() };
  } catch (error) {
    rethrowNextErrors(error);
    return { status: "error", problem: toProblem(error) };
  }
}

/** The team in the URL and all your teams (header and switcher); null if it isn't yours. */
export async function loadTeamHeader(teamKey: string, leagueKey: string) {
  "use cache: private";
  cacheLife({ stale: STALE_SECONDS });
  return load(teamKey, leagueKey, async () => {
    const teams = await getMyTeams();
    const team = teams.find((t) => t.teamKey === teamKey);
    return team ? { team, teams } : null;
  });
}

export async function loadOverview(teamKey: string, leagueKey: string) {
  "use cache: private";
  cacheLife({ stale: STALE_SECONDS });
  return load(teamKey, leagueKey, async () => {
    const league = await getLeague(leagueKey);
    const week = currentWeekOf(league);
    const [details, season, thisWeek] = await Promise.all([
      getTeamDetails(teamKey, league.sport),
      // Optional extras: the page still renders if either is rejected.
      getSeasonStats(league, teamKey).catch(fallbackTo(null)),
      week ? getThisWeek(teamKey, week, league.sport).catch(fallbackTo(null)) : null,
    ]);
    return { league, details, season, thisWeek };
  });
}

export async function loadRoster(teamKey: string, leagueKey: string) {
  "use cache: private";
  cacheLife({ stale: STALE_SECONDS });
  return load(teamKey, leagueKey, async () => {
    const [league, players] = await Promise.all([getLeague(leagueKey), getRoster(teamKey)]);
    return { league, players };
  });
}

export async function loadDraft(teamKey: string, leagueKey: string) {
  "use cache: private";
  cacheLife({ stale: STALE_SECONDS });
  return load(teamKey, leagueKey, async () => {
    // The league comes first: its sport sets when the weekly data is due.
    const league = await getLeague(leagueKey);
    const [details, picks, roster] = await Promise.all([
      getTeamDetails(teamKey, league.sport),
      getDraft(teamKey, leagueKey, league.sport),
      // Only used for the "On roster" markers.
      getRoster(teamKey).catch(fallbackTo([])),
    ]);
    return { league, details, picks, rosterKeys: roster.map((p) => p.playerKey) };
  });
}

export async function loadActivity(teamKey: string, leagueKey: string) {
  "use cache: private";
  cacheLife({ stale: STALE_SECONDS });
  return load(teamKey, leagueKey, () => getActivity(teamKey, leagueKey));
}

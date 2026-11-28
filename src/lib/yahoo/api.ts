/**
 * Typed reads from the Yahoo Fantasy API, mapped to this app's shapes.
 * More endpoints (scoreboard, roster, free agents, transactions) get added
 * here as each feature moves off mock data.
 */
import { cache } from "react";
import type { SportId } from "@/lib/fantasy/types";
import { yahooGet } from "./client";
import { fields, list, num, str } from "./parse";
import { cached } from "./snapshots";

/** Yahoo game codes for the sports this app supports. */
export const SPORT_BY_GAME_CODE: Record<string, SportId> = {
  nba: "basketball",
  nfl: "football",
  nhl: "hockey",
};

export type YahooTeam = {
  /** e.g. "466.l.12345.t.3" */
  teamKey: string;
  teamName: string;
  teamUrl?: string;
  /** e.g. "466.l.12345" */
  leagueKey: string;
  leagueName: string;
  sport: SportId;
  season: string;
  /** The signed-in user's manager nickname on this team */
  managerName?: string;
  logoUrl?: string;
  leagueSize?: number;
  /** Current league rank; missing before the season starts */
  rank?: number;
  record?: { w: number; l: number; t: number };
};

type Standing = Pick<YahooTeam, "rank" | "record">;

/**
 * Rank and W-L-T for each team. Best effort: if Yahoo rejects the request,
 * the teams are still shown, just without standings.
 */
async function getStandings(teamKeys: string[]): Promise<Map<string, Standing>> {
  const standings = new Map<string, Standing>();
  if (teamKeys.length === 0) return standings;
  try {
    const content = await yahooGet(`/teams;team_keys=${teamKeys.join(",")}/standings`);
    for (const team of list(content.teams, "team").map(fields)) {
      const key = str(team.team_key);
      const s = fields(team.team_standings);
      const totals = fields(s.outcome_totals);
      const w = num(totals.wins);
      if (!key) continue;
      standings.set(key, {
        rank: num(s.rank),
        record: w === undefined ? undefined : { w, l: num(totals.losses) ?? 0, t: num(totals.ties) ?? 0 },
      });
    }
  } catch {
    // Standings are optional.
  }
  return standings;
}

const leagueKeyOf = (teamKey: string) => teamKey.replace(/\.t\.\d+$/, "");

/** Each `game` in a user's games collection, with its metadata and sub-collection. */
function userGames(content: Record<string, unknown>) {
  const user = list(content.users, "user")[0];
  return list(fields(user).games, "game").map(fields);
}

/** Fetches the team list from Yahoo (3 requests). Use getMyTeams(), which saves it. */
async function fetchMyTeams(): Promise<YahooTeam[]> {
  const gameKeys = Object.keys(SPORT_BY_GAME_CODE).join(",");
  const [teamsContent, leaguesContent] = await Promise.all([
    yahooGet(`/users;use_login=1/games;game_keys=${gameKeys}/teams`),
    yahooGet(`/users;use_login=1/games;game_keys=${gameKeys}/leagues`),
  ]);

  const leagues = new Map<string, { name: string; size?: number }>();
  for (const game of userGames(leaguesContent)) {
    for (const league of list(game.leagues, "league").map(fields)) {
      const key = str(league.league_key);
      if (key) leagues.set(key, { name: str(league.name) ?? key, size: num(league.num_teams) });
    }
  }

  const teams: YahooTeam[] = [];
  for (const game of userGames(teamsContent)) {
    const sport = SPORT_BY_GAME_CODE[str(game.code) ?? ""];
    if (!sport) continue;
    for (const team of list(game.teams, "team").map(fields)) {
      const teamKey = str(team.team_key);
      if (!teamKey) continue;
      const me = list(team.managers, "manager")
        .map(fields)
        .find((m) => str(m.is_current_login) === "1");
      const leagueKey = leagueKeyOf(teamKey);
      const logo = list(team.team_logos, "team_logo").map(fields)[0];
      teams.push({
        teamKey,
        teamName: str(team.name) ?? teamKey,
        teamUrl: str(team.url),
        leagueKey,
        leagueName: leagues.get(leagueKey)?.name ?? leagueKey,
        leagueSize: leagues.get(leagueKey)?.size,
        sport,
        season: str(game.season) ?? "",
        managerName: str(me?.nickname),
        logoUrl: str(logo?.url),
      });
    }
  }

  const standings = await getStandings(teams.map((t) => t.teamKey));
  return teams.map((team) => ({ ...team, ...standings.get(team.teamKey) }));
}

/**
 * Every current-season team the signed-in user manages in basketball,
 * football and hockey. Saved weekly (see ./snapshots): it refreshes after the
 * latest week cutoff among the sports you play. Cached per request too, so the
 * layout and page share one read.
 */
export const getMyTeams = cache(() =>
  cached(
    {
      kind: "teams",
      key: "",
      tier: "weekly",
      sportOf: (teams: YahooTeam[]) => [...new Set(teams.map((t) => t.sport))],
      // The header's team list shouldn't set the page's "data from" time.
      trackAge: false,
    },
    fetchMyTeams,
  ),
);

/**
 * Typed reads from the Yahoo Fantasy API, mapped to this app's shapes.
 * More endpoints (scoreboard, roster, free agents, transactions) get added
 * here as each feature moves off mock data.
 */
import type { SportId } from "@/lib/fantasy/types";
import { yahooGet } from "./client";
import { fields, list, str } from "./parse";

/** Yahoo game codes for the sports this app supports. */
const SPORT_BY_GAME_CODE: Record<string, SportId> = {
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
};

const leagueKeyOf = (teamKey: string) => teamKey.replace(/\.t\.\d+$/, "");

/** Each `game` in a user's games collection, with its metadata and sub-collection. */
function userGames(content: Record<string, unknown>) {
  const user = list(content.users, "user")[0];
  return list(fields(user).games, "game").map(fields);
}

/**
 * Every current-season team the signed-in user manages in basketball,
 * football and hockey, with its league name.
 */
export async function getMyTeams(): Promise<YahooTeam[]> {
  const gameKeys = Object.keys(SPORT_BY_GAME_CODE).join(",");
  const [teamsContent, leaguesContent] = await Promise.all([
    yahooGet(`/users;use_login=1/games;game_keys=${gameKeys}/teams`),
    yahooGet(`/users;use_login=1/games;game_keys=${gameKeys}/leagues`),
  ]);

  const leagueNames = new Map<string, string>();
  for (const game of userGames(leaguesContent)) {
    for (const league of list(game.leagues, "league").map(fields)) {
      const key = str(league.league_key);
      if (key) leagueNames.set(key, str(league.name) ?? key);
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
      teams.push({
        teamKey,
        teamName: str(team.name) ?? teamKey,
        teamUrl: str(team.url),
        leagueKey,
        leagueName: leagueNames.get(leagueKey) ?? leagueKey,
        sport,
        season: str(game.season) ?? "",
        managerName: str(me?.nickname),
      });
    }
  }
  return teams;
}

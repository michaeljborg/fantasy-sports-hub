/**
 * Everything the matchup dashboard renders comes through here, per team.
 * Today it reads mock fixtures; swap them for the scraper later.
 */
import { notFound } from "next/navigation";
import { activeByDay, compareAll, gamesFrom, score } from "./analysis";
import * as mock from "./mock-basketball";
import { BASKETBALL_STARTING_SLOTS, basketballCategories } from "./sports";
import { getUserTeam } from "./teams";

/** Returns null for a team the user doesn't have. */
export function getDashboard(teamId: string) {
  const team = getUserTeam(teamId);
  const data = mock.fixtures[teamId];
  if (!team || !data) return null;

  const categories = basketballCategories;
  const week = mock.week;
  const today = week.today;
  const slots = BASKETBALL_STARTING_SLOTS;
  const results = compareAll(categories, data.matchup.totals.me, data.matchup.totals.opponent);
  const active = activeByDay(data.roster, week.days.length);

  /** Close categories are the ones a streamer can swing. */
  const flipKeys = results.filter((r) => r.outcome === "close").map((r) => r.category.key);

  // Placeholder fit score: helps a flippable cat (x2), plus games left this week.
  const freeAgents = data.freeAgents
    .map((fa) => {
      const gamesLeft = fa.games.filter((d) => d >= today).length;
      const flipHelps = fa.helps.filter((k) => flipKeys.includes(k));
      return { ...fa, gamesLeft, flipHelps, fit: flipHelps.length * 2 + gamesLeft };
    })
    .sort((a, b) => b.fit - a.fit);

  return {
    team,
    sport: team.sport,
    categories,
    week,
    roster: data.roster,
    matchup: data.matchup,
    results,
    score: score(results),
    gamesLeft: {
      me: gamesFrom(data.roster, today),
      opponent: data.matchup.opponentGamesLeft,
    },
    slots,
    active,
    decisionDays: active
      .map((n, day) => ({ day, n }))
      .filter(({ day, n }) => day >= today && n > slots),
    flipKeys,
    seasonRanks: data.seasonRanks,
    leagueSize: data.leagueSize,
    freeAgents,
    tradeTargets: data.tradeTargets,
  };
}

export type Dashboard = NonNullable<ReturnType<typeof getDashboard>>;

/** For pages under /weekly-matchup/[team]: the dashboard, or a 404. */
export async function loadDashboard(params: Promise<{ team: string }>) {
  const { team } = await params;
  return getDashboard(team) ?? notFound();
}

/** Team name for menus, without building the whole dashboard. */
export function teamName(teamId: string) {
  return mock.fixtures[teamId]?.matchup.me.name ?? teamId;
}

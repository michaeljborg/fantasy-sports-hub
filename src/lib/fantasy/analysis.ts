import type { Category, Player, StatLine } from "./types";

export type Outcome = "winning" | "close" | "losing";

export type CategoryResult = {
  category: Category;
  mine: number;
  opp: number;
  outcome: Outcome;
  /** 1 ahead, -1 behind, 0 tied */
  lead: 1 | 0 | -1;
  /** Absolute gap between the teams */
  gap: number;
  /** 0–1, how much of the bar is yours (0.5 = even) */
  share: number;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function compareCategory(
  category: Category,
  mine: number,
  opp: number,
): CategoryResult {
  const sign = category.lowerIsBetter ? -1 : 1;
  const diff = (mine - opp) * sign;
  const lead = diff > 0 ? 1 : diff < 0 ? -1 : 0;
  const gap = Math.abs(mine - opp);
  const outcome: Outcome =
    gap <= category.closeMargin ? "close" : lead > 0 ? "winning" : "losing";

  let share: number;
  if (category.format === "pct") {
    share = 0.5 + diff * 8;
  } else {
    const total = mine + opp || 1;
    share = (category.lowerIsBetter ? opp : mine) / total;
  }

  return { category, mine, opp, outcome, lead, gap, share: clamp(share, 0.06, 0.94) };
}

export function compareAll(
  categories: Category[],
  me: StatLine,
  opponent: StatLine,
) {
  return categories.map((c) => compareCategory(c, me[c.key], opponent[c.key]));
}

export function score(results: CategoryResult[]) {
  return {
    wins: results.filter((r) => r.lead === 1).length,
    losses: results.filter((r) => r.lead === -1).length,
    ties: results.filter((r) => r.lead === 0).length,
  };
}

/** Players with a game each day, excluding anyone ruled out. */
export function activeByDay(players: Player[], days: number) {
  return Array.from(
    { length: days },
    (_, day) =>
      players.filter((p) => p.status !== "out" && p.games.includes(day)).length,
  );
}

export type Tier = "strong" | "middle" | "weak";

/** League thirds: in a 12-team league, 1–4 strong, 5–8 middle, 9–12 weak. */
export function rankTier(rank: number, leagueSize: number): Tier {
  const third = leagueSize / 3;
  if (rank <= third) return "strong";
  if (rank > leagueSize - third) return "weak";
  return "middle";
}

export type DayCall = "sit" | "full" | "open";

export function dayCall(active: number, slots: number): DayCall {
  if (active > slots) return "sit";
  if (active < slots) return "open";
  return "full";
}

export function gamesFrom(players: Player[], fromDay: number) {
  return players
    .filter((p) => p.status !== "out")
    .reduce((sum, p) => sum + p.games.filter((d) => d >= fromDay).length, 0);
}

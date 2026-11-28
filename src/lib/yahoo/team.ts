/**
 * Reads for one team and its league, used by the My Teams app. Read-only.
 *
 * Yahoo's docs only show 2019 XML samples, so every field is optional and
 * parsed defensively. Use /api/yahoo/raw in dev to check real responses.
 * Each function is wrapped in React `cache()`, so a layout and page rendering
 * in the same request share one Yahoo call.
 */
import { cache } from "react";
import type { SportId } from "@/lib/fantasy/types";
import { SPORT_BY_GAME_CODE } from "./api";
import { YahooApiError, yahooGet } from "./client";
import { child, fields, flag, list, num, str } from "./parse";

type Obj = Record<string, unknown>;
export type Record3 = { w: number; l: number; t: number };

// ---------------------------------------------------------------------------
// League: settings, scoring categories and standings
// ---------------------------------------------------------------------------

export type StatCategory = {
  id: string;
  /** Short label, e.g. "FG%" */
  label: string;
  name: string;
  higherIsBetter: boolean;
  /** "P" (players / skaters), "G" (goalies), "O"/"K"/"DT" (football), … */
  positionTypes: string[];
};

export type StandingRow = {
  teamKey: string;
  name: string;
  logoUrl?: string;
  manager?: string;
  rank?: number;
  playoffSeed?: number;
  record?: Record3;
  winPct?: number;
  /** e.g. "W3" */
  streak?: string;
  pointsFor?: number;
  pointsAgainst?: number;
  clinchedPlayoffs: boolean;
};

export type LeagueInfo = {
  leagueKey: string;
  name: string;
  url?: string;
  sport?: SportId;
  season?: string;
  numTeams?: number;
  currentWeek?: number;
  startWeek?: number;
  endWeek?: number;
  /** "head" (H2H categories), "headpoint" (H2H points), "point", "roto" */
  scoringType?: string;
  draftStatus?: string;
  isFinished: boolean;
  settings: {
    draftType?: string;
    isAuction: boolean;
    usesPlayoff: boolean;
    playoffStartWeek?: number;
    numPlayoffTeams?: number;
    waiverType?: string;
    usesFaab: boolean;
    tradeEndDate?: string;
    tradeRatifyType?: string;
  };
  /** Scoring categories only (display-only stats like FGM/A are left out) */
  categories: StatCategory[];
  standings: StandingRow[];
};

export const isPointsLeague = (league: LeagueInfo) =>
  league.scoringType === "point" || league.scoringType === "headpoint";
export const isHeadToHead = (league: LeagueInfo) =>
  league.scoringType === "head" || league.scoringType === "headpoint";

function logoOf(team: Obj) {
  return str(fields(list(team.team_logos, "team_logo")[0]).url);
}

function managerOf(team: Obj) {
  return str(fields(list(team.managers, "manager")[0]).nickname);
}

function parseCategories(settings: Obj): StatCategory[] {
  return list(fields(settings.stat_categories).stats, "stat")
    .map(fields)
    .filter((s) => !flag(s.is_only_display_stat) && str(s.enabled) !== "0")
    .map((s) => {
      const types = list(s.stat_position_types, "stat_position_type")
        .map((t) => str(fields(t).position_type))
        .filter((t): t is string => !!t);
      const own = str(s.position_type);
      return {
        id: str(s.stat_id) ?? "",
        label: str(s.display_name) ?? str(s.name) ?? "",
        name: str(s.name) ?? str(s.display_name) ?? "",
        higherIsBetter: str(s.sort_order) !== "0",
        positionTypes: types.length ? types : own ? [own] : [],
      };
    })
    .filter((c) => c.id);
}

function parseStanding(team: Obj): StandingRow {
  const s = fields(team.team_standings);
  const totals = fields(s.outcome_totals);
  const streak = fields(s.streak);
  const w = num(totals.wins);
  const streakType = str(streak.type);
  const streakValue = num(streak.value);
  return {
    teamKey: str(team.team_key) ?? "",
    name: str(team.name) ?? "",
    logoUrl: logoOf(team),
    manager: managerOf(team),
    rank: num(s.rank),
    playoffSeed: num(s.playoff_seed),
    record: w === undefined ? undefined : { w, l: num(totals.losses) ?? 0, t: num(totals.ties) ?? 0 },
    winPct: num(totals.percentage),
    streak:
      streakType && streakValue
        ? `${streakType === "win" ? "W" : streakType === "loss" ? "L" : "T"}${streakValue}`
        : undefined,
    pointsFor: num(s.points_for),
    pointsAgainst: num(s.points_against),
    clinchedPlayoffs: flag(team.clinched_playoffs),
  };
}

export const getLeague = cache(async (leagueKey: string): Promise<LeagueInfo> => {
  const content = await yahooGet(`/league/${leagueKey};out=settings,standings`);
  const league = fields(content.league);
  const settings = fields(league.settings);
  const standings = list(fields(league.standings).teams, "team").map(fields).map(parseStanding);
  standings.sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

  return {
    leagueKey,
    name: str(league.name) ?? leagueKey,
    url: str(league.url),
    sport: SPORT_BY_GAME_CODE[str(league.game_code) ?? ""],
    season: str(league.season),
    numTeams: num(league.num_teams),
    currentWeek: num(league.current_week),
    startWeek: num(league.start_week),
    endWeek: num(league.end_week),
    scoringType: str(league.scoring_type) ?? str(settings.scoring_type),
    draftStatus: str(league.draft_status),
    isFinished: flag(league.is_finished),
    settings: {
      draftType: str(settings.draft_type),
      isAuction: flag(settings.is_auction_draft),
      usesPlayoff: flag(settings.uses_playoff),
      playoffStartWeek: num(settings.playoff_start_week),
      numPlayoffTeams: num(settings.num_playoff_teams),
      waiverType: str(settings.waiver_type),
      usesFaab: flag(settings.uses_faab),
      tradeEndDate: str(settings.trade_end_date),
      tradeRatifyType: str(settings.trade_ratify_type),
    },
    categories: parseCategories(settings),
    standings,
  };
});

// ---------------------------------------------------------------------------
// Season stats: every team's totals, ranked per category
// ---------------------------------------------------------------------------

export type CategoryStat = {
  category: StatCategory;
  /** Yahoo's display value, e.g. ".475" or "312" */
  value: string;
  rank?: number;
  of: number;
};

export type SeasonStats = { categories: CategoryStat[]; points?: number; pointsRank?: number; of: number };

type TeamTotals = { stats: Record<string, string>; points?: number };

const statsOf = (node: unknown) =>
  Object.fromEntries(
    list(fields(node).stats, "stat")
      .map(fields)
      .map((s) => [str(s.stat_id) ?? "", str(s.value) ?? ""] as const)
      .filter(([id]) => id),
  );

const getLeagueTeamTotals = cache(async (leagueKey: string) => {
  const content = await yahooGet(`/league/${leagueKey}/teams/stats`);
  const totals = new Map<string, TeamTotals>();
  for (const team of list(fields(content.league).teams, "team").map(fields)) {
    const key = str(team.team_key);
    if (key) totals.set(key, { stats: statsOf(team.team_stats), points: num(fields(team.team_points).total) });
  }
  return totals;
});

/** Standard competition ranking (1, 2, 2, 4) among the values that parse as numbers. */
function rankOf(mine: number | undefined, all: number[], higherIsBetter: boolean) {
  if (mine === undefined) return undefined;
  return 1 + all.filter((v) => (higherIsBetter ? v > mine : v < mine)).length;
}

export async function getSeasonStats(league: LeagueInfo, teamKey: string): Promise<SeasonStats> {
  const totals = await getLeagueTeamTotals(league.leagueKey);
  const mine = totals.get(teamKey);
  const others = [...totals.values()];
  const of = totals.size;

  const categories = league.categories
    .filter((c) => mine?.stats[c.id] !== undefined)
    .map((category) => {
      const all = others.map((t) => num(t.stats[category.id])).filter((v): v is number => v !== undefined);
      return {
        category,
        value: mine!.stats[category.id],
        rank: rankOf(num(mine!.stats[category.id]), all, category.higherIsBetter),
        of,
      };
    });

  const allPoints = others.map((t) => t.points).filter((v): v is number => v !== undefined);
  return {
    categories,
    points: mine?.points,
    pointsRank: rankOf(mine?.points, allPoints, true),
    of,
  };
}

// ---------------------------------------------------------------------------
// Team details (waivers, moves, draft grade)
// ---------------------------------------------------------------------------

export type TeamDetails = {
  url?: string;
  waiverPriority?: number;
  faabBalance?: number;
  moves?: number;
  trades?: number;
  rosterAdds?: { value: number; coverage?: string; period?: string };
  clinchedPlayoffs: boolean;
  draftPosition?: number;
  draftGrade?: string;
  draftRecapUrl?: string;
  managers: { name: string; isCommissioner: boolean; isMe: boolean }[];
};

export const getTeamDetails = cache(async (teamKey: string): Promise<TeamDetails> => {
  const team = fields((await yahooGet(`/team/${teamKey}`)).team);
  const adds = fields(team.roster_adds);
  const addsValue = num(adds.value);
  return {
    url: str(team.url),
    waiverPriority: num(team.waiver_priority),
    faabBalance: num(team.faab_balance),
    moves: num(team.number_of_moves),
    trades: num(team.number_of_trades),
    rosterAdds:
      addsValue === undefined
        ? undefined
        : { value: addsValue, coverage: str(adds.coverage_type), period: str(adds.coverage_value) },
    clinchedPlayoffs: flag(team.clinched_playoffs),
    draftPosition: num(team.draft_position),
    draftGrade: flag(team.has_draft_grade) ? str(team.draft_grade) : undefined,
    draftRecapUrl: str(team.draft_recap_url),
    managers: list(team.managers, "manager")
      .map(fields)
      .map((m) => ({
        name: str(m.nickname) ?? "",
        isCommissioner: flag(m.is_commissioner),
        isMe: flag(m.is_current_login),
      }))
      .filter((m) => m.name),
  };
});

// ---------------------------------------------------------------------------
// This week's opponent (no scores: those belong to Weekly Matchup)
// ---------------------------------------------------------------------------

export type ThisWeek = {
  week: number;
  weekStart?: string;
  weekEnd?: string;
  isPlayoffs: boolean;
  opponent: { teamKey: string; name: string; logoUrl?: string; manager?: string };
};

export const getThisWeek = cache(async (teamKey: string, week: number): Promise<ThisWeek | null> => {
  const team = fields((await yahooGet(`/team/${teamKey}/matchups;weeks=${week}`)).team);
  const matchup = fields(list(team.matchups, "matchup")[0]);
  const opponent = list(child(matchup, "teams"), "team")
    .map(fields)
    .find((t) => str(t.team_key) && str(t.team_key) !== teamKey);
  if (!opponent) return null;
  return {
    week: num(matchup.week) ?? week,
    weekStart: str(matchup.week_start),
    weekEnd: str(matchup.week_end),
    isPlayoffs: flag(matchup.is_playoffs),
    opponent: {
      teamKey: str(opponent.team_key)!,
      name: str(opponent.name) ?? "",
      logoUrl: logoOf(opponent),
      manager: managerOf(opponent),
    },
  };
});

// ---------------------------------------------------------------------------
// Roster
// ---------------------------------------------------------------------------

export type RosterPlayer = {
  playerKey: string;
  name: string;
  /** NBA/NFL/NHL team abbreviation */
  proTeam?: string;
  positions?: string;
  eligible: string[];
  /** Roster slot, e.g. "PG", "BN", "IL" */
  slot?: string;
  /** Yahoo injury code, e.g. "O", "GTD", "INJ", "IL" */
  status?: string;
  statusFull?: string;
  injuryNote?: string;
  headshotUrl?: string;
  /** "P", "G", "O", "K", "DT", … matches StatCategory.positionTypes */
  positionType?: string;
  stats: Record<string, string>;
  points?: number;
};

function parsePlayer(p: Obj): RosterPlayer {
  return {
    playerKey: str(p.player_key) ?? "",
    name: str(fields(p.name).full) ?? "",
    proTeam: str(p.editorial_team_abbr),
    positions: str(p.display_position),
    eligible: list(p.eligible_positions, "position").map(str).filter((s): s is string => !!s),
    slot: str(fields(p.selected_position).position),
    status: str(p.status) || undefined,
    statusFull: str(p.status_full),
    injuryNote: str(p.injury_note),
    headshotUrl: str(fields(p.headshot).url) ?? str(p.image_url),
    positionType: str(p.position_type),
    stats: statsOf(p.player_stats),
    points: num(fields(p.player_points).total),
  };
}

const playersOf = (collection: unknown) =>
  list(collection, "player").map(fields).map(parsePlayer).filter((p) => p.playerKey);

/** The current roster with season stats. Falls back to the plain roster if Yahoo rejects the stats chain. */
export const getRoster = cache(async (teamKey: string): Promise<RosterPlayer[]> => {
  let content;
  try {
    content = await yahooGet(`/team/${teamKey}/roster/players/stats`);
  } catch (error) {
    if (!(error instanceof YahooApiError)) throw error;
    content = await yahooGet(`/team/${teamKey}/roster`);
  }
  const roster = fields(content.team).roster;
  return playersOf(child(roster, "players"));
});

// ---------------------------------------------------------------------------
// Draft
// ---------------------------------------------------------------------------

export type DraftPick = {
  pick?: number;
  round?: number;
  /** Auction price */
  cost?: number;
  playerKey: string;
  player?: Pick<RosterPlayer, "name" | "proTeam" | "positions" | "headshotUrl">;
};

/** Players by key, fetched 25 at a time (Yahoo's page size). */
async function getPlayers(leagueKey: string, keys: string[]) {
  const chunks: string[][] = [];
  for (let i = 0; i < keys.length; i += 25) chunks.push(keys.slice(i, i + 25));
  const results = await Promise.all(
    chunks.map((chunk) => yahooGet(`/league/${leagueKey}/players;player_keys=${chunk.join(",")}`)),
  );
  return new Map(
    results.flatMap((content) => playersOf(fields(content.league).players)).map((p) => [p.playerKey, p]),
  );
}

export const getDraft = cache(async (teamKey: string, leagueKey: string): Promise<DraftPick[]> => {
  const team = fields((await yahooGet(`/team/${teamKey}/draftresults`)).team);
  const picks = list(child(team, "draft_results") ?? child(team, "draftresults"), "draft_result")
    .map(fields)
    .map((d) => ({
      pick: num(d.pick),
      round: num(d.round),
      cost: num(d.cost),
      playerKey: str(d.player_key) ?? "",
    }))
    .filter((d) => d.playerKey);

  const players = picks.length ? await getPlayers(leagueKey, picks.map((d) => d.playerKey)) : new Map();
  return picks
    .map((d) => ({ ...d, player: players.get(d.playerKey) }))
    .sort((a, b) => (a.pick ?? 0) - (b.pick ?? 0));
});

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export type TransactionPlayer = {
  playerKey: string;
  name: string;
  proTeam?: string;
  positions?: string;
  /** "add", "drop" or "trade" */
  action?: string;
  sourceType?: string;
  sourceTeamKey?: string;
  sourceTeamName?: string;
  destinationType?: string;
  destinationTeamKey?: string;
  destinationTeamName?: string;
};

export type Transaction = {
  key: string;
  /** "add", "drop", "add/drop", "trade", "waiver", "pending_trade" */
  type: string;
  status?: string;
  /** Epoch ms */
  time?: number;
  faabBid?: number;
  traderTeamKey?: string;
  tradeeTeamKey?: string;
  players: TransactionPlayer[];
};

function parseTransaction(node: unknown): Transaction {
  const t = fields(node);
  const seconds = num(t.timestamp);
  return {
    key: str(t.transaction_key) ?? "",
    type: str(t.type) ?? "",
    status: str(t.status),
    time: seconds === undefined ? undefined : seconds * 1000,
    faabBid: num(t.faab_bid),
    traderTeamKey: str(t.trader_team_key),
    tradeeTeamKey: str(t.tradee_team_key),
    players: list(t.players, "player")
      .map(fields)
      .map((p) => {
        const d = fields(p.transaction_data);
        return {
          playerKey: str(p.player_key) ?? "",
          name: str(fields(p.name).full) ?? "",
          proTeam: str(p.editorial_team_abbr),
          positions: str(p.display_position),
          action: str(d.type),
          sourceType: str(d.source_type),
          sourceTeamKey: str(d.source_team_key),
          sourceTeamName: str(d.source_team_name),
          destinationType: str(d.destination_type),
          destinationTeamKey: str(d.destination_team_key),
          destinationTeamName: str(d.destination_team_name),
        };
      }),
  };
}

const involves = (t: Transaction, teamKey: string) =>
  t.traderTeamKey === teamKey ||
  t.tradeeTeamKey === teamKey ||
  t.players.some((p) => p.sourceTeamKey === teamKey || p.destinationTeamKey === teamKey);

async function transactions(path: string) {
  const content = await yahooGet(path);
  return list(fields(content.league).transactions, "transaction").map(parseTransaction);
}

export type TeamActivity = { pending: Transaction[]; history: Transaction[] };

export const getActivity = cache(async (teamKey: string, leagueKey: string): Promise<TeamActivity> => {
  const base = `/league/${leagueKey}/transactions`;
  const [history, pending] = await Promise.all([
    transactions(`${base};types=add,drop,trade;team_key=${teamKey}`).catch((error) => {
      // If Yahoo rejects the team filter, read the league feed and filter here.
      if (error instanceof YahooApiError) return transactions(`${base};types=add,drop,trade`);
      throw error;
    }),
    // Pending claims and offers are only visible to the team itself; optional.
    transactions(`${base};types=waiver,pending_trade;team_key=${teamKey}`).catch((error) => {
      if (error instanceof YahooApiError) return [];
      throw error;
    }),
  ]);

  return {
    pending,
    history: history
      .filter((t) => involves(t, teamKey))
      .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
      .slice(0, 50),
  };
});

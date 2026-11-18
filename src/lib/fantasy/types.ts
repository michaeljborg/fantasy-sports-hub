/**
 * Shared fantasy data shapes. Sport-agnostic: each sport supplies its own
 * categories (see sports.ts) and stat keys. The scraper will fill these later.
 */

export type SportId = "basketball" | "hockey" | "football";

export type Category = {
  key: string;
  /** Short label, e.g. "PTS" */
  label: string;
  /** Full name, e.g. "Points" */
  name: string;
  format: "count" | "pct";
  lowerIsBetter?: boolean;
  /** Placeholder rule: a gap at or below this is "close" (until projections exist). */
  closeMargin: number;
};

export type StatLine = Record<string, number>;

export type PlayerStatus = "healthy" | "dtd" | "out";

export type Player = {
  id: string;
  name: string;
  position: string;
  team: string;
  status: PlayerStatus;
  /** Roster slot, e.g. "PG", "UTIL", "BN", "IL" */
  slot: string;
  /** Day indexes (0 = Mon) the player's team plays this week */
  games: number[];
  /** Season per-game averages */
  stats: StatLine;
};

export type FantasyTeam = {
  id: string;
  name: string;
  manager: string;
  record: { w: number; l: number; t: number };
  rank: number;
};

export type WeekDay = { short: string; date: string };

export type Week = {
  number: number;
  label: string;
  days: WeekDay[];
  /** Index into days */
  today: number;
};

export type Matchup = {
  me: FantasyTeam;
  opponent: FantasyTeam;
  /** Week-to-date category totals */
  totals: { me: StatLine; opponent: StatLine };
  opponentGamesLeft: number;
};

export type CategoryRank = {
  key: string;
  rank: number;
  /** Your season per-game value */
  value: number;
  /** League-wide average per-game value */
  leagueAvg: number;
};

/** A team the user manages. One user can have several per sport. */
export type UserTeam = {
  /** URL slug */
  id: string;
  sport: SportId;
  league: string;
};

/** Everything scraped for one of the user's teams. */
export type TeamData = {
  roster: Player[];
  matchup: Matchup;
  leagueSize: number;
  seasonRanks: CategoryRank[];
  freeAgents: FreeAgent[];
  tradeTargets: TradeTarget[];
};

export type FreeAgent =Omit<Player, "slot" | "status"> & {
  rostered: number;
  helps: string[];
};

export type TradeTarget = {
  id: string;
  name: string;
  position: string;
  team: string;
  owner: string;
  helps: string[];
  give: string;
  note: string;
};

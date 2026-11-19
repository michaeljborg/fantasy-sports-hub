/**
 * Draft prep data shapes. Football and hockey. The mock data in
 * mock-football.ts / mock-hockey.ts fills these until a real source exists.
 */

export type DraftSportId = "football" | "hockey";

/* ---------- Football ---------- */

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST";

export type Player = {
  id: string;
  name: string;
  position: Position;
  team: string;
  /** Consensus rank, lower is better. Can be edited on the board. */
  rank: number;
  bye?: number;
  /** Average draft position */
  adp?: number;
  /** Overall (cross-position) tier, lower is better */
  tier?: number;
  /** Tier within the player's own position, lower is better */
  positionTier?: number;
};

/** Just enough of a player to show it; snapshotted onto saved teams and trees. */
export type PlayerRef = Pick<Player, "id" | "name" | "position" | "team">;

export type DraftConfig = { teams: number; slot: number; rounds: number };

/** Overall pick number (1-indexed) → player id */
export type Selections = Record<number, string | undefined>;

export type SavedTeam = {
  id: string;
  name: string;
  createdAt: string;
  config: DraftConfig;
  picks: { pick: number; player: PlayerRef }[];
};

export type DraftTreeNode = {
  id: string;
  pick: number;
  player: PlayerRef;
  /** More than one child means the scenario branches at this pick. */
  children: DraftTreeNode[];
};

export type DraftTree = {
  id: string;
  name: string;
  createdAt: string;
  config: DraftConfig;
  /** More than one root means several Round 1 options. */
  roots: DraftTreeNode[];
};

export type NoteColor = "yellow" | "blue" | "green" | "pink" | "purple" | "white";

/** A sticky note on the Notes canvas. x/y are pixel offsets in the canvas. */
export type Note = {
  id: string;
  title: string;
  text: string;
  color: NoteColor;
  x: number;
  y: number;
  width: number;
  height: number;
};

/* ---------- Hockey ---------- */

export type HockeyPosition = "C" | "LW" | "RW" | "D" | "G";

type HockeyPlayerBase = {
  id: string;
  name: string;
  positions: HockeyPosition[];
  team: string;
  /** Fantasy team that keeps this player, or "FA" if available in the draft. */
  rosterStatus: string;
  gamesPlayed: number;
  fantasyPoints: number;
  rankPreSeason: number;
  /** Rank at the end of last season */
  rankCurrent: number;
};

export type HockeySkater = HockeyPlayerBase & {
  kind: "skater";
  /** Time on ice per game, e.g. "22:59" */
  toiPerGame: string;
  goals: number;
  assists: number;
  plusMinus: number;
  powerPlayPoints: number;
  shotsOnGoal: number;
  hits: number;
  blocks: number;
};

export type HockeyGoalie = HockeyPlayerBase & {
  kind: "goalie";
  /** Season total time on ice, e.g. "3,401:27" */
  timeOnIce: string;
  wins: number;
  goalsAgainst: number;
  saves: number;
  shutouts: number;
};

export type HockeyPlayer = HockeySkater | HockeyGoalie;

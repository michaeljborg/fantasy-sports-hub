/**
 * Draft prep data shapes, shared by every sport. Sport differences (positions,
 * roster, stat columns, tiers) live in sports.ts. The mock-*.ts files fill
 * these until a real source exists.
 */

export type DraftSportId = "football" | "hockey" | "basketball";

export type Player = {
  id: string;
  name: string;
  /** Eligible positions, e.g. ["RB"] or ["C", "RW"] */
  positions: string[];
  team: string;
  /** Overall rank, lower is better. Can be edited on the board. */
  rank: number;
  /** Overall tier, lower is better (football only for now) */
  tier?: number;
  /** Tier within the player's first position (football only for now) */
  positionTier?: number;
  /** Sport-specific columns, keyed by the column keys in sports.ts */
  stats: Record<string, number | string>;
};

/** Just enough of a player to show it; snapshotted onto saved teams and trees. */
export type PlayerRef = Pick<Player, "id" | "name" | "positions" | "team">;

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

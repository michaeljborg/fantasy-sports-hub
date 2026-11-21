/**
 * Everything that differs between draft sports lives here. The board, tabs
 * and state are shared and read these settings.
 */
import { BASKETBALL_STARTERS, FOOTBALL_STARTERS, HOCKEY_STARTERS, type SlotDef } from "./roster";
import type { DraftConfig, DraftSportId } from "./types";

/** A sport-specific stat column. `key` matches Player.stats. */
export type StatColumn = {
  key: string;
  label: string;
  title?: string;
  format: "int" | "dec1" | "pct" | "text";
};

/** A slice of the player pool, e.g. skaters vs goalies. */
export type PlayerView = {
  id: string;
  label: string;
  /** Players with any of these positions; omit for everyone */
  includes?: string[];
  /** Options for the position filter; omit to hide it */
  positions?: string[];
  columns: StatColumn[];
};

export type SportDef = {
  id: DraftSportId;
  name: string;
  starters: SlotDef[];
  defaultConfig: DraftConfig;
  /** Football has tiers; the others only have a watchlist. */
  hasTiers: boolean;
  views: PlayerView[];
};

const col = (key: string, label: string, format: StatColumn["format"], title?: string): StatColumn => ({ key, label, format, title });
const cur = col("cur", "Cur", "int", "Rank at the end of last season");
const gp = col("gp", "GP", "int", "Games played");
const fpts = col("fpts", "FPTS", "dec1", "Fantasy points");

export const draftSports: SportDef[] = [
  {
    id: "football",
    name: "Football",
    starters: FOOTBALL_STARTERS,
    defaultConfig: { teams: 8, slot: 3, rounds: 5 },
    hasTiers: true,
    views: [
      {
        id: "all",
        label: "Players",
        positions: ["QB", "RB", "WR", "TE", "K", "DST"],
        columns: [col("adp", "ADP", "dec1", "Average draft position"), col("bye", "Bye", "int", "Bye week")],
      },
    ],
  },
  {
    id: "hockey",
    name: "Hockey",
    starters: HOCKEY_STARTERS,
    defaultConfig: { teams: 4, slot: 2, rounds: 7 },
    hasTiers: false,
    views: [
      {
        id: "skaters",
        label: "Skaters",
        includes: ["C", "LW", "RW", "D"],
        positions: ["C", "LW", "RW", "D"],
        columns: [
          cur, gp, fpts,
          col("toi", "TOI/G", "text", "Time on ice per game"),
          col("g", "G", "int", "Goals"),
          col("a", "A", "int", "Assists"),
          col("pm", "+/-", "int", "Plus/minus"),
          col("ppp", "PPP", "int", "Power play points"),
          col("sog", "SOG", "int", "Shots on goal"),
          col("hit", "HIT", "int", "Hits"),
          col("blk", "BLK", "int", "Blocked shots"),
        ],
      },
      {
        id: "goalies",
        label: "Goalies",
        includes: ["G"],
        columns: [
          cur, gp, fpts,
          col("toi", "TOI", "text", "Total time on ice"),
          col("w", "W", "int", "Wins"),
          col("ga", "GA", "int", "Goals against"),
          col("sv", "SV", "int", "Saves"),
          col("sho", "SHO", "int", "Shutouts"),
        ],
      },
    ],
  },
  {
    id: "basketball",
    name: "Basketball",
    starters: BASKETBALL_STARTERS,
    defaultConfig: { teams: 4, slot: 2, rounds: 7 },
    hasTiers: false,
    views: [
      {
        id: "all",
        label: "Players",
        positions: ["PG", "SG", "SF", "PF", "C"],
        columns: [
          cur, gp,
          col("min", "MIN", "dec1", "Minutes per game"),
          col("fgp", "FG%", "pct", "Field goal %"),
          col("ftp", "FT%", "pct", "Free throw %"),
          col("tpm", "3PM", "dec1", "Threes made"),
          col("pts", "PTS", "dec1", "Points"),
          col("reb", "REB", "dec1", "Rebounds"),
          col("ast", "AST", "dec1", "Assists"),
          col("stl", "STL", "dec1", "Steals"),
          col("blk", "BLK", "dec1", "Blocks"),
          col("to", "TO", "dec1", "Turnovers"),
        ],
      },
    ],
  },
];

export function getSport(id: DraftSportId): SportDef {
  return draftSports.find((s) => s.id === id)!;
}

/** Every position the sport uses, for filters in pickers. */
export function allPositions(sport: SportDef) {
  return [...new Set(sport.views.flatMap((v) => v.positions ?? v.includes ?? []))];
}

export function formatStat(value: number | string | undefined, format: StatColumn["format"]) {
  if (value == null) return "–";
  if (typeof value === "string") return value;
  if (format === "pct") return value.toFixed(3).replace(/^0/, "");
  if (format === "dec1") return value.toFixed(1);
  return String(value);
}

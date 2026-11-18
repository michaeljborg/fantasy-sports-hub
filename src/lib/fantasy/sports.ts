import type { Category, SportId } from "./types";

export type Sport = {
  id: SportId;
  name: string;
  available: boolean;
};

export const sports: Sport[] = [
  { id: "basketball", name: "Basketball", available: true },
  { id: "hockey", name: "Hockey", available: false },
  { id: "football", name: "Football", available: false },
];

/** Standard 9-cat H2H, in Yahoo's display order. */
export const basketballCategories: Category[] = [
  { key: "fgp", label: "FG%", name: "Field goal %", format: "pct", closeMargin: 0.015 },
  { key: "ftp", label: "FT%", name: "Free throw %", format: "pct", closeMargin: 0.02 },
  { key: "tpm", label: "3PM", name: "Threes made", format: "count", closeMargin: 3 },
  { key: "pts", label: "PTS", name: "Points", format: "count", closeMargin: 10 },
  { key: "reb", label: "REB", name: "Rebounds", format: "count", closeMargin: 5 },
  { key: "ast", label: "AST", name: "Assists", format: "count", closeMargin: 4 },
  { key: "stl", label: "STL", name: "Steals", format: "count", closeMargin: 2 },
  { key: "blk", label: "BLK", name: "Blocks", format: "count", closeMargin: 2 },
  { key: "to", label: "TO", name: "Turnovers", format: "count", lowerIsBetter: true, closeMargin: 3 },
];

/** PG, SG, G, SF, PF, F, C, C, UTIL, UTIL */
export const BASKETBALL_STARTING_SLOTS = 10;

export function categoryByKey(categories: Category[], key: string) {
  return categories.find((c) => c.key === key)!;
}

/**
 * PLACEHOLDER DATA. Fictional players so the draft board has something to
 * render. Replace with a real rankings source; keep the shapes from types.ts.
 */
import type { DraftConfig, Player, Position } from "./types";

type Row = [name: string, position: Position, team: string, bye: number, adp: number, tier?: number, positionTier?: number];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// In rank order.
const rows: Row[] = [
  ["Marcus Holloway", "RB", "DET", 8, 1.2, 1, 1],
  ["Jalen Stroud", "WR", "CIN", 10, 2.1, 1, 1],
  ["Dorian Pierce", "RB", "ATL", 12, 3.4, 1, 1],
  ["Tyreek Vance", "WR", "MIA", 6, 4.0, 1, 1],
  ["Cole Brennan", "WR", "MIN", 6, 5.6, 2, 2],
  ["Isaiah Monroe", "RB", "PHI", 9, 6.3, 2, 2],
  ["Devon Clarke", "WR", "LAR", 8, 7.9, 2, 2],
  ["Rashad Bellamy", "RB", "SF", 14, 8.8, 2, 2],
  ["Malik Foster", "WR", "DAL", 10, 9.5, 2, 3],
  ["Trent Okafor", "TE", "KC", 6, 12.4, 3, 1],
  ["Andre Whitfield", "WR", "NYG", 14, 11.7, 3, 3],
  ["Javon Reyes", "RB", "BAL", 7, 13.2, 3, 3],
  ["Caleb Ashford", "QB", "BUF", 7, 15.8, 3, 1],
  ["Darius Kemp", "WR", "SEA", 10, 14.6, 3, 4],
  ["Elijah Grant", "RB", "GB", 5, 16.1, 3, 3],
  ["Nico Albright", "QB", "BAL", 7, 18.3, 4, 1],
  ["Quentin Shaw", "WR", "HOU", 6, 19.0, 4, 4],
  ["Bryce Halvorsen", "TE", "DET", 8, 21.5, 4, 2],
  ["Kendrick Lowe", "RB", "IND", 11, 20.4, 4, 4],
  ["Tobias Wren", "WR", "CHI", 5, 22.8, 4, 5],
  ["Reggie Vaughn", "RB", "NYJ", 9, 24.1, 5, 4],
  ["Marcus Delaney", "QB", "PHI", 9, 26.7, 5, 2],
  ["Silas Mercer", "WR", "TB", 11, 25.3, 5, 5],
  ["Omar Battle", "RB", "LAC", 12, 28.0, 5, 5],
  ["Hunter Gaines", "TE", "LV", 10, 30.9, 5, 3],
  ["Xavier Lund", "WR", "PIT", 5, 29.4, 6, 6],
  ["Damon Price", "RB", "CLE", 9, 32.6, 6, 5],
  ["Fletcher Doyle", "QB", "CIN", 10, 34.2, 6, 3],
  ["Gavin Rhodes", "WR", "ARI", 8, 35.5, 6, 6],
  ["Luca Moretti", "TE", "SF", 14, 38.1, 6, 4],
  ["Terrell Banks", "RB", "NO", 11, 37.0, 7, 6],
  ["Owen Castillo", "WR", "DEN", 12, 39.8, 7, 7],
  ["Jasper Kline", "QB", "HOU", 6, 42.5, 7, 4],
  ["Pittsburgh", "DST", "PIT", 5, 98.0, 8, 1],
  ["Baltimore", "DST", "BAL", 7, 104.2, 8, 1],
  ["Evan Sorensen", "K", "BAL", 7, 112.6, 8, 1],
  ["Brady Lockwood", "K", "DET", 8, 118.3, 8, 1],
  ["Rory Whitaker", "TE", "ATL", 12, 60.4, undefined, 5],
  ["Felix Navarro", "RB", "TEN", 10, 64.9],
  ["Ty Abernathy", "WR", "JAX", 12, 66.2],
  ["Kansas City", "DST", "KC", 6, 121.7, undefined, 2],
  ["Mason Duvall", "K", "SF", 14, 130.5, undefined, 2],
];

export const players: Player[] = rows.map(([name, position, team, bye, adp, tier, positionTier], i) => ({
  id: `${slug(name)}-${position.toLowerCase()}`,
  name,
  position,
  team,
  rank: i + 1,
  bye,
  adp,
  tier,
  positionTier,
}));

export const defaultConfig: DraftConfig = { teams: 8, slot: 3, rounds: 5 };

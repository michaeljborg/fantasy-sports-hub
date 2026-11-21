/**
 * PLACEHOLDER DATA. Fictional players so the basketball
 * board has something to render. Replace with a real source; keep types.ts shapes.
 */
import type { Player } from "./types";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

let rank = 0;

function player(
  name: string, positions: string[], team: string,
  [gp, cur]: [number, number],
  [min, fgp, ftp, tpm, pts, reb, ast, stl, blk, to]:
    [number, number, number, number, number, number, number, number, number, number],
): Player {
  return {
    id: `${slug(name)}-${positions[0].toLowerCase()}`, name, positions, team, rank: ++rank,
    stats: { cur, gp, min, fgp, ftp, tpm, pts, reb, ast, stl, blk, to },
  };
}


// In rank order (pre-season).
export const players: Player[] = [
  player("Theo Adeyemi", ["C"], "DEN", [79, 1], [36.1, 0.581, 0.812, 1.1, 26.8, 12.6, 9.4, 1.4, 0.8, 3.1]),
  player("Marcus Vale", ["PG"], "OKC", [76, 2], [34.5, 0.512, 0.901, 2.0, 31.2, 5.4, 6.3, 2.0, 0.9, 2.4]),
  player("Andris Kalnins", ["PF", "C"], "SAS", [70, 4], [33.0, 0.478, 0.832, 3.2, 24.9, 11.0, 3.8, 1.1, 3.6, 3.2]),
  player("Nikola Vrbanac", ["PG", "SG"], "DAL", [68, 3], [36.8, 0.476, 0.781, 3.9, 30.4, 8.9, 8.1, 1.4, 0.5, 4.0]),
  player("Jaylen Osei", ["SF", "PF"], "MIL", [73, 5], [35.2, 0.601, 0.655, 0.4, 29.1, 11.4, 6.2, 1.1, 1.3, 3.3]),
  player("Devin Carrow", ["SG", "SF"], "MIN", [78, 6], [35.6, 0.461, 0.835, 3.0, 26.2, 5.6, 4.9, 1.3, 0.7, 2.9]),
  player("Kofi Mensah", ["C"], "PHI", [55, 9], [33.4, 0.548, 0.872, 1.2, 28.5, 10.8, 5.0, 1.0, 1.6, 3.4]),
  player("Tyrell Hollins", ["PG"], "IND", [72, 7], [33.1, 0.497, 0.851, 2.8, 20.4, 3.8, 10.9, 1.4, 0.6, 2.4]),
  player("Evan Grant", ["PF", "C"], "CLE", [77, 8], [32.8, 0.552, 0.704, 0.9, 18.6, 9.7, 3.1, 0.9, 1.9, 2.1]),
  player("Jalen Ashworth", ["PG"], "NYK", [75, 10], [35.4, 0.489, 0.844, 2.7, 27.6, 3.6, 6.9, 0.9, 0.2, 2.5]),
  player("Tomas Rakauskas", ["C"], "SAC", [80, 11], [35.0, 0.594, 0.744, 0.4, 19.9, 13.8, 8.0, 0.9, 0.5, 3.2]),
  player("Cade Whitmore", ["PG", "SG"], "DET", [74, 12], [34.9, 0.448, 0.783, 2.1, 24.0, 6.1, 9.2, 1.0, 0.7, 4.3]),
  player("Scott Hale", ["SF", "PF"], "TOR", [71, 14], [34.2, 0.469, 0.771, 1.4, 19.6, 8.1, 6.0, 1.4, 1.2, 2.8]),
  player("Trey Kingsley", ["PG"], "ATL", [76, 13], [35.1, 0.431, 0.866, 3.2, 24.1, 3.0, 11.3, 1.2, 0.2, 4.6]),
  player("Bolu Okoro", ["C"], "MIA", [72, 18], [33.6, 0.521, 0.756, 0.3, 19.3, 10.2, 4.0, 1.1, 0.9, 2.5]),
  player("Malik Brigham", ["SG", "SF"], "NYK", [80, 17], [33.0, 0.481, 0.811, 2.2, 16.4, 4.2, 2.6, 1.0, 0.5, 1.4]),
  player("Derek Lowe", ["PG", "SG"], "BOS", [79, 15], [32.4, 0.462, 0.906, 3.1, 16.2, 4.3, 5.0, 1.0, 1.2, 1.5]),
  player("Jarell Banks", ["PF", "C"], "MEM", [66, 16], [30.2, 0.497, 0.801, 1.8, 21.8, 6.0, 1.9, 0.9, 1.9, 2.0]),
  player("Freddie Vance", ["PG", "SG"], "HOU", [70, 20], [33.8, 0.401, 0.875, 3.4, 15.1, 3.8, 5.1, 1.9, 0.6, 1.6]),
  player("Miles Turnbull", ["C"], "IND", [72, 19], [29.9, 0.525, 0.778, 1.8, 16.8, 7.1, 1.6, 0.6, 2.1, 1.6]),
  player("Brandon Mills", ["SF", "PF"], "ORL", [75, 21], [34.0, 0.459, 0.801, 1.6, 22.7, 7.2, 4.8, 0.9, 0.5, 2.9]),
  player("Joel Giddings", ["PG", "SG"], "CHI", [72, 23], [33.0, 0.468, 0.805, 1.2, 14.4, 8.1, 7.3, 1.2, 0.8, 3.1]),
  player("Walker Ray", ["C"], "UTA", [64, 22], [28.4, 0.651, 0.590, 0.0, 11.2, 11.5, 1.3, 0.6, 2.9, 1.2]),
  player("Desmond Ward", ["SG", "SF"], "ORL", [73, 25], [32.7, 0.474, 0.881, 2.8, 19.1, 4.8, 4.4, 1.0, 0.4, 2.2]),
  player("Herbert Jonas", ["SF"], "NOP", [61, 24], [30.1, 0.503, 0.811, 1.5, 12.0, 4.0, 2.4, 2.1, 0.8, 1.4]),
  player("Alper Tas", ["C"], "HOU", [74, 26], [31.5, 0.534, 0.703, 0.3, 19.4, 10.6, 5.2, 1.1, 0.8, 2.9]),
  player("Colby Whitfield", ["PG", "SG"], "CHI", [79, 28], [36.1, 0.441, 0.861, 3.3, 20.1, 4.5, 4.6, 0.8, 0.3, 2.0]),
  player("Asa Thompsen", ["SF", "PF"], "DET", [76, 27], [27.0, 0.531, 0.598, 0.2, 10.4, 6.4, 2.2, 1.6, 1.0, 1.5]),
];

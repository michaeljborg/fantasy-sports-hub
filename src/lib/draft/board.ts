import type { Player, Position } from "./types";

export type PlayerSortKey = "rank" | "adp" | "name" | "team" | "bye";
export type PositionFilter = Position | "ALL";

export function sortPlayers(players: Player[], key: PlayerSortKey, dir: "asc" | "desc") {
  const num = (v: number | undefined) => v ?? Infinity;
  const cmp: Record<PlayerSortKey, (a: Player, b: Player) => number> = {
    rank: (a, b) => a.rank - b.rank,
    adp: (a, b) => num(a.adp) - num(b.adp),
    bye: (a, b) => num(a.bye) - num(b.bye),
    team: (a, b) => a.team.localeCompare(b.team),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  const sorted = [...players].sort(cmp[key]);
  return dir === "asc" ? sorted : sorted.reverse();
}

export function filterPlayers(players: Player[], position: PositionFilter, query = "") {
  const q = query.trim().toLowerCase();
  return players.filter((p) => (position === "ALL" || p.position === position) && p.name.toLowerCase().includes(q));
}

export type BoardRow = { kind: "pick"; pick: number } | { kind: "player"; player: Player };

/** Inserts "Pick N" markers before the first player ranked at or after each of your picks. */
export function withPickDividers(players: Player[], myPicks: number[]): BoardRow[] {
  const rows: BoardRow[] = [];
  let i = 0;
  for (const player of players) {
    while (i < myPicks.length && myPicks[i] <= player.rank) rows.push({ kind: "pick", pick: myPicks[i++] });
    rows.push({ kind: "player", player });
  }
  while (i < myPicks.length) rows.push({ kind: "pick", pick: myPicks[i++] });
  return rows;
}

export function formatAdp(adp?: number) {
  return adp != null ? adp.toFixed(1) : "–";
}

import type { PlayerView } from "./sports";
import type { Player } from "./types";

/** "rank", "name", "team", or a stat column key */
export type PlayerSortKey = string;

export function sortPlayers(players: Player[], key: PlayerSortKey, dir: "asc" | "desc") {
  const value = (p: Player): number | string =>
    key === "rank" ? p.rank : key === "name" ? p.name : key === "team" ? p.team : (p.stats[key] ?? Infinity);
  const sorted = [...players].sort((a, b) => {
    const x = value(a);
    const y = value(b);
    return typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : Number(x) - Number(y);
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export function inView(player: Player, view: PlayerView) {
  return !view.includes || player.positions.some((p) => view.includes!.includes(p));
}

export function filterPlayers(players: Player[], { view, position = "ALL", query = "" }: { view?: PlayerView; position?: string; query?: string }) {
  const q = query.trim().toLowerCase();
  return players.filter(
    (p) =>
      (!view || inView(p, view)) &&
      (position === "ALL" || p.positions.includes(position)) &&
      p.name.toLowerCase().includes(q),
  );
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

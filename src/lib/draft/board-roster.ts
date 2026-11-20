import type { BoardPlayer } from "./types";

/** A roster slot and the positions it accepts. Bench ("BN") takes anyone. */
export type SlotDef = { label: string; accepts: string[] | "any" };

export type BoardSlot = { label: string; playerId?: string };

const bench = (n: number): SlotDef[] => Array.from({ length: n }, () => ({ label: "BN", accepts: "any" }));

export const HOCKEY_ROSTER: SlotDef[] = [
  ...["C", "C", "LW", "LW", "RW", "RW", "D", "D", "D", "D", "G", "G"].map((p) => ({ label: p, accepts: [p] })),
  ...bench(4),
];

/** Lineup: PG, SG, G, SF, PF, F, C, 5 UTIL, plus 3 bench. */
export const BASKETBALL_ROSTER: SlotDef[] = [
  { label: "PG", accepts: ["PG"] },
  { label: "SG", accepts: ["SG"] },
  { label: "G", accepts: ["PG", "SG"] },
  { label: "SF", accepts: ["SF"] },
  { label: "PF", accepts: ["PF"] },
  { label: "F", accepts: ["SF", "PF"] },
  { label: "C", accepts: ["C"] },
  ...Array.from({ length: 5 }, () => ({ label: "UTIL", accepts: ["PG", "SG", "SF", "PF", "C"] })),
  ...bench(3),
];

export function fitsSlot(slot: SlotDef, positions: string[]) {
  return slot.accepts === "any" || positions.some((p) => (slot.accepts as string[]).includes(p));
}

/** Single-position slots first, then flex slots (G, F, UTIL), then the bench. */
const specificity = (slot: SlotDef) => (slot.accepts === "any" ? 2 : slot.accepts.length === 1 ? 0 : 1);

/**
 * Lays your picks onto the roster in draft order.
 * Each takes the most specific open slot they're eligible for.
 * `slotOverrides` pins a player to a chosen slot label when one is open.
 */
export function buildRosterSlots(
  template: SlotDef[],
  playerIds: string[],
  playersById: Record<string, Pick<BoardPlayer, "id" | "positions">>,
  slotOverrides: Record<string, string> = {},
): BoardSlot[] {
  const working = template.map((def) => ({ ...def, playerId: undefined as string | undefined }));
  const byPriority = [...working].sort((a, b) => specificity(a) - specificity(b));

  for (const id of playerIds) {
    const player = playersById[id];
    if (!player) continue;
    const open = (s: (typeof working)[number]) => !s.playerId && fitsSlot(s, player.positions);
    const preferred = slotOverrides[id];
    const slot = (preferred ? working.find((s) => s.label === preferred && open(s)) : undefined) ?? byPriority.find(open);
    if (slot) slot.playerId = id;
  }

  return working.map(({ label, playerId }) => ({ label, playerId }));
}

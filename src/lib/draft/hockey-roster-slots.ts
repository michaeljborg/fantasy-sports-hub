import type { HockeyPlayer, HockeyPosition } from "./types";

export type HockeySlotLabel = HockeyPosition | "BN";

/** Roster template in display order. */
export const HOCKEY_ROSTER: HockeySlotLabel[] = [
  "C", "C", "LW", "LW", "RW", "RW", "D", "D", "D", "D", "G", "G", "BN", "BN", "BN", "BN",
];

export type HockeySlot = { label: HockeySlotLabel; playerId?: string };

/**
 * Lays players onto the roster in the order given (keepers first, then picks).
 * Each fills the first open slot for one of their positions, else the bench.
 * `slotOverrides` pins a multi-position player to a chosen slot when it's open.
 */
export function buildHockeySlots(
  playerIds: string[],
  playersById: Record<string, Pick<HockeyPlayer, "id" | "positions">>,
  slotOverrides: Partial<Record<string, HockeySlotLabel>> = {},
): HockeySlot[] {
  const working: HockeySlot[] = HOCKEY_ROSTER.map((label) => ({ label }));

  for (const id of playerIds) {
    const player = playersById[id];
    if (!player) continue;
    const preferred = slotOverrides[id];
    const eligible = preferred === "BN" || (preferred != null && player.positions.includes(preferred));
    const slot =
      (eligible ? working.find((s) => !s.playerId && s.label === preferred) : undefined) ??
      working.find((s) => !s.playerId && s.label !== "BN" && player.positions.includes(s.label as HockeyPosition)) ??
      working.find((s) => !s.playerId && s.label === "BN");
    if (slot) slot.playerId = id;
  }

  return working;
}

import type { Player, Position, Selections } from "./types";

export type SlotLabel = Position | "W/R/T" | "BN";

export type RosterSlot = { label: SlotLabel; playerId?: string; pick?: number };

type SlotDef = { label: SlotLabel; matches: (p: Position) => boolean };

/** Starting lineup in display order. Extra rounds become bench slots. */
const STARTERS: SlotDef[] = [
  { label: "QB", matches: (p) => p === "QB" },
  { label: "WR", matches: (p) => p === "WR" },
  { label: "WR", matches: (p) => p === "WR" },
  { label: "RB", matches: (p) => p === "RB" },
  { label: "RB", matches: (p) => p === "RB" },
  { label: "TE", matches: (p) => p === "TE" },
  { label: "W/R/T", matches: (p) => p === "RB" || p === "WR" || p === "TE" },
  { label: "DST", matches: (p) => p === "DST" },
  { label: "K", matches: (p) => p === "K" },
];

/**
 * Lays your picks into a positional roster, in draft order: exact-position
 * slots fill first, then the flex, then the bench.
 */
export function buildPositionalSlots(
  myPicks: number[],
  selections: Selections,
  playersById: Record<string, Pick<Player, "id" | "position">>,
): RosterSlot[] {
  const working: (SlotDef & { playerId?: string; pick?: number })[] = [
    ...STARTERS.map((s) => ({ ...s })),
    ...Array.from({ length: Math.max(0, myPicks.length - STARTERS.length) }, () => ({
      label: "BN" as const,
      matches: () => true,
    })),
  ];

  const drafted = myPicks
    .filter((pick) => selections[pick] && playersById[selections[pick]!])
    .sort((a, b) => a - b)
    .map((pick) => ({ pick, player: playersById[selections[pick]!] }));

  for (const { pick, player } of drafted) {
    const open = (s: (typeof working)[number]) => !s.playerId;
    const slot =
      working.find((s) => open(s) && s.label !== "W/R/T" && s.label !== "BN" && s.matches(player.position)) ??
      working.find((s) => open(s) && s.label === "W/R/T" && s.matches(player.position)) ??
      working.find((s) => open(s) && s.label === "BN");
    if (slot) {
      slot.playerId = player.id;
      slot.pick = pick;
    }
  }

  return working.map(({ label, playerId, pick }) => ({ label, playerId, pick }));
}

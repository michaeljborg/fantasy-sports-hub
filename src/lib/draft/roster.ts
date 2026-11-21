/** A roster spot and the positions it accepts. Bench ("BN") takes anyone. */
export type SlotDef = { label: string; accepts: string[] | "any" };

export type RosterSlot = { label: string; playerId?: string; pick?: number };

const only = (...labels: string[]): SlotDef[] => labels.map((l) => ({ label: l, accepts: [l] }));
const BENCH: SlotDef = { label: "BN", accepts: "any" };

export const FOOTBALL_STARTERS: SlotDef[] = [
  ...only("QB", "WR", "WR", "RB", "RB", "TE"),
  { label: "W/R/T", accepts: ["WR", "RB", "TE"] },
  ...only("DST", "K"),
];

export const HOCKEY_STARTERS: SlotDef[] = only("C", "C", "LW", "LW", "RW", "RW", "D", "D", "D", "D", "G", "G");

export const BASKETBALL_STARTERS: SlotDef[] = [
  ...only("PG", "SG"),
  { label: "G", accepts: ["PG", "SG"] },
  ...only("SF", "PF"),
  { label: "F", accepts: ["SF", "PF"] },
  ...only("C"),
  ...Array.from({ length: 5 }, () => ({ label: "UTIL", accepts: ["PG", "SG", "SF", "PF", "C"] })),
];

/** Starters, plus one bench spot for every round beyond them. */
export function rosterFor(starters: SlotDef[], rounds: number): SlotDef[] {
  return [...starters, ...Array.from({ length: Math.max(0, rounds - starters.length) }, () => BENCH)];
}

export function fitsSlot(slot: SlotDef, positions: string[]) {
  return slot.accepts === "any" || positions.some((p) => (slot.accepts as string[]).includes(p));
}

/** Single-position spots first, then flex spots (W/R/T, G, F, UTIL), then the bench. */
const specificity = (slot: SlotDef) => (slot.accepts === "any" ? 2 : slot.accepts.length === 1 ? 0 : 1);

/**
 * Lays your picks onto the roster in draft order. Each player takes the most
 * specific open spot they fit. `slotOverrides` pins a player to a chosen spot
 * label when one is open.
 */
export function buildRosterSlots(
  template: SlotDef[],
  picks: { pick: number; player: { id: string; positions: string[] } }[],
  slotOverrides: Record<string, string> = {},
): RosterSlot[] {
  const working = template.map((def) => ({ ...def, playerId: undefined as string | undefined, pick: undefined as number | undefined }));
  const byPriority = [...working].sort((a, b) => specificity(a) - specificity(b));

  for (const { pick, player } of [...picks].sort((a, b) => a.pick - b.pick)) {
    const open = (s: (typeof working)[number]) => !s.playerId && fitsSlot(s, player.positions);
    const preferred = slotOverrides[player.id];
    const slot = (preferred ? working.find((s) => s.label === preferred && open(s)) : undefined) ?? byPriority.find(open);
    if (slot) {
      slot.playerId = player.id;
      slot.pick = pick;
    }
  }

  return working.map(({ label, playerId, pick }) => ({ label, playerId, pick }));
}

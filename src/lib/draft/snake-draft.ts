import type { DraftConfig } from "./types";

/**
 * Snake draft: odd rounds go 1..teams, even rounds reverse. Returns the
 * overall pick numbers (1-indexed) for your slot.
 * e.g. teams 12, slot 6, rounds 4 → [6, 19, 30, 43]
 */
export function getMyPicks({ teams, slot, rounds }: DraftConfig): number[] {
  return Array.from({ length: rounds }, (_, i) => {
    const round = i + 1;
    return i * teams + (round % 2 === 0 ? teams - slot + 1 : slot);
  });
}

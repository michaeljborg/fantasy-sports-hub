/**
 * Everything the draft prep app renders comes through here.
 * Today it reads mock fixtures; swap them for a real source later.
 */
import * as basketball from "./mock-basketball";
import * as football from "./mock-football";
import * as hockey from "./mock-hockey";
import type { DraftSportId, Player } from "./types";

/** Player pool for every draft sport. */
export function getDraftPool(): Record<DraftSportId, Player[]> {
  return { football: football.players, hockey: hockey.players, basketball: basketball.players };
}

export type DraftPool = ReturnType<typeof getDraftPool>;

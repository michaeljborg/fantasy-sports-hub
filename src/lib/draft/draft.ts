/**
 * Everything the draft prep app renders comes through here.
 * Today it reads mock fixtures; swap them for a real source later.
 */
import * as football from "./mock-football";
import * as hockey from "./mock-hockey";

/** Player pools and defaults for every draft sport. */
export function getDraftPool() {
  return {
    football: { players: football.players, defaultConfig: football.defaultConfig },
    hockey: { players: hockey.players, myTeamName: hockey.myTeamName, keepersPerTeam: hockey.keepersPerTeam },
  };
}

export type DraftPool = ReturnType<typeof getDraftPool>;


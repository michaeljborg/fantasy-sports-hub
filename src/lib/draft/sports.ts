import type { BasketballPosition, DraftSportId, HockeyPosition, Position } from "./types";

export const draftSports: { id: DraftSportId; name: string }[] = [
  { id: "football", name: "Football" },
  { id: "hockey", name: "Hockey" },
  { id: "basketball", name: "Basketball" },
];

export const footballPositions: Position[] = ["QB", "RB", "WR", "TE", "K", "DST"];
export const skaterPositions: HockeyPosition[] = ["C", "LW", "RW", "D"];
export const basketballPositions: BasketballPosition[] = ["PG", "SG", "SF", "PF", "C"];

import type { DraftSportId, HockeyPosition, Position } from "./types";

export const draftSports: { id: DraftSportId; name: string }[] = [
  { id: "football", name: "Football" },
  { id: "hockey", name: "Hockey" },
];

export const footballPositions: Position[] = ["QB", "RB", "WR", "TE", "K", "DST"];
export const skaterPositions: HockeyPosition[] = ["C", "LW", "RW", "D"];

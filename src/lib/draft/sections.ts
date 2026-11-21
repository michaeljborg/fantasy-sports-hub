import type { DraftSportId } from "./types";

const base = "/draft-prep";

/** Draft prep tabs, in display order. Every sport has all of them. */
export const draftSections = [
  { id: "board", label: "Draft Board", path: "" },
  { id: "my-teams", label: "My Teams", path: "/my-teams" },
  { id: "notes", label: "Notes", path: "/notes" },
  { id: "draft-tree", label: "Draft Tree", path: "/draft-tree" },
] as const;

export type DraftSectionId = (typeof draftSections)[number]["id"];

export function sportHref(sport: DraftSportId) {
  return `${base}/${sport}`;
}

export function draftSectionHref(sport: DraftSportId, id: DraftSectionId) {
  return sportHref(sport) + draftSections.find((s) => s.id === id)!.path;
}


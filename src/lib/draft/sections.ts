import type { DraftSportId } from "./types";

const base = "/draft-prep";

/** Draft prep tabs, in display order. Hockey and basketball only have the board. */
export const draftSections = [
  { id: "board", label: "Draft Board", path: "", sports: ["football", "hockey", "basketball"] },
  { id: "my-teams", label: "My Teams", path: "/my-teams", sports: ["football"] },
  { id: "notes", label: "Notes", path: "/notes", sports: ["football"] },
  { id: "draft-tree", label: "Draft Tree", path: "/draft-tree", sports: ["football"] },
] as const;

export type DraftSectionId = (typeof draftSections)[number]["id"];

export function sportHref(sport: DraftSportId) {
  return `${base}/${sport}`;
}

export function draftSectionHref(sport: DraftSportId, id: DraftSectionId) {
  return sportHref(sport) + draftSections.find((s) => s.id === id)!.path;
}

export function sectionsFor(sport: DraftSportId) {
  return draftSections.filter((s) => (s.sports as readonly string[]).includes(sport));
}

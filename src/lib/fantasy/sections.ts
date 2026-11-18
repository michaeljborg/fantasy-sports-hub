const base = "/weekly-matchup";

/** Dashboard tabs, in display order. Tab order drives slide direction. */
export const sections = [
  { id: "team", label: "My Team", path: "" },
  { id: "matchup", label: "Matchup", path: "/matchup" },
  { id: "sit-start", label: "Sit / Start", path: "/sit-start" },
  { id: "waivers", label: "Waiver Wire", path: "/waivers" },
  { id: "trades", label: "Trade Targets", path: "/trade-targets" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function teamHref(teamId: string) {
  return `${base}/${teamId}`;
}

export function sectionHref(teamId: string, id: SectionId) {
  return teamHref(teamId) + sections.find((s) => s.id === id)!.path;
}

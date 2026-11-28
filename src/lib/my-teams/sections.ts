/** Tabs of the My Teams app, in display order. */
const base = "/my-teams";

export const sections = [
  { id: "overview", label: "Overview", path: "" },
  { id: "roster", label: "Roster", path: "/roster" },
  { id: "draft", label: "Draft", path: "/draft" },
  { id: "activity", label: "Activity", path: "/activity" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const MY_TEAMS_BASE = base;

export function teamHref(slug: string) {
  return `${base}/${slug}`;
}

export function sectionHref(slug: string, id: SectionId) {
  return teamHref(slug) + sections.find((s) => s.id === id)!.path;
}

import type { CSSProperties } from "react";

export type AppId =
  | "my-teams"
  | "weekly-matchup"
  | "draft-prep"
  | "hall-of-fame"
  | "alerts"
  | "playoff-odds"
  | "trade-analyzer";

export type FantasyApp = {
  id: AppId;
  name: string;
  shortName: string;
  href: string;
  tagline: string;
  description: string;
  tags: string[];
  /** CSS color token for this app's accent (see src/styles/theme.css) */
  accent: string;
  /** "soon" apps are placeholder pages; the hub shows them as coming soon. */
  status: "ready" | "soon";
};

const PRIMARY = "var(--accent-primary)";
const SECONDARY = "var(--accent-secondary)";

/** Order here is the order on the hub and in the Apps menu. */
export const apps: FantasyApp[] = [
  {
    id: "my-teams",
    name: "My Teams",
    shortName: "My Teams",
    href: "/my-teams",
    tagline: "Your Yahoo teams",
    description:
      "Switch between your Yahoo teams and see each one's standing, roster, draft picks and moves.",
    tags: ["Standings", "Roster", "Draft"],
    accent: PRIMARY,
    status: "ready",
  },
  {
    id: "weekly-matchup",
    name: "Weekly Matchup",
    shortName: "Matchup",
    href: "/weekly-matchup",
    tagline: "H2H 9-Cat Basketball",
    description:
      "See which categories you're winning, which are close, and which a streamer could flip.",
    tags: ["Categories", "Sit / start", "Streamers"],
    accent: PRIMARY,
    status: "ready",
  },
  {
    id: "draft-prep",
    name: "Draft Prep",
    shortName: "Draft Prep",
    href: "/draft-prep",
    tagline: "Football, hockey & basketball",
    description:
      "Run a mock draft against your rankings, track tiers and your watchlist, and plan pick-by-pick scenarios.",
    tags: ["Rankings", "Tiers", "Draft scenarios"],
    accent: SECONDARY,
    status: "ready",
  },
  {
    id: "hall-of-fame",
    name: "Hall of Fame",
    shortName: "Hall of Fame",
    href: "/hall-of-fame",
    tagline: "League history",
    description:
      "Your league's champions, records and all-time bests in one place.",
    tags: ["Champions", "Records"],
    accent: PRIMARY,
    status: "soon",
  },
  {
    id: "alerts",
    name: "Trades & Injury Alerts",
    shortName: "Alerts",
    href: "/alerts",
    tagline: "Stay in the loop",
    description:
      "Get notified about trades and injuries that affect your roster.",
    tags: ["Trades", "Injuries"],
    accent: SECONDARY,
    status: "soon",
  },
  {
    id: "playoff-odds",
    name: "Playoff Odds",
    shortName: "Playoff Odds",
    href: "/playoff-odds",
    tagline: "Postseason outlook",
    description:
      "See your chances of making the playoffs based on standings and the schedule ahead.",
    tags: ["Standings", "Odds"],
    accent: PRIMARY,
    status: "soon",
  },
  {
    id: "trade-analyzer",
    name: "Trade Analyzer",
    shortName: "Trade Analyzer",
    href: "/trade-analyzer",
    tagline: "Evaluate deals",
    description:
      "Compare both sides of a trade and see how it changes your team.",
    tags: ["Trade value", "Team impact"],
    accent: SECONDARY,
    status: "soon",
  },
];

export function getApp(id: AppId): FantasyApp {
  return apps.find((app) => app.id === id)!;
}

/** Sets the generic `--accent` variable so children pick up the app's color. */
export function accentStyle(app: FantasyApp): CSSProperties {
  return { "--accent": app.accent } as CSSProperties;
}

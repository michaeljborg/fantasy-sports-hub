import type { CSSProperties } from "react";

export type AppId =
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
  /** CSS color token for this app's accent (see src/styles/palettes.css) */
  accent: string;
};

const PRIMARY = "var(--accent-primary)";
const SECONDARY = "var(--accent-secondary)";

/** Order here is the order on the hub and in the Apps menu. */
export const apps: FantasyApp[] = [
  {
    id: "weekly-matchup",
    name: "Fantasy Weekly Matchup Dashboard",
    shortName: "Matchup",
    href: "/weekly-matchup",
    tagline: "H2H 9-Cat Basketball",
    description:
      "Break down this week's head-to-head matchup: which categories you're winning, which are close, and which a streamer could flip.",
    tags: ["H2H 9-Cat", "Category outlook", "Streaming targets"],
    accent: PRIMARY,
  },
  {
    id: "draft-prep",
    name: "Fantasy Draft Prep",
    shortName: "Draft Prep",
    href: "/draft-prep",
    tagline: "Draft day ready",
    description:
      "Get ready for draft day with your rankings and strategy in one place.",
    tags: ["Rankings", "Draft strategy"],
    accent: SECONDARY,
  },
  {
    id: "hall-of-fame",
    name: "Fantasy Hall of Fame",
    shortName: "Hall of Fame",
    href: "/hall-of-fame",
    tagline: "League history",
    description:
      "Your league's champions, records and all-time bests in one place.",
    tags: ["Champions", "Records"],
    accent: PRIMARY,
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
  },
];

export function getApp(id: AppId): FantasyApp {
  return apps.find((app) => app.id === id)!;
}

/** Sets the generic `--accent` variable so children pick up the app's color. */
export function accentStyle(app: FantasyApp): CSSProperties {
  return { "--accent": app.accent } as CSSProperties;
}

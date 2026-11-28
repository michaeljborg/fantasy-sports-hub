import type { LeagueInfo, Record3 } from "@/lib/yahoo/team";

/** "7–3", or "7–3–1" when there are ties. */
export function recordText({ w, l, t }: Record3) {
  return `${w}–${l}${t ? `–${t}` : ""}`;
}

/** ".700" style win percentage. */
export function pctText(pct: number) {
  return pct.toFixed(3).replace(/^0/, "");
}

const DAY = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Yahoo dates are "YYYY-MM-DD"; read them as UTC so they don't shift a day. */
export function dayText(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? date : DAY.format(d);
}

/** "Nov 23 – 29", or "Nov 30 – Dec 6" across months. */
export function weekRangeText(start?: string, end?: string) {
  if (!start || !end) return undefined;
  const a = dayText(start);
  const b = dayText(end);
  const sameMonth = a.split(" ")[0] === b.split(" ")[0];
  return `${a} – ${sameMonth ? b.split(" ")[1] : b}`;
}

const DATE_TIME = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

export function timeText(ms: number) {
  return DATE_TIME.format(new Date(ms));
}

export function pointsText(points: number) {
  return points.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** Top third, middle, bottom third of the league. */
export function tierOf(rank: number, of: number): "strong" | "middle" | "weak" {
  const third = of / 3;
  if (rank <= third) return "strong";
  if (rank > of - third) return "weak";
  return "middle";
}

export const tierText = {
  strong: "text-success",
  middle: "text-fg-muted",
  weak: "text-danger",
} as const;

// League settings in plain words -------------------------------------------

export function scoringText(league: LeagueInfo) {
  switch (league.scoringType) {
    case "head":
      return "Head-to-head categories";
    case "headpoint":
      return "Head-to-head points";
    case "point":
      return "Total points";
    case "roto":
      return "Rotisserie";
    default:
      return league.scoringType;
  }
}

export function draftText(league: LeagueInfo) {
  const { draftType, isAuction } = league.settings;
  const kind = isAuction ? "auction" : "snake";
  if (draftType === "live") return `Live ${kind}`;
  if (draftType === "offline") return `Offline ${kind}`;
  return draftType ? `${kind[0].toUpperCase()}${kind.slice(1)} (${draftType})` : undefined;
}

export function tradeReviewText(type?: string) {
  if (type === "commish") return "Commissioner";
  if (type === "vote") return "League vote";
  if (type === "none") return "No review";
  return type;
}

import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { TeamLogo } from "@/components/yahoo-ui";
import type { SportId } from "@/lib/fantasy/types";
import { recordText, weekRangeText } from "@/lib/my-teams/format";
import { NAV_FORWARD } from "@/lib/navigation";
import type { StandingRow, ThisWeek } from "@/lib/yahoo/team";

/** Sports the Weekly Matchup app supports today. */
const MATCHUP_SPORTS: SportId[] = ["basketball"];

/**
 * Who the team plays this week, and nothing more: scores and category
 * breakdowns live in the Weekly Matchup app, which this card links to.
 */
export function ThisWeekCard({
  week,
  opponent,
  sport,
}: {
  week: ThisWeek;
  /** The opponent's row in the league standings, for their record */
  opponent?: StandingRow;
  sport?: SportId;
}) {
  const range = weekRangeText(week.weekStart, week.weekEnd);
  const linked = sport !== undefined && MATCHUP_SPORTS.includes(sport);

  const body = (
    <>
      <div className="shrink-0">
        <p className="text-xs text-fg-muted">{week.isPlayoffs ? "Playoffs" : "This week"}</p>
        <p className="font-display text-xl leading-tight font-bold uppercase">Week {week.week}</p>
        {range && <p className="text-xs text-fg-subtle">{range}</p>}
      </div>
      <div aria-hidden className="h-10 w-px shrink-0 bg-border" />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="text-sm text-fg-subtle">vs</span>
        <TeamLogo name={week.opponent.name} url={week.opponent.logoUrl} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{week.opponent.name}</p>
          <p className="truncate text-sm text-fg-muted">
            {[week.opponent.manager, opponent?.record && recordText(opponent.record)].filter(Boolean).join(", ")}
          </p>
        </div>
      </div>
      {linked && (
        <span className="hidden shrink-0 items-center gap-1 text-sm font-medium text-fg-muted transition-colors group-hover:text-fg sm:inline-flex">
          Open matchup
          <ArrowUpRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </>
  );

  const className = "flex items-center gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:px-5";
  if (!linked) return <section aria-label="This week's opponent" className={className}>{body}</section>;
  return (
    <Link
      href="/weekly-matchup"
      transitionTypes={NAV_FORWARD}
      aria-label={`This week: vs ${week.opponent.name}. Open in Weekly Matchup`}
      className={`group ${className} transition-[translate,border-color] duration-200 ease-out hover:border-border-strong motion-safe:hover:-translate-y-0.5`}
    >
      {body}
    </Link>
  );
}

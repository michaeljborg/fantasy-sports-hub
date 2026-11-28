import { Panel } from "@/components/dashboard/panel";
import { ArrowUpRightIcon } from "@/components/icons";
import { ordinal } from "@/lib/fantasy/format";
import { dayText, draftText, scoringText, tradeReviewText } from "@/lib/my-teams/format";
import type { LeagueInfo, TeamDetails } from "@/lib/yahoo/team";

type Row = { label: string; value?: React.ReactNode };

function Facts({ rows }: { rows: Row[] }) {
  const shown = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");
  if (!shown.length) return <p className="text-sm text-fg-muted">Nothing to show yet.</p>;
  return (
    <dl className="divide-y divide-border text-sm">
      {shown.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="text-fg-muted">{r.label}</dt>
          <dd className="text-right font-medium tabular-nums">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TeamStatus({ details, league }: { details: TeamDetails; league: LeagueInfo }) {
  const adds = details.rosterAdds;
  const coManagers = details.managers.filter((m) => !m.isMe);
  const commissioner = details.managers.some((m) => m.isMe && m.isCommissioner);

  return (
    <Panel title="Your team">
      <Facts
        rows={[
          { label: "Waiver priority", value: details.waiverPriority && ordinal(details.waiverPriority) },
          {
            label: "FAAB left",
            value: league.settings.usesFaab && details.faabBalance !== undefined ? `$${details.faabBalance}` : undefined,
          },
          { label: "Moves this season", value: details.moves },
          { label: "Trades this season", value: details.trades },
          {
            label: adds?.coverage === "week" ? "Adds this week" : "Adds this period",
            value: adds?.value,
          },
          { label: "Draft position", value: details.draftPosition && ordinal(details.draftPosition) },
          {
            label: "Draft grade",
            value: details.draftGrade && (
              <span className="inline-flex items-center gap-2">
                {details.draftGrade}
                {details.draftRecapUrl && (
                  <a
                    href={details.draftRecapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-xs font-normal text-fg-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Recap
                    <ArrowUpRightIcon className="size-3" />
                  </a>
                )}
              </span>
            ),
          },
          { label: "Co-managers", value: coManagers.map((m) => m.name).join(", ") },
          { label: "Commissioner", value: commissioner ? "You" : undefined },
        ]}
      />
    </Panel>
  );
}

export function LeagueFacts({ league }: { league: LeagueInfo }) {
  const s = league.settings;
  return (
    <Panel title="League">
      <Facts
        rows={[
          { label: "Scoring", value: scoringText(league) },
          { label: "Teams", value: league.numTeams },
          {
            label: "Playoffs",
            value: s.usesPlayoff
              ? [s.numPlayoffTeams && `${s.numPlayoffTeams} teams`, s.playoffStartWeek && `from week ${s.playoffStartWeek}`]
                  .filter(Boolean)
                  .join(", ") || "Yes"
              : "None",
          },
          {
            label: "Season",
            value:
              league.startWeek && league.endWeek
                ? `Weeks ${league.startWeek} to ${league.endWeek}${league.currentWeek ? ` (now ${league.currentWeek})` : ""}`
                : undefined,
          },
          { label: "Waivers", value: s.usesFaab ? "FAAB budget" : s.waiverType ? "Waiver priority" : undefined },
          { label: "Trade deadline", value: s.tradeEndDate && dayText(s.tradeEndDate) },
          { label: "Trade review", value: tradeReviewText(s.tradeRatifyType) },
          { label: "Draft", value: draftText(league) },
        ]}
      />
    </Panel>
  );
}

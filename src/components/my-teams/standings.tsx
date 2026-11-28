import { Panel } from "@/components/dashboard/panel";
import { TeamLogo } from "@/components/yahoo-ui";
import { ordinal } from "@/lib/fantasy/format";
import { pctText, pointsText, recordText } from "@/lib/my-teams/format";
import { cn } from "@/lib/navigation";
import type { LeagueInfo, StandingRow } from "@/lib/yahoo/team";

function Tile({ label, value, detail }: { label: string; value: React.ReactNode; detail?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-muted/60 px-4 py-3">
      <p className="text-xs text-fg-muted">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none font-bold tabular-nums">{value}</p>
      {detail && <p className="mt-1 text-xs text-fg-subtle">{detail}</p>}
    </div>
  );
}

/** This team's standing as tiles, then the whole league table. */
export function Standings({ league, teamKey }: { league: LeagueInfo; teamKey: string }) {
  const me = league.standings.find((r) => r.teamKey === teamKey);
  const playoffTeams = league.settings.usesPlayoff ? league.settings.numPlayoffTeams : undefined;

  return (
    <Panel
      title="Standings"
      description={playoffTeams ? `Top ${playoffTeams} make the playoffs.` : undefined}
    >
      {me && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile
            label="Rank"
            value={me.rank ? ordinal(me.rank) : "–"}
            detail={league.numTeams ? `of ${league.numTeams}` : undefined}
          />
          <Tile
            label="Record"
            value={me.record ? recordText(me.record) : "–"}
            detail={me.winPct !== undefined ? `${pctText(me.winPct)} win rate` : undefined}
          />
          <Tile label="Streak" value={me.streak ?? "–"} />
          <Tile
            label={me.clinchedPlayoffs ? "Playoffs" : "Playoff seed"}
            value={me.clinchedPlayoffs ? "Clinched" : me.playoffSeed ? ordinal(me.playoffSeed) : "–"}
            detail={me.clinchedPlayoffs && me.playoffSeed ? `${ordinal(me.playoffSeed)} seed` : undefined}
          />
        </div>
      )}
      <StandingsTable rows={league.standings} teamKey={teamKey} playoffTeams={playoffTeams} />
    </Panel>
  );
}

function StandingsTable({
  rows,
  teamKey,
  playoffTeams,
}: {
  rows: StandingRow[];
  teamKey: string;
  playoffTeams?: number;
}) {
  if (!rows.length) return null;
  const hasPoints = rows.some((r) => r.pointsFor !== undefined);

  return (
    <div className="mt-5 -mx-2 overflow-x-auto">
      <table className="w-full min-w-[28rem] text-sm">
        <thead>
          <tr className="text-left text-xs text-fg-subtle">
            <th className="w-10 px-2 py-2 font-medium">#</th>
            <th className="px-2 py-2 font-medium">Team</th>
            <th className="px-2 py-2 text-right font-medium">Record</th>
            <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">Pct</th>
            <th className="px-2 py-2 text-right font-medium">Streak</th>
            {hasPoints && <th className="hidden px-2 py-2 text-right font-medium md:table-cell">For</th>}
            {hasPoints && <th className="hidden px-2 py-2 text-right font-medium md:table-cell">Against</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const mine = row.teamKey === teamKey;
            const cutoff = playoffTeams !== undefined && i === playoffTeams - 1 && i < rows.length - 1;
            return (
              <tr
                key={row.teamKey}
                aria-current={mine ? "true" : undefined}
                className={cn(
                  "border-t border-border",
                  mine && "bg-surface-muted font-semibold",
                  cutoff && "border-b border-b-fg/30 border-dashed",
                )}
              >
                <td className="px-2 py-2 text-fg-muted tabular-nums">{row.rank ?? "–"}</td>
                <td className="px-2 py-2">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <TeamLogo name={row.name} url={row.logoUrl} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate">{row.name}</span>
                      {row.manager && (
                        <span className="block truncate text-xs font-normal text-fg-subtle">{row.manager}</span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{row.record ? recordText(row.record) : "–"}</td>
                <td className="hidden px-2 py-2 text-right text-fg-muted tabular-nums sm:table-cell">
                  {row.winPct !== undefined ? pctText(row.winPct) : "–"}
                </td>
                <td className="px-2 py-2 text-right text-fg-muted">{row.streak ?? "–"}</td>
                {hasPoints && (
                  <td className="hidden px-2 py-2 text-right text-fg-muted tabular-nums md:table-cell">
                    {row.pointsFor !== undefined ? pointsText(row.pointsFor) : "–"}
                  </td>
                )}
                {hasPoints && (
                  <td className="hidden px-2 py-2 text-right text-fg-muted tabular-nums md:table-cell">
                    {row.pointsAgainst !== undefined ? pointsText(row.pointsAgainst) : "–"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {playoffTeams !== undefined && playoffTeams < rows.length && (
        <p className="mt-2 px-2 text-xs text-fg-subtle">The dashed line marks the playoff cutoff.</p>
      )}
    </div>
  );
}

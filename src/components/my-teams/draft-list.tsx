import { Panel } from "@/components/dashboard/panel";
import { TeamLogo } from "@/components/yahoo-ui";
import { cn } from "@/lib/navigation";
import type { DraftPick } from "@/lib/yahoo/team";

/** The team's draft picks, marked by whether each player is still on the roster. */
export function DraftList({
  picks,
  rosterKeys,
  auction,
  summary,
}: {
  picks: DraftPick[];
  rosterKeys: Set<string>;
  auction: boolean;
  summary?: string;
}) {
  const kept = picks.filter((p) => rosterKeys.has(p.playerKey)).length;
  return (
    <Panel
      title="Draft picks"
      description={[summary, `${kept} of ${picks.length} still on your roster`].filter(Boolean).join(". ") + "."}
    >
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-fg-subtle">
              <th className="w-14 px-2 py-2 font-medium">Round</th>
              <th className="w-14 px-2 py-2 font-medium">Pick</th>
              <th className="px-2 py-2 font-medium">Player</th>
              {auction && <th className="px-2 py-2 text-right font-medium">Cost</th>}
              <th className="px-2 py-2 text-right font-medium">Now</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((pick) => {
              const onRoster = rosterKeys.has(pick.playerKey);
              const name = pick.player?.name ?? pick.playerKey;
              return (
                <tr key={`${pick.pick}-${pick.playerKey}`} className="border-t border-border">
                  <td className="px-2 py-2 text-fg-muted tabular-nums">{pick.round ?? "–"}</td>
                  <td className="px-2 py-2 text-fg-muted tabular-nums">{pick.pick ?? "–"}</td>
                  <td className="px-2 py-2">
                    <span className="flex min-w-[12rem] items-center gap-2.5">
                      <TeamLogo name={name} url={pick.player?.headshotUrl} size="sm" />
                      <span className="min-w-0">
                        <span className={cn("block truncate font-medium", !onRoster && "text-fg-muted")}>{name}</span>
                        <span className="block truncate text-xs text-fg-subtle">
                          {[pick.player?.proTeam, pick.player?.positions?.replaceAll(",", ", ")]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>
                    </span>
                  </td>
                  {auction && (
                    <td className="px-2 py-2 text-right tabular-nums">{pick.cost !== undefined ? `$${pick.cost}` : "–"}</td>
                  )}
                  <td className="px-2 py-2 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        onRoster ? "bg-success/15 text-success" : "bg-surface-muted text-fg-subtle",
                      )}
                    >
                      {onRoster ? "On roster" : "Gone"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

import { Panel } from "@/components/dashboard/panel";
import { ordinal } from "@/lib/fantasy/format";
import { pointsText, tierOf, tierText } from "@/lib/my-teams/format";
import { cn } from "@/lib/navigation";
import type { SeasonStats as Stats } from "@/lib/yahoo/team";

/** Season totals per scoring category, with the team's rank in the league for each. */
export function SeasonStats({ stats, points }: { stats: Stats; points: boolean }) {
  if (points) {
    if (stats.points === undefined) return null;
    return (
      <Panel title="Season" description="Total fantasy points this season.">
        <p className="font-display text-5xl leading-none font-bold tabular-nums">{pointsText(stats.points)}</p>
        {stats.pointsRank && (
          <p className={cn("mt-2 text-sm font-medium", tierText[tierOf(stats.pointsRank, stats.of)])}>
            {ordinal(stats.pointsRank)} of {stats.of} in the league
          </p>
        )}
      </Panel>
    );
  }

  if (!stats.categories.length) return null;
  return (
    <Panel title="Season stats" description="Season totals, and where you rank in the league in each category.">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.categories.map(({ category, value, rank, of }) => (
          <li key={category.id} title={category.name} className="rounded-xl bg-surface-muted/60 px-4 py-3">
            <p className="text-xs text-fg-muted">{category.label}</p>
            <p className="mt-1 font-display text-2xl leading-none font-bold tabular-nums">{value || "–"}</p>
            {rank && (
              <p className={cn("mt-1 text-xs font-medium", tierText[tierOf(rank, of)])}>
                {ordinal(rank)} of {of}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

import type { Metadata } from "next";
import { Panel } from "@/components/dashboard/panel";
import { WeekDots } from "@/components/dashboard/week-dots";
import { PageTransition } from "@/components/page-transition";
import { rankTier } from "@/lib/fantasy/analysis";
import { loadDashboard } from "@/lib/fantasy/dashboard";
import { formatStat } from "@/lib/fantasy/format";
import { categoryByKey } from "@/lib/fantasy/sports";
import { cn } from "@/lib/navigation";

export const metadata: Metadata = { title: "Waiver Wire" };

export default async function WaiversPage({ params }: PageProps<"/weekly-matchup/[team]/waivers">) {
  const d = await loadDashboard(params);
  const close = d.results.filter((r) => r.outcome === "close");

  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Best available"
          description="Ranked by how much they help your close categories and how many games they have left."
          className="lg:col-span-2"
        >
          <ol className="grid gap-2">
            {d.freeAgents.map((fa, i) => (
              <li
                key={fa.id}
                className="grid grid-cols-[1.5rem_1fr] gap-x-3 gap-y-2 rounded-xl p-3 ring-1 ring-border ring-inset transition-colors hover:bg-surface-muted/40 sm:grid-cols-[1.5rem_1fr_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-fg-subtle tabular-nums">{i + 1}</span>
                <div className="min-w-0">
                  <p className="font-medium">{fa.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                    <span>{fa.position}</span>
                    <span>{fa.team}</span>
                    <span>{fa.rostered}% rostered</span>
                    <WeekDots games={fa.games} days={d.week.days} today={d.week.today} />
                  </p>
                </div>
                <ul className="col-start-2 flex flex-wrap gap-1.5 sm:col-start-3 sm:justify-end">
                  {fa.helps.map((key) => {
                    const cat = categoryByKey(d.categories, key);
                    const flip = fa.flipHelps.includes(key);
                    return (
                      <li
                        key={key}
                        title={flip ? `${cat.name} is close this week` : cat.name}
                        className={cn(
                          "rounded-full px-2 py-1 font-mono text-xs tabular-nums ring-1 ring-inset",
                          flip ? "bg-warning/14 text-warning ring-warning/30" : "bg-surface-muted text-fg-muted ring-border",
                        )}
                      >
                        {cat.label} {formatStat(cat, fa.stats[key], "avg")}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title="Targeting" description="Close categories this week. Highlighted stats help here.">
            <ul className="flex flex-wrap gap-2">
              {close.map((r) => (
                <li key={r.category.key} className="rounded-full bg-warning/14 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/30 ring-inset">
                  {r.category.label}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Your weakest spots" description="Season categories ranked in the bottom third.">
            <ul className="flex flex-wrap gap-2">
              {d.seasonRanks
                .filter((r) => rankTier(r.rank, d.leagueSize) === "weak")
                .map((r) => (
                  <li key={r.key} className="rounded-full bg-surface-muted px-3 py-1 text-sm">
                    {categoryByKey(d.categories, r.key).label}
                  </li>
                ))}
            </ul>
          </Panel>
        </div>
      </div>
    </PageTransition>
  );
}

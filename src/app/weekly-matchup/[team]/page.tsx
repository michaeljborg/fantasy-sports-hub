import type { Metadata } from "next";
import { outcomeStyles } from "@/components/dashboard/outcome";
import { Panel } from "@/components/dashboard/panel";
import { RosterTable } from "@/components/dashboard/roster-table";
import { SummaryTile } from "@/components/dashboard/summary-tile";
import { RadarChart } from "@/components/dashboard/radar-chart";
import { rankTier, type Tier } from "@/lib/fantasy/analysis";
import { PageTransition } from "@/components/page-transition";
import { loadDashboard } from "@/lib/fantasy/dashboard";
import { formatStat, ordinal } from "@/lib/fantasy/format";
import { sectionHref } from "@/lib/fantasy/sections";
import { categoryByKey } from "@/lib/fantasy/sports";
import { cn } from "@/lib/navigation";

export const metadata: Metadata = { title: "My Team" };

const tierTone: Record<Tier, string> = { strong: "text-success", middle: "text-fg", weak: "text-danger" };

export default async function MyTeamPage({ params }: PageProps<"/weekly-matchup/[team]">) {
  const d = await loadDashboard(params);
  const { wins, losses, ties } = d.score;
  const pick = d.freeAgents[0];
  const target = d.tradeTargets[0];
  const label = (key: string) => categoryByKey(d.categories, key).label;
  const listDays = (days: number[]) => days.map((i) => d.week.days[i].short).join(" and ");

  // Spider chart: 1st place on the outer edge, last place at the center.
  const strength = (rank: number) => (d.leagueSize - rank) / (d.leagueSize - 1);
  const third = d.leagueSize / 3;
  const axes = d.seasonRanks.map(({ key, rank }) => {
    const cat = categoryByKey(d.categories, key);
    return { key, label: cat.label, value: strength(rank), figure: ordinal(rank), detail: `${cat.name}: ${ordinal(rank)} of ${d.leagueSize}` };
  });

  return (
    <PageTransition>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile title="Matchup" href={sectionHref(d.team.id, "matchup")}>
          <p className="font-display text-5xl leading-none font-extrabold tabular-nums">
            {wins}-{losses}-{ties}
          </p>
          <p className="mt-1 truncate text-sm text-fg-muted">vs {d.matchup.opponent.name}</p>
          <ul className="mt-auto grid grid-cols-9 gap-1 pt-4">
            {d.results.map((r) => (
              <li
                key={r.category.key}
                title={`${r.category.name}: ${outcomeStyles[r.outcome].label}`}
                className="flex flex-col items-center gap-1"
              >
                <span className={cn("h-1.5 w-full rounded-full", outcomeStyles[r.outcome].fill)} />
                <span className="text-[9px] font-medium text-fg-subtle">{r.category.label}</span>
              </li>
            ))}
          </ul>
        </SummaryTile>

        <SummaryTile title="Sit / Start" href={sectionHref(d.team.id, "sit-start")}>
          <p className="font-display text-5xl leading-none font-extrabold tabular-nums">
            {d.decisionDays.length}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {d.decisionDays.length
              ? `${listDays(d.decisionDays.map((x) => x.day))} have more players than slots.`
              : "Your lineup is set for the rest of the week."}
          </p>
        </SummaryTile>

        <SummaryTile title="Top waiver pickup" href={sectionHref(d.team.id, "waivers")}>
          <p className="font-display text-3xl leading-none font-bold uppercase">{pick.name}</p>
          <p className="mt-1.5 flex gap-2 text-sm text-fg-muted">
            <span>{pick.position}</span>
            <span>{pick.team}</span>
            <span>{pick.gamesLeft} games left</span>
          </p>
          <p className="mt-auto pt-4 text-sm">
            Helps{" "}
            <span className="font-medium">{pick.flipHelps.map(label).join(", ") || pick.helps.map(label).join(", ")}</span>
          </p>
        </SummaryTile>

        <SummaryTile title="Trade target" href={sectionHref(d.team.id, "trades")}>
          <p className="font-display text-3xl leading-none font-bold uppercase">{target.name}</p>
          <p className="mt-1.5 text-sm text-fg-muted">From {target.owner}</p>
          <p className="mt-auto pt-4 text-sm">
            Offer <span className="font-medium">{target.give}</span>
          </p>
        </SummaryTile>
      </div>

      <Panel title="Roster" description="Season averages per game" className="mt-6">
        <RosterTable players={d.roster} categories={d.categories} week={d.week} />
      </Panel>

      <Panel
        title="Season profile"
        description={`Where your team ranks in each category, out of ${d.leagueSize} teams`}
        className="mt-6"
      >
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10">
        <RadarChart
          axes={axes}
          rings={[strength(third + 0.5), strength(d.leagueSize - third + 0.5)]}
          label={`Season category ranks: ${axes.map((a) => `${a.label} ${a.figure}`).join(", ")}`}
        />
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="border-b border-border text-xs text-fg-subtle">
              <th scope="col" className="w-12 pb-2 text-left font-medium">Rank</th>
              <th scope="col" className="pb-2 text-left font-medium">Category</th>
              <th scope="col" className="w-16 pb-2 text-right font-medium">You</th>
              <th scope="col" className="w-16 pb-2 text-right font-medium">League</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {d.categories.map((cat) => {
              const { key, rank, value, leagueAvg } = d.seasonRanks.find((r) => r.key === cat.key)!;
              const tone = tierTone[rankTier(rank, d.leagueSize)];
              const better = cat.lowerIsBetter ? value < leagueAvg : value > leagueAvg;
              return (
                <tr key={key}>
                  <td className={cn("py-2 font-display text-2xl leading-none font-extrabold", tone)}>
                    {ordinal(rank)}
                  </td>
                  <th scope="row" className="max-w-0 truncate py-2 text-left font-normal">
                    <span className="font-semibold">{cat.label}</span>
                    <span className="ml-2 text-fg-muted">{cat.name}</span>
                  </th>
                  <td className="py-2 text-right font-mono font-semibold">
                    <span className="sr-only">{better ? "Above" : "Below"} league average: </span>
                    {formatStat(cat, value, "avg")}
                  </td>
                  <td className="py-2 text-right font-mono text-fg-muted">
                    {formatStat(cat, leagueAvg, "avg")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Panel>
    </PageTransition>
  );
}

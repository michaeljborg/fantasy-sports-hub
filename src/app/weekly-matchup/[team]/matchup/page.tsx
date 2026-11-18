import type { Metadata } from "next";
import { CategoryBar } from "@/components/dashboard/category-bar";
import { OutcomeBadge, outcomeStyles } from "@/components/dashboard/outcome";
import { Panel } from "@/components/dashboard/panel";
import { PageTransition } from "@/components/page-transition";
import type { CategoryResult, Outcome } from "@/lib/fantasy/analysis";
import { loadDashboard } from "@/lib/fantasy/dashboard";
import { formatGap, formatRecord, formatStat } from "@/lib/fantasy/format";
import { sectionHref } from "@/lib/fantasy/sections";
import { cn } from "@/lib/navigation";

export const metadata: Metadata = { title: "Matchup" };

const groups: { outcome: Outcome; title: string; description: string }[] = [
  { outcome: "winning", title: "Winning", description: "Comfortable leads. Keep starting your regulars." },
  { outcome: "close", title: "Close", description: "These can flip either way. Stream players who help here." },
  { outcome: "losing", title: "Losing", description: "Big gaps. Hard to win back this week." },
];

function leadText(r: CategoryResult) {
  if (r.lead === 0) return "Tied";
  return `${r.lead > 0 ? "Up" : "Down"} ${formatGap(r.category, r.gap)}`;
}

export default async function MatchupPage({ params }: PageProps<"/weekly-matchup/[team]/matchup">) {
  const d = await loadDashboard(params);
  const { me, opponent } = d.matchup;
  const { wins, losses, ties } = d.score;
  const close = d.results.filter((r) => r.outcome === "close");
  // Stagger the bar fill top to bottom across all groups.
  const order = new Map(
    groups
      .flatMap((g) => d.results.filter((r) => r.outcome === g.outcome))
      .map((r, i) => [r.category.key, i]),
  );

  return (
    <PageTransition>
      {/* Scoreboard */}
      <section className="grid items-center gap-6 rounded-card border border-border bg-surface p-6 text-center shadow-card sm:grid-cols-[1fr_auto_1fr] sm:p-8">
        <TeamSide name={me.name} record={formatRecord(me.record)} gamesLeft={d.gamesLeft.me} you />
        <div>
          <p className="font-display text-7xl leading-none font-extrabold tabular-nums sm:text-8xl">
            {wins}
            <span className="text-fg-subtle">-</span>
            {losses}
            <span className="text-fg-subtle">-</span>
            {ties}
          </p>
          <p className="mt-2 text-sm text-fg-muted">
            Day {d.week.today + 1} of {d.week.days.length}
          </p>
        </div>
        <TeamSide name={opponent.name} record={formatRecord(opponent.record)} gamesLeft={d.gamesLeft.opponent} align="right" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Category breakdown */}
        <div className="grid gap-6 lg:col-span-2">
          {groups.map((g) => {
            const results = d.results.filter((r) => r.outcome === g.outcome);
            if (!results.length) return null;
            return (
              <Panel key={g.outcome} title={`${g.title} (${results.length})`} description={g.description}>
                <ul className="divide-y divide-border">
                  {results.map((r) => (
                    <li
                      key={r.category.key}
                      className="grid grid-cols-[3.5rem_3.5rem_1fr_3.5rem] items-center gap-3 py-3 first:pt-0 last:pb-0 sm:grid-cols-[4.5rem_4rem_1fr_4rem_5.5rem]"
                    >
                      <span>
                        <span className="block font-display text-xl leading-none font-bold">{r.category.label}</span>
                        <span className={cn("text-xs font-medium", outcomeStyles[r.outcome].text)}>{leadText(r)}</span>
                      </span>
                      <span className="text-right font-mono text-sm font-semibold tabular-nums">
                        {formatStat(r.category, r.mine)}
                      </span>
                      <CategoryBar result={r} animate delay={order.get(r.category.key)! * 60} />
                      <span className="font-mono text-sm text-fg-muted tabular-nums">
                        {formatStat(r.category, r.opp)}
                      </span>
                      <OutcomeBadge outcome={r.outcome} className="hidden justify-self-end sm:inline-flex" />
                    </li>
                  ))}
                </ul>
              </Panel>
            );
          })}
        </div>

        {/* Side rail */}
        <div className="grid content-start gap-6">
          <Panel title="Flip watch" description="Close categories and what it takes to swing them." action={{ href: sectionHref(d.team.id, "waivers"), label: "Find streamers" }}>
            <ul className="grid gap-3">
              {close.map((r) => (
                <li key={r.category.key} className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-display text-lg font-bold">{r.category.label}</span>
                  <span className="text-right text-fg-muted">
                    {r.lead > 0
                      ? `Protect a ${formatGap(r.category, r.gap)} lead`
                      : `Need ${formatGap(r.category, r.gap)} to tie`}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Games left" description="Remaining games with a player active.">
            <GamesLeft mine={d.gamesLeft.me} theirs={d.gamesLeft.opponent} />
          </Panel>
        </div>
      </div>
    </PageTransition>
  );
}

function TeamSide({
  name,
  record,
  gamesLeft,
  you,
  align = "left",
}: {
  name: string;
  record: string;
  gamesLeft: number;
  you?: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" ? "sm:text-right" : "sm:text-left")}>
      <p className="text-sm text-fg-muted">{you ? "You" : "Opponent"}</p>
      <p className="mt-1 font-display text-2xl leading-tight font-bold uppercase sm:text-3xl">{name}</p>
      <p className={cn("mt-1 flex justify-center gap-3 text-sm text-fg-muted", align === "right" ? "sm:justify-end" : "sm:justify-start")}>
        <span className="font-mono tabular-nums">{record}</span>
        <span>{gamesLeft} games left</span>
      </p>
    </div>
  );
}

function GamesLeft({ mine, theirs }: { mine: number; theirs: number }) {
  const max = Math.max(mine, theirs);
  return (
    <div className="grid gap-3">
      {[
        { label: "You", n: mine, tone: "bg-(--accent)" },
        { label: "Opponent", n: theirs, tone: "bg-fg-subtle" },
      ].map((x) => (
        <div key={x.label} className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="text-fg-muted">{x.label}</span>
          <span className="h-2 rounded-full bg-surface-muted">
            <span className={cn("block h-full rounded-full", x.tone)} style={{ width: `${(x.n / max) * 100}%` }} />
          </span>
          <span className="text-right font-mono tabular-nums">{x.n}</span>
        </div>
      ))}
      <p className="text-sm text-fg-muted">
        {mine === theirs
          ? "Even on volume."
          : mine > theirs
            ? `You have ${mine - theirs} more games. Counting stats lean your way.`
            : `They have ${theirs - mine} more games. Streaming can close the gap.`}
      </p>
    </div>
  );
}

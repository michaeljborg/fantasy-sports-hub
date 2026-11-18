import type { Metadata } from "next";
import { DayStrip } from "@/components/dashboard/day-strip";
import { StatusTag } from "@/components/dashboard/outcome";
import { Panel } from "@/components/dashboard/panel";
import { PageTransition } from "@/components/page-transition";
import { loadDashboard } from "@/lib/fantasy/dashboard";
import { cn } from "@/lib/navigation";

export const metadata: Metadata = { title: "Sit / Start" };

export default async function SitStartPage({ params }: PageProps<"/weekly-matchup/[team]/sit-start">) {
  const d = await loadDashboard(params);
  const { week, slots, active } = d;
  const openDays = active
    .map((n, day) => ({ day, n }))
    .filter(({ day, n }) => day >= week.today && n < slots);

  return (
    <PageTransition>
      <Panel
        title="This week"
        description={`Players with a game each day against your ${slots} starting slots.`}
      >
        <DayStrip week={week} active={active} slots={slots} />
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Game grid" description="Who plays when. Ruled-out players don't count." className="lg:col-span-2">
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-fg-subtle">
                  <th scope="col" className="sticky left-0 z-10 bg-surface py-2 pr-3 pl-5 text-left font-medium sm:pl-6">Player</th>
                  {week.days.map((day, i) => (
                    <th
                      key={day.short}
                      scope="col"
                      className={cn("px-1 py-2 text-center font-medium last:pr-5 sm:last:pr-6", i === week.today && "text-(--accent)")}
                    >
                      {day.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.roster.map((p) => (
                  <tr key={p.id} className={cn("border-b border-border", p.status === "out" && "opacity-50")}>
                    <th scope="row" className="sticky left-0 z-10 bg-surface py-2 pr-3 pl-5 text-left font-normal sm:pl-6">
                      <span className="flex items-center gap-2">
                        <span className="font-medium whitespace-nowrap">{p.name}</span>
                        <StatusTag status={p.status} />
                      </span>
                      <span className="text-xs text-fg-subtle">{p.position}</span>
                    </th>
                    {week.days.map((_, i) => {
                      const plays = p.games.includes(i);
                      return (
                        <td key={i} className={cn("px-1 py-2 text-center last:pr-5 sm:last:pr-6", i === week.today && "bg-(--accent)/5")}>
                          {plays ? (
                            <span
                              className={cn(
                                "inline-block size-5 rounded-md",
                                i < week.today ? "bg-fg/15" : p.status === "out" ? "bg-danger/25" : "bg-(--accent)/80",
                              )}
                              aria-label="Game"
                            />
                          ) : (
                            <span className="inline-block size-5 rounded-md bg-surface-muted/60" aria-hidden="true" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-xs">
                  <th scope="row" className="sticky left-0 z-10 bg-surface py-2.5 pr-3 pl-5 text-left font-medium text-fg-muted sm:pl-6">
                    Active
                  </th>
                  {active.map((n, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-1 py-2.5 text-center font-mono font-semibold tabular-nums last:pr-5 sm:last:pr-6",
                        i < week.today ? "text-fg-subtle" : n > slots ? "text-warning" : "text-fg",
                      )}
                    >
                      {n}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title="Decisions to make">
            {d.decisionDays.length ? (
              <ul className="grid gap-3 text-sm">
                {d.decisionDays.map(({ day, n }) => (
                  <li key={day} className="rounded-xl bg-warning/10 p-3 ring-1 ring-warning/25 ring-inset">
                    <p className="font-medium">
                      {week.days[day].short} {week.days[day].date}
                    </p>
                    <p className="mt-0.5 text-fg-muted">
                      {n} players for {slots} slots. Bench {n - slots}.
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">Nothing to set. Every remaining day fits your lineup.</p>
            )}
          </Panel>

          <Panel title="Open slots" description="Days you can add a streamer without benching anyone.">
            <ul className="flex flex-wrap gap-2">
              {openDays.map(({ day, n }) => (
                <li key={day} className="rounded-full bg-surface-muted px-3 py-1 text-sm">
                  {week.days[day].short}{" "}
                  <span className="font-mono text-fg-muted tabular-nums">+{slots - n}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </PageTransition>
  );
}

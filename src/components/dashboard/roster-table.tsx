import { formatStat } from "@/lib/fantasy/format";
import type { Category, Player, Week } from "@/lib/fantasy/types";
import { StatusTag } from "./outcome";
import { WeekDots } from "./week-dots";

const groups = [
  { label: "Starters", match: (p: Player) => p.slot !== "BN" && p.slot !== "IL" },
  { label: "Bench", match: (p: Player) => p.slot === "BN" },
  { label: "Injured list", match: (p: Player) => p.slot === "IL" },
];

/** Season averages for every rostered player. Scrolls sideways on small screens. */
export function RosterTable({
  players,
  categories,
  week,
}: {
  players: Player[];
  categories: Category[];
  week: Week;
}) {
  const cols = categories.length + 3;
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[52rem] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-border text-xs text-fg-subtle">
            <th scope="col" className="sticky left-0 z-10 bg-surface py-2 pr-3 pl-5 text-left font-medium sm:pl-6">Player</th>
            <th scope="col" className="px-2 py-2 text-left font-medium">Slot</th>
            <th scope="col" className="px-2 py-2 text-left font-medium">This week</th>
            {categories.map((c) => (
              <th key={c.key} scope="col" title={c.name} className="px-2 py-2 text-right font-medium last:pr-5 sm:last:pr-6">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((group) => {
          const rows = players.filter(group.match);
          if (!rows.length) return null;
          return (
            <tbody key={group.label}>
              <tr>
                <th colSpan={cols} scope="colgroup" className="bg-surface-muted/50 px-5 py-1.5 text-left text-xs font-semibold text-fg-muted sm:px-6">
                  {group.label}
                </th>
              </tr>
              {rows.map((p) => (
                <tr key={p.id} className="group border-b border-border last:border-0 hover:bg-surface-muted/40">
                  <th scope="row" className="sticky left-0 z-10 bg-surface py-2.5 pr-3 pl-5 text-left font-normal group-hover:bg-surface-muted sm:pl-6">
                    <span className="flex items-center gap-2">
                      <span className="font-medium whitespace-nowrap">{p.name}</span>
                      <StatusTag status={p.status} />
                    </span>
                    <span className="mt-0.5 flex gap-2 text-xs text-fg-subtle">
                      <span>{p.position}</span>
                      <span>{p.team}</span>
                    </span>
                  </th>
                  <td className="px-2 py-2.5 font-mono text-xs text-fg-muted">{p.slot}</td>
                  <td className="px-2 py-2.5">
                    <WeekDots games={p.games} days={week.days} today={week.today} />
                  </td>
                  {categories.map((c) => (
                    <td key={c.key} className="px-2 py-2.5 text-right font-mono text-[13px] last:pr-5 sm:last:pr-6">
                      {formatStat(c, p.stats[c.key], "avg")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

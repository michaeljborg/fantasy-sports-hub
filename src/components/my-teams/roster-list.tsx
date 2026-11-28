import { Panel } from "@/components/dashboard/panel";
import { TeamLogo } from "@/components/yahoo-ui";
import { pointsText } from "@/lib/my-teams/format";
import { cn } from "@/lib/navigation";
import type { RosterPlayer, StatCategory } from "@/lib/yahoo/team";

const OUT = new Set(["O", "INJ", "IL", "IL+", "IR", "IR-LT", "IR-NR", "NA", "SUSP", "PUP-P", "PUP-R", "NFI-R"]);

/** Yahoo's injury code as a badge: red for out, amber for questionable. */
export function PlayerStatus({ player }: { player: RosterPlayer }) {
  if (!player.status) return null;
  return (
    <span
      title={player.statusFull ?? player.status}
      className={cn(
        "rounded px-1 py-px text-[10px] leading-none font-bold",
        OUT.has(player.status) ? "bg-danger/15 text-danger" : "bg-warning/18 text-warning",
      )}
    >
      {player.status}
    </span>
  );
}

const INJURED_SLOTS = new Set(["IL", "IL+", "IR", "IR+", "NA"]);

function groupOf(slot?: string) {
  if (slot === "BN") return "bench";
  if (slot && INJURED_SLOTS.has(slot)) return "injured";
  return "starters";
}

const GROUPS = [
  { id: "starters", title: "Starters" },
  { id: "bench", title: "Bench" },
  { id: "injured", title: "Injured list" },
] as const;

const POSITION_TYPE_LABEL: Record<string, string> = { P: "Skaters", G: "Goalies" };

/** The roster grouped by slot, each with season stats for the league's scoring categories. */
export function RosterList({
  players,
  categories,
  points,
  sport,
}: {
  players: RosterPlayer[];
  categories: StatCategory[];
  points: boolean;
  sport?: string;
}) {
  return (
    <div className="space-y-6">
      {GROUPS.map((group) => {
        const inGroup = players.filter((p) => groupOf(p.slot) === group.id);
        if (!inGroup.length) return null;

        // Hockey splits skaters and goalies, which score different categories.
        const types = sport === "hockey" ? [...new Set(inGroup.map((p) => p.positionType ?? ""))] : [""];
        return (
          <Panel key={group.id} title={group.title} description={`${inGroup.length} players`}>
            <div className="space-y-6">
              {types.map((type) => {
                const rows = type ? inGroup.filter((p) => (p.positionType ?? "") === type) : inGroup;
                const cols = points
                  ? []
                  : categories.filter((c) => !type || !c.positionTypes.length || c.positionTypes.includes(type));
                return (
                  <div key={type || "all"}>
                    {types.length > 1 && (
                      <h3 className="mb-2 text-sm font-semibold text-fg-muted">
                        {POSITION_TYPE_LABEL[type] ?? type}
                      </h3>
                    )}
                    <RosterTable players={rows} columns={cols} points={points} />
                  </div>
                );
              })}
            </div>
          </Panel>
        );
      })}
      <p className="text-xs text-fg-subtle">Season stats. Slots are for today&apos;s lineup.</p>
    </div>
  );
}

function RosterTable({
  players,
  columns,
  points,
}: {
  players: RosterPlayer[];
  columns: StatCategory[];
  points: boolean;
}) {
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-fg-subtle">
            <th className="w-12 px-2 py-2 font-medium">Slot</th>
            <th className="px-2 py-2 font-medium">Player</th>
            {columns.map((c) => (
              <th key={c.id} title={c.name} className="px-2 py-2 text-right font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {points && <th className="px-2 py-2 text-right font-medium">Pts</th>}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.playerKey} className="border-t border-border">
              <td className="px-2 py-2 text-xs font-semibold text-fg-muted">{p.slot ?? "–"}</td>
              <td className="px-2 py-2">
                <span className="flex min-w-[12rem] items-center gap-2.5">
                  <TeamLogo name={p.name} url={p.headshotUrl} size="sm" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{p.name}</span>
                      <PlayerStatus player={p} />
                    </span>
                    <span className="block truncate text-xs text-fg-subtle">
                      {[p.proTeam, p.positions?.replaceAll(",", ", ")].filter(Boolean).join(" · ")}
                    </span>
                    {p.injuryNote && <span className="block truncate text-xs text-fg-muted">{p.injuryNote}</span>}
                  </span>
                </span>
              </td>
              {columns.map((c) => (
                <td key={c.id} className="px-2 py-2 text-right text-fg-muted tabular-nums">
                  {p.stats[c.id] || "–"}
                </td>
              ))}
              {points && (
                <td className="px-2 py-2 text-right font-medium tabular-nums">
                  {p.points !== undefined ? pointsText(p.points) : "–"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

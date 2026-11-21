"use client";

import { useMemo, useState } from "react";
import { filterPlayers } from "@/lib/draft/board";
import { allPositions } from "@/lib/draft/sports";
import type { Player } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { PositionBadge, positionOptions, Segmented, SelectField } from "./controls";
import { useSportState } from "./draft-state";
import { DraftAction, WatchStar } from "./player-table";

type Mode = "tiers" | "watchlist";

const modes: { id: Mode; label: string }[] = [
  { id: "tiers", label: "Tiers" },
  { id: "watchlist", label: "Watchlist" },
];

/** Third board column: Tiers and Watchlist (football), or just the Watchlist. */
export function SidePanel() {
  const d = useSportState();
  const [mode, setMode] = useState<Mode>(d.sport.hasTiers ? "tiers" : "watchlist");
  const [position, setPosition] = useState("ALL");

  const byRank = useMemo(() => [...filterPlayers(d.players, { position })].sort((a, b) => a.rank - b.rank), [d.players, position]);

  // All positions use the overall tier; a single position uses its own tier scale.
  const groups = useMemo(() => {
    const field = position === "ALL" ? "tier" : "positionTier";
    const tiers = new Map<number, Player[]>();
    const unranked: Player[] = [];
    for (const p of byRank) {
      const t = p[field];
      if (t == null) unranked.push(p);
      else tiers.set(t, [...(tiers.get(t) ?? []), p]);
    }
    return [
      ...[...tiers.entries()].sort((a, b) => a[0] - b[0]).map(([t, list]) => ({ label: `Tier ${t}`, list })),
      ...(unranked.length ? [{ label: "Unranked", list: unranked }] : []),
    ];
  }, [byRank, position]);

  const watched = byRank.filter((p) => d.watchlist.has(p.id));
  const showTiers = d.sport.hasTiers && mode === "tiers";

  return (
    <BoardPanel
      title={showTiers ? "Tiers" : "Watchlist"}
      toolbar={
        <>
          {d.sport.hasTiers && <Segmented label="Show" options={modes} value={mode} onChange={setMode} />}
          <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(allPositions(d.sport))} />
        </>
      }
    >
      {showTiers ? (
        groups.map((g) => (
          <div key={g.label}>
            <h3 className="sticky top-0 z-10 bg-surface-muted px-5 py-1.5 text-xs font-semibold text-fg-muted sm:px-6">{g.label}</h3>
            <ul>
              {g.list.map((p) => (
                <PlayerListRow key={p.id} player={p} />
              ))}
            </ul>
          </div>
        ))
      ) : watched.length ? (
        <ul>
          {watched.map((p) => (
            <PlayerListRow key={p.id} player={p} />
          ))}
        </ul>
      ) : (
        <p className="px-6 py-12 text-center text-sm text-fg-muted">Star players on the board to keep an eye on them here.</p>
      )}
    </BoardPanel>
  );
}

function PlayerListRow({ player }: { player: Player }) {
  const d = useSportState();
  const taken = d.taken.has(player.id);
  const implied = d.impliedTaken.has(player.id);
  return (
    <li
      className={cn(
        "flex items-center gap-2 border-b border-border px-4 py-1.5 text-sm transition-[background-color,opacity] duration-150 last:border-0 sm:px-5",
        d.mine.has(player.id) ? "bg-(--accent)/8" : taken ? "text-fg-subtle" : implied && "opacity-60 [&_.name]:line-through",
      )}
    >
      <WatchStar id={player.id} />
      <span className="w-6 shrink-0 font-mono text-xs text-fg-subtle tabular-nums">{player.rank}</span>
      <span className="name min-w-0 flex-1 truncate font-medium">{player.name}</span>
      <PositionBadge label={player.positions[0]} muted={taken} />
      <DraftAction id={player.id} />
    </li>
  );
}

"use client";

import { useMemo, useState } from "react";
import { filterPlayers, type PositionFilter } from "@/lib/draft/board";
import { footballPositions } from "@/lib/draft/sports";
import type { Player } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, PositionBadge, positionOptions, Segmented, SelectField } from "./controls";
import { useDraft } from "./draft-state";
import { rowTone, WatchStar } from "./rankings-panel";
import { useRowSelect } from "./use-row-select";

type Mode = "tiers" | "watchlist";

const modes: { id: Mode; label: string }[] = [
  { id: "tiers", label: "Tiers" },
  { id: "watchlist", label: "Watchlist" },
];

/** Tiers and your watchlist, sharing one column. */
export function TiersPanel() {
  const { football: f } = useDraft();
  const select = useRowSelect();
  const [mode, setMode] = useState<Mode>("tiers");
  const [position, setPosition] = useState<PositionFilter>("ALL");

  const byRank = useMemo(() => [...filterPlayers(f.players, position)].sort((a, b) => a.rank - b.rank), [f.players, position]);

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

  const watched = byRank.filter((p) => f.watchlist.has(p.id));

  return (
    <BoardPanel
      title={mode === "tiers" ? "Tiers" : "Watchlist"}
      toolbar={
        <>
          <Segmented label="Show" options={modes} value={mode} onChange={setMode} />
          <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(footballPositions)} />
        </>
      }
    >
      {mode === "tiers" ? (
        groups.map((g) => (
          <div key={g.label}>
            <h3 className="sticky top-0 z-10 bg-surface-muted px-5 py-1.5 text-xs font-semibold text-fg-muted sm:px-6">
              {g.label}
            </h3>
            <ul>
              {g.list.map((p) => (
                <PlayerListRow key={p.id} player={p} select={select} />
              ))}
            </ul>
          </div>
        ))
      ) : watched.length ? (
        <ul>
          {watched.map((p) => (
            <PlayerListRow key={p.id} player={p} select={select} />
          ))}
        </ul>
      ) : (
        <p className="px-6 py-12 text-center text-sm text-fg-muted">
          Star players in Rankings or Tiers to keep an eye on them here.
        </p>
      )}
    </BoardPanel>
  );
}

function PlayerListRow({ player, select }: { player: Player; select: ReturnType<typeof useRowSelect> }) {
  const { football: f } = useDraft();
  const drafted = f.drafted.has(player.id);
  const implied = !drafted && f.impliedTaken.has(player.id);

  return (
    <li
      onClick={() => select.rowClick(player.id)}
      title={select.rowTitle(player.id)}
      className={cn(
        "flex cursor-pointer items-center gap-2 border-b border-border px-4 py-1.5 text-sm transition-[background-color,opacity] duration-150 last:border-0 sm:px-5",
        rowTone({ drafted, implied, selected: select.selected === player.id }),
      )}
    >
      <WatchStar id={player.id} />
      <span className="w-6 shrink-0 font-mono text-xs text-fg-subtle tabular-nums">{player.rank}</span>
      <span className="name min-w-0 flex-1 truncate font-medium">{player.name}</span>
      {select.showDraftButton(player.id) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            select.draft(player.id);
          }}
          className={buttonStyles.small}
        >
          Draft
        </button>
      )}
      <PositionBadge label={player.position} muted={drafted || implied} />
    </li>
  );
}

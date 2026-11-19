"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { Modal } from "@/components/ui/dialog";
import { filterPlayers, formatAdp, sortPlayers, withPickDividers, type PlayerSortKey, type PositionFilter } from "@/lib/draft/board";
import { footballPositions } from "@/lib/draft/sports";
import type { Player } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { buttonStyles, PickBar, PositionBadge, positionOptions, SearchField, SelectField, SortTh, useSort } from "./controls";
import { useDraft } from "./draft-state";

/**
 * Pick a player for a scenario: the full board with this scenario's pick
 * markers. The target pick is highlighted and scrolled into view.
 */
export function TreePlayerPicker({
  title,
  myPicks,
  targetPick,
  excludeIds,
  onSelect,
  onClose,
}: {
  title: string;
  myPicks: number[];
  targetPick?: number;
  /** Players already used earlier in this path */
  excludeIds: Set<string>;
  onSelect: (player: Player) => void;
  onClose: () => void;
}) {
  const { football } = useDraft();
  const sort = useSort<PlayerSortKey>("rank");
  const [position, setPosition] = useState<PositionFilter>("ALL");
  const [query, setQuery] = useState("");
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    target.current?.scrollIntoView({ block: "center" });
  }, []);

  const players = useMemo(
    () => filterPlayers(sortPlayers(football.players, sort.key, sort.dir), position, query),
    [football.players, sort.key, sort.dir, position, query],
  );
  const rows =
    sort.key === "rank" && sort.dir === "asc"
      ? withPickDividers(players, myPicks)
      : players.map((player) => ({ kind: "player" as const, player }));

  return (
    <Modal label={title} onClose={onClose} className="h-[min(44rem,calc(100dvh-2rem))] w-[min(52rem,calc(100vw-2rem))] p-0">
      <form method="dialog" className="flex h-full flex-col">
        <header className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-6">
          <h2 className="mr-auto font-display text-2xl leading-tight font-bold uppercase">{title}</h2>
          <button aria-label="Close" className={buttonStyles.icon}>
            <CloseIcon />
          </button>
        </header>
        <div className="flex flex-wrap gap-2 px-5 pt-4 sm:px-6">
          <SearchField value={query} onChange={setQuery} autoFocus className="min-w-40 flex-1" />
          <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(footballPositions)} />
        </div>
        <div className="mt-4 min-h-0 flex-1 overflow-auto border-t border-border">
          <table className="w-full min-w-[34rem] text-sm tabular-nums">
            <thead className="sticky top-0 z-10 bg-surface text-xs text-fg-subtle shadow-[inset_0_-1px_0_var(--border)]">
              <tr className="text-left">
                <SortTh label="Rank" sortKey="rank" sort={sort} className="w-16 pl-5 sm:pl-6" />
                <SortTh label="ADP" sortKey="adp" sort={sort} className="w-16" />
                <SortTh label="Player" sortKey="name" sort={sort} />
                <th scope="col" className="w-16 px-2 py-2 font-medium">Pos</th>
                <SortTh label="Team" sortKey="team" sort={sort} className="w-16" />
                <SortTh label="Bye" sortKey="bye" sort={sort} className="w-14 pr-5 sm:pr-6" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                if (row.kind === "pick") {
                  const isTarget = row.pick === targetPick;
                  return (
                    <tr key={`pick-${row.pick}`}>
                      <td colSpan={6} className="p-0">
                        <div ref={isTarget ? target : undefined}>
                          <PickBar pick={row.pick} highlight={isTarget} />
                        </div>
                      </td>
                    </tr>
                  );
                }
                const p = row.player;
                const used = excludeIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      if (used) return;
                      onSelect(p);
                    }}
                    title={used ? "Already used earlier in this scenario" : "Choose this player"}
                    className={cn(
                      "border-b border-border transition-colors duration-150",
                      used ? "cursor-not-allowed text-fg-subtle" : "cursor-pointer hover:bg-surface-muted/50 active:bg-surface-muted",
                    )}
                  >
                    <td className="py-2 pl-5 font-mono font-semibold sm:pl-6">{p.rank}</td>
                    <td className="px-2 py-2 font-mono text-fg-muted">{formatAdp(p.adp)}</td>
                    <td className="px-2 py-2 font-medium">{p.name}</td>
                    <td className="px-2 py-2">
                      <PositionBadge label={p.position} muted={used} />
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-fg-muted">{p.team}</td>
                    <td className="py-2 pr-5 pl-2 font-mono text-fg-muted sm:pr-6">{p.bye ?? "–"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </form>
    </Modal>
  );
}


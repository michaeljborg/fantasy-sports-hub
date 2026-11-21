"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { StarIcon } from "@/components/icons";
import { filterPlayers, sortPlayers, withPickDividers } from "@/lib/draft/board";
import { formatStat } from "@/lib/draft/sports";
import type { Player } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { buttonStyles, PickBar, PositionBadge, positionOptions, SearchField, Segmented, SelectField, SortTh, useSort } from "./controls";
import { useSportState } from "./draft-state";

/** Board: draft and edit ranks. Picker: choose a player for a scenario. */
type Mode =
  | { kind: "board" }
  | {
      kind: "picker";
      /** This scenario's picks, for the "Pick N" markers */
      myPicks: number[];
      targetPick?: number;
      /** Players already used earlier in this scenario path */
      excludeIds: Set<string>;
      onSelect: (player: Player) => void;
    };

/** Search, view, position filter and the scrolling table body. */
export function PlayerTable({ mode, toolbarEnd }: { mode: Mode; toolbarEnd?: React.ReactNode }) {
  const d = useSportState();
  const views = d.sport.views;
  const [viewId, setViewId] = useState(views[0].id);
  const [position, setPosition] = useState("ALL");
  const [query, setQuery] = useState("");
  const sort = useSort<string>("rank");
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const picker = mode.kind === "picker" ? mode : null;
  const target = useRef<HTMLDivElement>(null);

  useEffect(() => {
    target.current?.scrollIntoView({ block: "center" });
  }, []);

  const players = useMemo(
    () => filterPlayers(sortPlayers(d.players, sort.key, sort.dir), { view, position, query }),
    [d.players, sort.key, sort.dir, view, position, query],
  );
  // Pick markers only make sense in natural rank order.
  const rows =
    sort.key === "rank" && sort.dir === "asc"
      ? withPickDividers(players, picker ? picker.myPicks : d.myPicks)
      : players.map((player) => ({ kind: "player" as const, player }));
  const colSpan = 4 + (picker ? 0 : 1) + view.columns.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">
        {views.length > 1 && (
          <Segmented
            label="Players"
            options={views.map((v) => ({ id: v.id, label: v.label }))}
            value={view.id}
            onChange={(id) => {
              setViewId(id);
              setPosition("ALL");
              sort.reset();
            }}
          />
        )}
        <SearchField value={query} onChange={setQuery} autoFocus={!!picker} className="min-w-40 flex-1" />
        {view.positions && <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(view.positions)} />}
        {toolbarEnd}
      </div>
      <div className="mt-4 max-h-[70dvh] min-h-0 flex-1 overflow-auto border-t border-border lg:max-h-none">
        <table className="w-full min-w-[40rem] text-sm tabular-nums">
          <thead className="sticky top-0 z-10 bg-surface text-xs text-fg-subtle shadow-[inset_0_-1px_0_var(--border)]">
            <tr className="text-left">
              <SortTh label="Rank" sortKey="rank" sort={sort} className="w-16 pl-5 sm:pl-6" />
              <SortTh label="Player" sortKey="name" sort={sort} />
              <th scope="col" className="px-2 py-2 font-medium">Pos</th>
              <SortTh label="Team" sortKey="team" sort={sort} className="w-14" />
              {!picker && <th scope="col" className="w-24 px-2 py-2 font-medium">Status</th>}
              {view.columns.map((c) =>
                c.format === "text" ? (
                  <th key={c.key} scope="col" title={c.title} className="w-16 px-2 py-2 font-medium last:pr-5 sm:last:pr-6">
                    {c.label}
                  </th>
                ) : (
                  <SortTh key={c.key} label={c.label} sortKey={c.key} sort={sort} title={c.title} className="w-14 last:pr-5 sm:last:pr-6" />
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.kind === "pick") {
                const isTarget = picker?.targetPick === row.pick;
                return (
                  <tr key={`pick-${row.pick}`}>
                    <td colSpan={colSpan} className="p-0">
                      <div ref={isTarget ? target : undefined}>
                        <PickBar pick={row.pick} highlight={isTarget} />
                      </div>
                    </td>
                  </tr>
                );
              }
              const p = row.player;
              if (picker) {
                const used = picker.excludeIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => !used && picker.onSelect(p)}
                    title={used ? "Already used earlier in this scenario" : "Choose this player"}
                    className={cn(
                      "border-b border-border transition-colors duration-150",
                      used ? "cursor-not-allowed text-fg-subtle" : "cursor-pointer hover:bg-surface-muted/50 active:bg-surface-muted",
                    )}
                  >
                    <td className="py-2 pl-5 font-mono font-semibold sm:pl-6">{p.rank}</td>
                    <td className="px-2 py-2 font-medium whitespace-nowrap">{p.name}</td>
                    <PositionCell player={p} muted={used} />
                    <td className="px-2 py-2 font-mono text-xs text-fg-muted">{p.team}</td>
                    <StatCells player={p} columns={view.columns} />
                  </tr>
                );
              }
              return <BoardRow key={p.id} player={p} columns={view.columns} />;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BoardRow({ player: p, columns }: { player: Player; columns: Parameters<typeof StatCells>[0]["columns"] }) {
  const d = useSportState();
  const mine = d.mine.has(p.id);
  const taken = d.taken.has(p.id);
  const implied = d.impliedTaken.has(p.id);
  return (
    <tr
      className={cn(
        "border-b border-border transition-[background-color,opacity] duration-150",
        mine ? "bg-(--accent)/8" : taken ? "text-fg-subtle" : implied ? "opacity-60 [&_.name]:line-through" : "hover:bg-surface-muted/50",
      )}
    >
      <td className="py-1.5 pl-5 sm:pl-6">
        <RankInput player={p} />
      </td>
      <td className="px-2 py-1.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <WatchStar id={p.id} />
          <span className="name font-medium whitespace-nowrap">{p.name}</span>
        </span>
      </td>
      <PositionCell player={p} muted={taken} />
      <td className="px-2 py-1.5 font-mono text-xs text-fg-muted">{p.team}</td>
      <td className="px-2 py-1.5">
        <DraftAction id={p.id} />
      </td>
      <StatCells player={p} columns={columns} />
    </tr>
  );
}

/** Rank you can click to edit. */
function RankInput({ player }: { player: Player }) {
  const d = useSportState();
  return (
    <input
      type="number"
      inputMode="numeric"
      value={player.rank}
      title="Edit rank"
      aria-label={`${player.name} rank`}
      onChange={(e) => d.setRank(player.id, Number(e.target.value))}
      className="w-11 rounded-md border border-border bg-surface-muted/50 px-1.5 py-0.5 font-mono font-semibold outline-none [appearance:textfield] hover:border-border-strong focus-visible:border-(--accent) focus-visible:bg-surface [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

function PositionCell({ player, muted }: { player: Player; muted?: boolean }) {
  return (
    <td className="px-2 py-1.5">
      <span className="flex gap-1">
        {player.positions.map((pos) => (
          <PositionBadge key={pos} label={pos} muted={muted} />
        ))}
      </span>
    </td>
  );
}

function StatCells({ player, columns }: { player: Player; columns: { key: string; format: "int" | "dec1" | "pct" | "text" }[] }) {
  return columns.map((c) => (
    <td key={c.key} className={cn("px-2 py-1.5 font-mono last:pr-5 sm:last:pr-6", c.format === "text" && "text-xs text-fg-muted")}>
      {formatStat(player.stats[c.key], c.format)}
    </td>
  ));
}

/** Draft button, or Mine / Taken to undo. */
export function DraftAction({ id }: { id: string }) {
  const d = useSportState();
  if (d.mine.has(id) || d.taken.has(id)) {
    return (
      <button
        type="button"
        onClick={() => d.undo(id)}
        title="Undo this pick"
        className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg-muted transition-colors hover:bg-danger/12 hover:text-danger"
      >
        {d.mine.has(id) ? "Mine" : "Taken"}
      </button>
    );
  }
  const toMe = d.draftTarget != null;
  const blocked = d.nextPickIsMine && d.rosterFull && d.armedPick == null;
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => d.draft(id)}
      title={blocked ? "Your roster is full" : toMe ? `Draft to your team (pick ${d.draftTarget})` : "Mark as taken by another team"}
      className={cn(buttonStyles.small, toMe && "bg-success")}
    >
      Draft
    </button>
  );
}

export function WatchStar({ id }: { id: string }) {
  const d = useSportState();
  const watched = d.watchlist.has(id);
  return (
    <button
      type="button"
      onClick={() => d.toggleWatch(id)}
      aria-pressed={watched}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full transition-[color,scale] duration-150 active:scale-90",
        watched ? "text-warning" : "text-fg-subtle/60 hover:text-warning",
      )}
    >
      <StarIcon filled={watched} className="size-4" />
    </button>
  );
}

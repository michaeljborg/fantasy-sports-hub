"use client";

import { useMemo, useState } from "react";
import { StarIcon } from "@/components/icons";
import { filterPlayers, formatAdp, sortPlayers, withPickDividers, type PlayerSortKey, type PositionFilter } from "@/lib/draft/board";
import { footballPositions } from "@/lib/draft/sports";
import type { Player } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, PickDivider, PositionBadge, positionOptions, SearchField, SelectField, SortTh, useSort } from "./controls";
import { useDraft } from "./draft-state";
import { useRowSelect } from "./use-row-select";

export function WatchStar({ id }: { id: string }) {
  const { football } = useDraft();
  const watched = football.watchlist.has(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        football.toggleWatch(id);
      }}
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

/** Row tone for drafted / probably taken / selected players. */
export function rowTone(state: { drafted: boolean; implied: boolean; selected: boolean }) {
  if (state.drafted) return "opacity-45 [&_.name]:line-through";
  if (state.implied) return "opacity-60 hover:opacity-85 [&_.name]:line-through";
  if (state.selected) return "bg-(--accent)/8";
  return "hover:bg-surface-muted/50";
}

/** Full player pool: search, filter, sort, edit ranks, draft. */
export function RankingsPanel() {
  const { football: f } = useDraft();
  const select = useRowSelect();
  const sort = useSort<PlayerSortKey>("rank");
  const [position, setPosition] = useState<PositionFilter>("ALL");
  const [query, setQuery] = useState("");

  const players = useMemo(
    () => filterPlayers(sortPlayers(f.players, sort.key, sort.dir), position, query),
    [f.players, sort.key, sort.dir, position, query],
  );
  // Pick markers only make sense in natural rank order.
  const rows = sort.key === "rank" && sort.dir === "asc" ? withPickDividers(players, f.myPicks) : players.map((player) => ({ kind: "player" as const, player }));

  return (
    <BoardPanel
      title="Rankings"
      toolbar={
        <>
          <SearchField value={query} onChange={setQuery} className="min-w-40 flex-1" />
          <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(footballPositions)} />
        </>
      }
    >
      <table className="w-full min-w-[36rem] text-sm tabular-nums">
        <thead className="sticky top-0 z-10 bg-surface text-xs text-fg-subtle shadow-[inset_0_-1px_0_var(--border)]">
          <tr className="text-left">
            <SortTh label="Rank" sortKey="rank" sort={sort} className="w-16 pl-5 sm:pl-6" />
            <SortTh label="ADP" sortKey="adp" sort={sort} className="w-16" title="Average draft position" />
            <SortTh label="Player" sortKey="name" sort={sort} />
            <th scope="col" className="w-16 px-2 py-2 font-medium">Pos</th>
            <SortTh label="Team" sortKey="team" sort={sort} className="w-16" />
            <SortTh label="Bye" sortKey="bye" sort={sort} className="w-14 pr-5 sm:pr-6" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            row.kind === "pick" ? (
              <PickDivider key={`pick-${row.pick}`} pick={row.pick} colSpan={6} />
            ) : (
              <RankingRow key={row.player.id} player={row.player} select={select} />
            ),
          )}
        </tbody>
      </table>
    </BoardPanel>
  );
}

function RankingRow({ player, select }: { player: Player; select: ReturnType<typeof useRowSelect> }) {
  const { football: f } = useDraft();
  const drafted = f.drafted.has(player.id);
  const implied = !drafted && f.impliedTaken.has(player.id);

  return (
    <tr
      onClick={() => select.rowClick(player.id)}
      title={select.rowTitle(player.id)}
      className={cn(
        "cursor-pointer border-b border-border transition-[background-color,opacity] duration-150",
        rowTone({ drafted, implied, selected: select.selected === player.id }),
      )}
    >
      <td className="py-1.5 pl-5 sm:pl-6">
        <input
          type="number"
          inputMode="numeric"
          value={player.rank}
          aria-label={`${player.name} rank`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => f.setRank(player.id, Number(e.target.value))}
          className="w-12 rounded-md bg-transparent px-1 py-0.5 font-mono font-semibold outline-none [appearance:textfield] hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-1 focus-visible:ring-(--accent) [&::-webkit-inner-spin-button]:appearance-none"
        />
      </td>
      <td className="px-2 py-1.5 font-mono text-fg-muted">{formatAdp(player.adp)}</td>
      <td className="px-2 py-1.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <WatchStar id={player.id} />
          <span className="name truncate font-medium">{player.name}</span>
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
        </span>
      </td>
      <td className="px-2 py-1.5">
        <PositionBadge label={player.position} muted={drafted || implied} />
      </td>
      <td className="px-2 py-1.5 font-mono text-xs text-fg-muted">{player.team}</td>
      <td className="py-1.5 pr-5 pl-2 font-mono text-fg-muted sm:pr-6">{player.bye ?? "–"}</td>
    </tr>
  );
}

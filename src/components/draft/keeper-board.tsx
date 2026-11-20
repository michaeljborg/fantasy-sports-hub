"use client";

import { useMemo, useState } from "react";
import { ConfirmButton } from "@/components/ui/dialog";
import { basketballPositions, skaterPositions } from "@/lib/draft/sports";
import type { BasketballPlayer, HockeyGoalie, HockeySkater, KeeperPlayer, KeeperSportId } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, PositionBadge, positionOptions, SearchField, Segmented, SelectField, SortTh, Switch, useSort } from "./controls";
import { useDraft, type KeeperBoardState } from "./draft-state";

/* ---------- Per-sport columns ---------- */

type Column = {
  key: string;
  label: string;
  title?: string;
  value: (p: KeeperPlayer) => number | string;
  format?: (v: number) => string;
  /** Some columns (time on ice) are shown but not sortable. */
  sortable?: boolean;
};

type View = {
  id: string;
  label: string;
  includes: (p: KeeperPlayer) => boolean;
  positions?: readonly string[];
  columns: Column[];
};

const skater = (f: (p: HockeySkater) => number | string) => (p: KeeperPlayer) => f(p as HockeySkater);
const goalie = (f: (p: HockeyGoalie) => number | string) => (p: KeeperPlayer) => f(p as HockeyGoalie);
const hoops = (f: (p: BasketballPlayer) => number) => (p: KeeperPlayer) => f(p as BasketballPlayer);

const oneDecimal = (v: number) => v.toFixed(1);
const pct = (v: number) => v.toFixed(3).replace(/^0/, "");
const fpts: Column = { key: "fpts", label: "FPTS", title: "Fantasy points", value: skater((p) => p.fantasyPoints), format: oneDecimal };

const views: Record<KeeperSportId, View[]> = {
  hockey: [
    {
      id: "skaters",
      label: "Skaters",
      includes: (p) => (p as HockeySkater).kind === "skater",
      positions: skaterPositions,
      columns: [
        fpts,
        { key: "toi", label: "TOI/G", title: "Time on ice per game", value: skater((p) => p.toiPerGame), sortable: false },
        { key: "g", label: "G", title: "Goals", value: skater((p) => p.goals) },
        { key: "a", label: "A", title: "Assists", value: skater((p) => p.assists) },
        { key: "pm", label: "+/-", title: "Plus/minus", value: skater((p) => p.plusMinus) },
        { key: "ppp", label: "PPP", title: "Power play points", value: skater((p) => p.powerPlayPoints) },
        { key: "sog", label: "SOG", title: "Shots on goal", value: skater((p) => p.shotsOnGoal) },
        { key: "hit", label: "HIT", title: "Hits", value: skater((p) => p.hits) },
        { key: "blk", label: "BLK", title: "Blocked shots", value: skater((p) => p.blocks) },
      ],
    },
    {
      id: "goalies",
      label: "Goalies",
      includes: (p) => (p as HockeyGoalie).kind === "goalie",
      columns: [
        fpts,
        { key: "toi", label: "TOI", title: "Total time on ice", value: goalie((p) => p.timeOnIce), sortable: false },
        { key: "w", label: "W", title: "Wins", value: goalie((p) => p.wins) },
        { key: "ga", label: "GA", title: "Goals against", value: goalie((p) => p.goalsAgainst) },
        { key: "sv", label: "SV", title: "Saves", value: goalie((p) => p.saves) },
        { key: "sho", label: "SHO", title: "Shutouts", value: goalie((p) => p.shutouts) },
      ],
    },
  ],
  basketball: [
    {
      id: "players",
      label: "Players",
      includes: () => true,
      positions: basketballPositions,
      columns: [
        { key: "min", label: "MIN", title: "Minutes per game", value: hoops((p) => p.minutes), format: oneDecimal },
        { key: "fgp", label: "FG%", title: "Field goal %", value: hoops((p) => p.fgp), format: pct },
        { key: "ftp", label: "FT%", title: "Free throw %", value: hoops((p) => p.ftp), format: pct },
        { key: "tpm", label: "3PM", title: "Threes made", value: hoops((p) => p.tpm), format: oneDecimal },
        { key: "pts", label: "PTS", title: "Points", value: hoops((p) => p.pts), format: oneDecimal },
        { key: "reb", label: "REB", title: "Rebounds", value: hoops((p) => p.reb), format: oneDecimal },
        { key: "ast", label: "AST", title: "Assists", value: hoops((p) => p.ast), format: oneDecimal },
        { key: "stl", label: "STL", title: "Steals", value: hoops((p) => p.stl), format: oneDecimal },
        { key: "blk", label: "BLK", title: "Blocks", value: hoops((p) => p.blk), format: oneDecimal },
        { key: "to", label: "TO", title: "Turnovers", value: hoops((p) => p.to), format: oneDecimal },
      ],
    },
  ],
};

/* ---------- Board ---------- */

/** Keeper draft: your roster on the left, the player pool on the right. */
export function KeeperBoard({ sport }: { sport: KeeperSportId }) {
  const board = useDraft()[sport];
  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <TeamPanel board={board} />
      <PlayersPanel board={board} sportViews={views[sport]} />
    </div>
  );
}

function TeamPanel({ board: b }: { board: KeeperBoardState }) {
  return (
    <BoardPanel
      title="My Team"
      actions={
        <>
          <ConfirmButton
            title="Clear picks?"
            message="Removes every pick on the board, yours and other teams'. Your keepers stay."
            confirmLabel="Clear picks"
            onConfirm={b.clearPicks}
            disabled={!b.canClear}
            className={buttonStyles.quiet}
          >
            Clear
          </ConfirmButton>
          <ConfirmButton
            title="Reset the board?"
            message="Clears all picks and unloads keepers, back to a fresh draft."
            confirmLabel="Reset board"
            onConfirm={b.resetBoard}
            className={buttonStyles.danger}
          >
            Reset
          </ConfirmButton>
        </>
      }
      toolbar={
        <div className="grid w-full divide-y divide-border">
          <Switch
            label="Keepers loaded"
            description={b.keepersLoaded ? "Kept players are off the board" : "Everyone is available"}
            checked={b.keepersLoaded}
            onChange={b.toggleKeepers}
          />
          <Switch
            label="Next pick is mine"
            description={b.nextPickIsMine ? "Draft adds the player to your team" : "Draft marks a player taken by another team"}
            checked={b.nextPickIsMine}
            onChange={b.toggleNextPickIsMine}
          />
        </div>
      }
    >
      <p className="px-5 pt-3 pb-1 text-xs text-fg-subtle sm:px-6">{b.myTeamName}</p>
      <ul>
        {b.slots.map((slot, i) => {
          const player = slot.playerId ? b.playersById[slot.playerId] : undefined;
          const keeper = player?.rosterStatus === b.myTeamName;
          return (
            <li key={`${slot.label}-${i}`} className="flex items-center gap-2 border-b border-border px-5 py-2 text-sm last:border-0 sm:px-6">
              <PositionBadge label={slot.label} />
              {player ? (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{player.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                      {player.team}
                      {player.positions.length > 1 && <SlotMoves board={b} player={player} current={slot.label} />}
                    </span>
                  </span>
                  {keeper ? (
                    <span title="Keeper" className="rounded-full bg-(--accent)/12 px-2 py-0.5 text-[11px] font-semibold text-(--accent)">
                      Keeper
                    </span>
                  ) : (
                    <button type="button" onClick={() => b.undo(player.id)} className={cn(buttonStyles.danger, "px-2.5 py-0.5 text-xs")}>
                      Undo
                    </button>
                  )}
                </>
              ) : (
                <span className="ml-auto text-xs text-fg-subtle">Empty</span>
              )}
            </li>
          );
        })}
      </ul>
    </BoardPanel>
  );
}

/** Lets a multi-position player switch to another of their positions. */
function SlotMoves({ board: b, player, current }: { board: KeeperBoardState; player: KeeperPlayer; current: string }) {
  return (
    <span className="flex gap-1">
      {player.positions.map((pos) => {
        const isCurrent = pos === current;
        const open = b.slots.some((s) => s.label === pos && !s.playerId);
        return (
          <button
            key={pos}
            type="button"
            disabled={isCurrent || !open}
            onClick={() => b.moveToSlot(player.id, pos)}
            title={isCurrent ? `Playing ${pos}` : open ? `Move to ${pos}` : `No open ${pos} slot`}
            className={cn(
              "rounded px-1 font-mono text-[10px] font-semibold ring-1 ring-inset transition-colors",
              isCurrent ? "text-fg ring-fg/40" : open ? "text-fg-muted ring-border hover:text-fg hover:ring-fg/40" : "text-fg-subtle/50 ring-border",
            )}
          >
            {pos}
          </button>
        );
      })}
    </span>
  );
}

const baseSort: Record<string, (p: KeeperPlayer) => number | string> = {
  pre: (p) => p.rankPreSeason,
  cur: (p) => p.rankCurrent,
  name: (p) => p.name,
  team: (p) => p.team,
  gp: (p) => p.gamesPlayed,
};

function PlayersPanel({ board: b, sportViews }: { board: KeeperBoardState; sportViews: View[] }) {
  const [viewId, setViewId] = useState(sportViews[0].id);
  const [position, setPosition] = useState("ALL");
  const [query, setQuery] = useState("");
  const sort = useSort<string>("pre");
  const view = sportViews.find((v) => v.id === viewId) ?? sportViews[0];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sortBy = baseSort[sort.key] ?? view.columns.find((c) => c.key === sort.key)?.value ?? baseSort.pre;
    return b.players
      .filter(
        (p) =>
          view.includes(p) &&
          (position === "ALL" || p.positions.includes(position)) &&
          p.name.toLowerCase().includes(q),
      )
      .sort((x, y) => {
        const a = sortBy(x);
        const c = sortBy(y);
        const cmp = typeof a === "string" ? a.localeCompare(c as string) : a - (c as number);
        return sort.dir === "asc" ? cmp : -cmp;
      });
  }, [b.players, view, position, query, sort.key, sort.dir]);

  const myKeepers = b.players.filter((p) => p.rosterStatus === b.myTeamName).length;

  return (
    <BoardPanel
      title="Draft Board"
      actions={
        <span className="text-xs text-fg-muted">
          {rows.length} players, {myKeepers} of {b.keepersPerTeam} keepers
        </span>
      }
      toolbar={
        <>
          {sportViews.length > 1 && (
            <Segmented
              label="Players"
              options={sportViews.map((v) => ({ id: v.id, label: v.label }))}
              value={view.id}
              onChange={(id) => {
                setViewId(id);
                setPosition("ALL");
                sort.reset();
              }}
            />
          )}
          <SearchField value={query} onChange={setQuery} className="min-w-40 flex-1" />
          {view.positions && (
            <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(view.positions)} />
          )}
        </>
      }
    >
      <table className="w-full min-w-[60rem] text-sm tabular-nums">
        <thead className="sticky top-0 z-10 bg-surface text-xs text-fg-subtle shadow-[inset_0_-1px_0_var(--border)]">
          <tr className="text-left">
            <SortTh label="Pre" sortKey="pre" sort={sort} className="w-12 pl-5 sm:pl-6" title="Pre-season rank" />
            <SortTh label="Cur" sortKey="cur" sort={sort} className="w-12" title="Rank at the end of last season" />
            <SortTh label="Player" sortKey="name" sort={sort} />
            <th scope="col" className="px-2 py-2 font-medium">Pos</th>
            <SortTh label="Team" sortKey="team" sort={sort} className="w-14" />
            <th scope="col" className="w-24 px-2 py-2 font-medium">Status</th>
            <SortTh label="GP" sortKey="gp" sort={sort} className="w-12" title="Games played" />
            {view.columns.map((c) =>
              c.sortable === false ? (
                <th key={c.key} scope="col" title={c.title} className="w-16 px-2 py-2 font-medium">
                  {c.label}
                </th>
              ) : (
                <SortTh key={c.key} label={c.label} sortKey={c.key} sort={sort} title={c.title} className="w-14 last:pr-5 sm:last:pr-6" />
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <PlayerRow key={p.id} board={b} player={p} columns={view.columns} />
          ))}
        </tbody>
      </table>
    </BoardPanel>
  );
}

function PlayerRow({ board: b, player: p, columns }: { board: KeeperBoardState; player: KeeperPlayer; columns: Column[] }) {
  const kept = p.rosterStatus !== "FA";
  const myKeeper = p.rosterStatus === b.myTeamName;
  // A pick from before keepers were reloaded doesn't count once the player is kept.
  const mine = !kept && b.myPicks.has(p.id);
  const takenByOther = !kept && !mine && b.taken.has(p.id);
  const unavailable = kept || mine || takenByOther;
  const blocked = b.nextPickIsMine && b.rosterFull;

  return (
    <tr
      title={myKeeper ? "Your keeper" : kept ? `Kept by ${p.rosterStatus}` : undefined}
      className={cn(
        "border-b border-border transition-colors duration-150",
        myKeeper || mine ? "bg-(--accent)/8" : unavailable ? "text-fg-subtle" : "hover:bg-surface-muted/50",
      )}
    >
      <td className="py-1.5 pl-5 font-mono font-semibold sm:pl-6">{p.rankPreSeason}</td>
      <td className="px-2 py-1.5 font-mono text-fg-muted">{p.rankCurrent}</td>
      <td className="px-2 py-1.5 font-medium whitespace-nowrap">{p.name}</td>
      <td className="px-2 py-1.5">
        <span className="flex gap-1">
          {p.positions.map((pos) => (
            <PositionBadge key={pos} label={pos} muted={unavailable && !myKeeper && !mine} />
          ))}
        </span>
      </td>
      <td className="px-2 py-1.5 font-mono text-xs text-fg-muted">{p.team}</td>
      <td className="px-2 py-1.5">
        {unavailable ? (
          mine || takenByOther ? (
            <button
              type="button"
              onClick={() => b.undo(p.id)}
              title="Undo this pick"
              className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-fg-muted transition-colors hover:bg-danger/12 hover:text-danger"
            >
              {mine ? "Mine" : "Taken"}
            </button>
          ) : (
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium">{myKeeper ? "Keeper" : "Kept"}</span>
          )
        ) : (
          <button
            type="button"
            disabled={blocked}
            onClick={() => b.draft(p.id)}
            title={blocked ? "Your roster is full" : b.nextPickIsMine ? "Draft to your team" : "Mark as taken by another team"}
            className={cn(buttonStyles.small, b.nextPickIsMine && "bg-success")}
          >
            Draft
          </button>
        )}
      </td>
      <td className="px-2 py-1.5 font-mono">{p.gamesPlayed}</td>
      {columns.map((c) => {
        const v = c.value(p);
        return (
          <td key={c.key} className="px-2 py-1.5 font-mono last:pr-5 sm:last:pr-6">
            {typeof v === "number" && c.format ? c.format(v) : v}
          </td>
        );
      })}
    </tr>
  );
}

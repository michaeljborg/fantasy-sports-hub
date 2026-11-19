"use client";

import { useMemo, useState } from "react";
import { ConfirmButton } from "@/components/ui/dialog";
import { skaterPositions } from "@/lib/draft/sports";
import type { HockeyGoalie, HockeyPlayer, HockeyPosition, HockeySkater } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, PositionBadge, positionOptions, SearchField, Segmented, SelectField, SortTh, Switch, useSort } from "./controls";
import { useDraft } from "./draft-state";

/** Hockey keeper draft: your roster on the left, the player pool on the right. */
export function HockeyBoard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
      <HockeyTeamPanel />
      <HockeyPlayersPanel />
    </div>
  );
}

function HockeyTeamPanel() {
  const { hockey: h } = useDraft();

  return (
    <BoardPanel
      title="My Team"
      actions={
        <>
          <ConfirmButton
            title="Clear picks?"
            message="Removes every pick on the board, yours and other teams'. Your keepers stay."
            confirmLabel="Clear picks"
            onConfirm={h.clearPicks}
            disabled={!h.canClear}
            className={buttonStyles.quiet}
          >
            Clear
          </ConfirmButton>
          <ConfirmButton
            title="Reset the board?"
            message="Clears all picks and unloads keepers, back to a fresh draft."
            confirmLabel="Reset board"
            onConfirm={h.resetBoard}
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
            description={h.keepersLoaded ? "Kept players are off the board" : "Everyone is available"}
            checked={h.keepersLoaded}
            onChange={h.toggleKeepers}
          />
          <Switch
            label="Next pick is mine"
            description={h.nextPickIsMine ? "Draft adds the player to your team" : "Draft marks a player taken by another team"}
            checked={h.nextPickIsMine}
            onChange={h.toggleNextPickIsMine}
          />
        </div>
      }
    >
      <p className="px-5 pt-3 pb-1 text-xs text-fg-subtle sm:px-6">{h.myTeamName}</p>
      <ul>
        {h.slots.map((slot, i) => {
          const player = slot.playerId ? h.playersById[slot.playerId] : undefined;
          const keeper = player?.rosterStatus === h.myTeamName;
          return (
            <li key={`${slot.label}-${i}`} className="flex items-center gap-2 border-b border-border px-5 py-2 text-sm last:border-0 sm:px-6">
              <PositionBadge label={slot.label} />
              {player ? (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{player.name}</span>
                    <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                      {player.team}
                      {player.positions.length > 1 && <SlotMoves player={player} current={slot.label} />}
                    </span>
                  </span>
                  {keeper ? (
                    <span title="Keeper" className="rounded-full bg-(--accent)/12 px-2 py-0.5 text-[11px] font-semibold text-(--accent)">
                      Keeper
                    </span>
                  ) : (
                    <button type="button" onClick={() => h.undo(player.id)} className={cn(buttonStyles.danger, "px-2.5 py-0.5 text-xs")}>
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
function SlotMoves({ player, current }: { player: HockeyPlayer; current: string }) {
  const { hockey: h } = useDraft();
  return (
    <span className="flex gap-1">
      {player.positions.map((pos) => {
        const isCurrent = pos === current;
        const open = h.slots.some((s) => s.label === pos && !s.playerId);
        return (
          <button
            key={pos}
            type="button"
            disabled={isCurrent || !open}
            onClick={() => h.moveToSlot(player.id, pos)}
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

type View = "skaters" | "goalies";
type SortKey =
  | "pre" | "cur" | "name" | "team" | "gp" | "fpts"
  | "goals" | "assists" | "plusMinus" | "powerPlayPoints" | "shotsOnGoal" | "hits" | "blocks"
  | "wins" | "goalsAgainst" | "saves" | "shutouts";

const skaterCols: { key: keyof HockeySkater & SortKey; label: string; title: string }[] = [
  { key: "goals", label: "G", title: "Goals" },
  { key: "assists", label: "A", title: "Assists" },
  { key: "plusMinus", label: "+/-", title: "Plus/minus" },
  { key: "powerPlayPoints", label: "PPP", title: "Power play points" },
  { key: "shotsOnGoal", label: "SOG", title: "Shots on goal" },
  { key: "hits", label: "HIT", title: "Hits" },
  { key: "blocks", label: "BLK", title: "Blocked shots" },
];

const goalieCols: { key: keyof HockeyGoalie & SortKey; label: string; title: string }[] = [
  { key: "wins", label: "W", title: "Wins" },
  { key: "goalsAgainst", label: "GA", title: "Goals against" },
  { key: "saves", label: "SV", title: "Saves" },
  { key: "shutouts", label: "SHO", title: "Shutouts" },
];

function sortValue(p: HockeyPlayer, key: SortKey): number | string {
  switch (key) {
    case "pre": return p.rankPreSeason;
    case "cur": return p.rankCurrent;
    case "name": return p.name;
    case "team": return p.team;
    case "gp": return p.gamesPlayed;
    case "fpts": return p.fantasyPoints;
    default: return (p as unknown as Record<string, number>)[key] ?? 0;
  }
}

function HockeyPlayersPanel() {
  const { hockey: h } = useDraft();
  const [view, setView] = useState<View>("skaters");
  const [position, setPosition] = useState<HockeyPosition | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const sort = useSort<SortKey>("pre");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = h.players.filter(
      (p) =>
        (view === "skaters" ? p.kind === "skater" : p.kind === "goalie") &&
        (position === "ALL" || p.positions.includes(position)) &&
        p.name.toLowerCase().includes(q),
    );
    list.sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      const cmp = typeof va === "string" ? va.localeCompare(vb as string) : va - (vb as number);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [h.players, view, position, query, sort.key, sort.dir]);

  const myKeepers = h.players.filter((p) => p.rosterStatus === h.myTeamName).length;
  const statCols = view === "skaters" ? skaterCols : goalieCols;

  return (
    <BoardPanel
      title="Draft Board"
      actions={
        <span className="text-xs text-fg-muted">
          {rows.length} players, {myKeepers} of {h.keepersPerTeam} keepers
        </span>
      }
      toolbar={
        <>
          <Segmented
            label="Players"
            options={[
              { id: "skaters", label: "Skaters" },
              { id: "goalies", label: "Goalies" },
            ]}
            value={view}
            onChange={(v) => {
              setView(v);
              setPosition("ALL");
              sort.reset();
            }}
          />
          <SearchField value={query} onChange={setQuery} className="min-w-40 flex-1" />
          {view === "skaters" && (
            <SelectField label="Position" value={position} onChange={setPosition} options={positionOptions(skaterPositions)} />
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
            <SortTh label="FPTS" sortKey="fpts" sort={sort} className="w-16" title="Fantasy points" />
            <th scope="col" className="w-20 px-2 py-2 font-medium" title={view === "skaters" ? "Time on ice per game" : "Total time on ice"}>
              {view === "skaters" ? "TOI/G" : "TOI"}
            </th>
            {statCols.map((c) => (
              <SortTh key={c.key} label={c.label} sortKey={c.key} sort={sort} title={c.title} className="w-12 last:pr-5 sm:last:pr-6" />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <HockeyRow key={p.id} player={p} />
          ))}
        </tbody>
      </table>
    </BoardPanel>
  );
}

function HockeyRow({ player: p }: { player: HockeyPlayer }) {
  const { hockey: h } = useDraft();
  const kept = p.rosterStatus !== "FA";
  const myKeeper = p.rosterStatus === h.myTeamName;
  // A pick from before keepers were reloaded doesn't count once the player is kept.
  const mine = !kept && h.myPicks.has(p.id);
  const takenByOther = !kept && !mine && h.taken.has(p.id);
  const unavailable = kept || mine || takenByOther;
  const blocked = h.nextPickIsMine && h.rosterFull;

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
              onClick={() => h.undo(p.id)}
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
            onClick={() => h.draft(p.id)}
            title={blocked ? "Your roster is full" : h.nextPickIsMine ? "Draft to your team" : "Mark as taken by another team"}
            className={cn(buttonStyles.small, h.nextPickIsMine && "bg-success")}
          >
            Draft
          </button>
        )}
      </td>
      <td className="px-2 py-1.5 font-mono">{p.gamesPlayed}</td>
      <td className="px-2 py-1.5 font-mono font-semibold">{p.fantasyPoints.toFixed(1)}</td>
      <td className="px-2 py-1.5 font-mono text-xs text-fg-muted">{p.kind === "skater" ? p.toiPerGame : p.timeOnIce}</td>
      {p.kind === "skater"
        ? skaterCols.map((c) => (
            <td key={c.key} className="px-2 py-1.5 font-mono last:pr-5 sm:last:pr-6">{p[c.key]}</td>
          ))
        : goalieCols.map((c) => (
            <td key={c.key} className="px-2 py-1.5 font-mono last:pr-5 sm:last:pr-6">{p[c.key]}</td>
          ))}
    </tr>
  );
}

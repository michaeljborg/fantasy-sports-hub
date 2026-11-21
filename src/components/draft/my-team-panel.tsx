"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { ConfirmButton } from "@/components/ui/dialog";
import type { PlayerRef } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, NumberField, PositionBadge, Segmented, Switch } from "./controls";
import { useSportState } from "./draft-state";

export type RosterView = "draftOrder" | "positional";

export const rosterViews: { id: RosterView; label: string }[] = [
  { id: "draftOrder", label: "Draft order" },
  { id: "positional", label: "Positional" },
];

/** One spot on a roster. Shared by the live board and saved team cards. */
export function PickRow({
  label,
  slot,
  sublabel,
  player,
  armed,
  onClick,
  extra,
}: {
  /** Round label ("R1") in draft order view */
  label?: string;
  /** Roster spot in positional view */
  slot?: string;
  sublabel?: string;
  player?: PlayerRef;
  armed?: boolean;
  onClick?: () => void;
  /** Controls after the player, e.g. position moves or undo */
  extra?: React.ReactNode;
}) {
  const content = (
    <>
      <span className="flex w-24 shrink-0 items-center gap-2">
        {slot ? <PositionBadge label={slot} /> : <span className="font-mono text-sm font-semibold">{label}</span>}
        {sublabel && <span className="font-mono text-xs text-fg-subtle tabular-nums">{sublabel}</span>}
      </span>
      {player ? (
        <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className="truncate font-medium">{player.name}</span>
          {slot ? (
            <span className="font-mono text-xs text-fg-subtle">{player.positions.join("/")}</span>
          ) : (
            <PositionBadge label={player.positions[0]} />
          )}
        </span>
      ) : (
        <span className={cn("ml-auto text-xs", armed ? "font-medium text-(--accent)" : "text-fg-subtle")}>
          {armed ? "Pick a player" : "Empty"}
        </span>
      )}
    </>
  );

  const rowClass = "flex min-w-0 flex-1 items-center gap-2 px-5 py-2.5 text-left text-sm sm:px-6";
  return (
    <li className={cn("relative flex items-center border-b border-border last:border-0", armed && "bg-(--accent)/8")}>
      {armed && <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-(--accent)" />}
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          aria-pressed={armed}
          className={cn(rowClass, "transition-colors duration-150 active:bg-surface-muted", !armed && "hover:bg-surface-muted/60")}
        >
          {content}
        </button>
      ) : (
        <div className={rowClass}>{content}</div>
      )}
      {extra && <span className="flex shrink-0 items-center gap-1 pr-4 sm:pr-5">{extra}</span>}
    </li>
  );
}

/** Live draft: settings, your picks, save and clear. */
export function MyTeamPanel() {
  const d = useSportState();
  const [view, setView] = useState<RosterView>("draftOrder");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1500);
    return () => clearTimeout(t);
  }, [justSaved]);

  const nextOpen = d.myPicks.find((pick) => !d.selections[pick]);
  const undo = (id: string) => (
    <button type="button" onClick={() => d.undo(id)} aria-label="Undo this pick" title="Undo this pick" className={cn(buttonStyles.icon, "hover:text-danger")}>
      <CloseIcon />
    </button>
  );

  return (
    <BoardPanel
      title="My Team"
      actions={
        <>
          <ConfirmButton
            title="Clear the board?"
            message="Removes every pick on the board, yours and other teams'. Saved teams aren't affected."
            confirmLabel="Clear board"
            onConfirm={d.clearBoard}
            disabled={!d.hasPicks}
            className={buttonStyles.quiet}
          >
            Clear
          </ConfirmButton>
          <button
            type="button"
            disabled={!d.mine.size}
            onClick={() => {
              d.saveTeam();
              setJustSaved(true);
            }}
            className={cn(buttonStyles.primary, justSaved && "bg-success")}
          >
            {justSaved ? "Saved" : "Save team"}
          </button>
        </>
      }
      toolbar={
        <div className="grid w-full gap-4">
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Teams" value={d.config.teams} min={2} max={20} onChange={(teams) => d.setConfig({ ...d.config, teams })} />
            <NumberField label="Your pick" value={d.config.slot} min={1} max={d.config.teams} onChange={(slot) => d.setConfig({ ...d.config, slot })} />
            <NumberField label="Rounds" value={d.config.rounds} min={1} max={30} onChange={(rounds) => d.setConfig({ ...d.config, rounds })} />
          </div>
          <Switch
            label="Next pick is mine"
            description={
              d.armedPick != null
                ? `Draft fills pick ${d.armedPick}`
                : d.nextPickIsMine
                  ? "Draft adds the player to your team"
                  : "Draft marks a player taken by another team"
            }
            checked={d.nextPickIsMine}
            onChange={d.toggleNextPickIsMine}
          />
          <Segmented label="Roster view" options={rosterViews} value={view} onChange={setView} />
        </div>
      }
    >
      <ul>
        {view === "draftOrder"
          ? d.myPicks.map((pick, i) => {
              const id = d.selections[pick];
              return (
                <PickRow
                  key={pick}
                  label={`R${i + 1}`}
                  sublabel={`#${pick}`}
                  player={id ? d.playersById[id] : undefined}
                  armed={d.armedPick === pick}
                  onClick={() => d.armPick(pick)}
                  extra={id && undo(id)}
                />
              );
            })
          : d.slots.map((slot, i) => {
              const player = slot.playerId ? d.playersById[slot.playerId] : undefined;
              const target = slot.pick ?? nextOpen;
              return (
                <PickRow
                  key={`${slot.label}-${i}`}
                  slot={slot.label}
                  sublabel={slot.pick ? `#${slot.pick}` : undefined}
                  player={player}
                  armed={d.armedPick != null && d.armedPick === target}
                  onClick={() => target != null && d.armPick(target)}
                  extra={
                    player && (
                      <>
                        {player.positions.length > 1 && <SlotMoves playerId={player.id} positions={player.positions} current={slot.label} />}
                        {undo(player.id)}
                      </>
                    )
                  }
                />
              );
            })}
      </ul>
    </BoardPanel>
  );
}

/** Lets a multi-position player switch to another of their positions. */
function SlotMoves({ playerId, positions, current }: { playerId: string; positions: string[]; current: string }) {
  const d = useSportState();
  return (
    <span className="flex gap-1">
      {positions.map((pos) => {
        const isCurrent = pos === current;
        const open = d.slots.some((s) => s.label === pos && !s.playerId);
        return (
          <button
            key={pos}
            type="button"
            disabled={isCurrent || !open}
            onClick={() => d.moveToSlot(playerId, pos)}
            title={isCurrent ? `Playing ${pos}` : open ? `Move to ${pos}` : `No open ${pos} spot`}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfirmButton } from "@/components/ui/dialog";
import { buildPositionalSlots, type SlotLabel } from "@/lib/draft/roster-slots";
import type { PlayerRef } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { BoardPanel } from "./board-panel";
import { buttonStyles, NumberField, PositionBadge, Segmented } from "./controls";
import { useDraft } from "./draft-state";

export type RosterView = "draftOrder" | "positional";

export const rosterViews: { id: RosterView; label: string }[] = [
  { id: "draftOrder", label: "Draft order" },
  { id: "positional", label: "Positional" },
];

/** One pick on a roster. Shared by the live board and saved team cards. */
export function PickRow({
  label,
  slot,
  sublabel,
  player,
  armed,
  onClick,
}: {
  /** Round label ("R1") in draft order view */
  label?: string;
  /** Roster slot in positional view */
  slot?: SlotLabel;
  sublabel?: string;
  player?: PlayerRef;
  armed?: boolean;
  onClick?: () => void;
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
            <span className="font-mono text-xs text-fg-subtle">{player.position}</span>
          ) : (
            <PositionBadge label={player.position} />
          )}
        </span>
      ) : (
        <span className={cn("ml-auto text-xs", armed ? "font-medium text-(--accent)" : "text-fg-subtle")}>
          {armed ? "Pick a player" : "Empty"}
        </span>
      )}
    </>
  );

  const rowClass = "flex w-full items-center gap-2 border-b border-border px-5 py-2.5 text-left text-sm last:border-0 sm:px-6";
  if (!onClick) return <li className={rowClass}>{content}</li>;

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={armed}
        className={cn(
          rowClass,
          "relative transition-colors duration-150 active:bg-surface-muted",
          armed ? "bg-(--accent)/8" : "hover:bg-surface-muted/60",
        )}
      >
        {armed && <span className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-(--accent)" />}
        {content}
      </button>
    </li>
  );
}

/** Live draft: config, your picks, save and clear. */
export function MyTeamPanel() {
  const { football: f } = useDraft();
  const [view, setView] = useState<RosterView>("draftOrder");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 1500);
    return () => clearTimeout(t);
  }, [justSaved]);

  const slots = useMemo(
    () => buildPositionalSlots(f.myPicks, f.selections, f.playersById),
    [f.myPicks, f.selections, f.playersById],
  );
  const nextOpen = f.myPicks.find((pick) => !f.selections[pick]);
  const hasPicks = f.drafted.size > 0;

  return (
    <BoardPanel
      title="My Team"
      actions={
        <>
          <ConfirmButton
            title="Clear this board?"
            message="All picks on the board will be removed. Saved teams aren't affected."
            confirmLabel="Clear board"
            onConfirm={f.clearBoard}
            disabled={!hasPicks}
            className={buttonStyles.quiet}
          >
            Clear
          </ConfirmButton>
          <button
            type="button"
            disabled={!hasPicks}
            onClick={() => {
              f.saveTeam();
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
            <NumberField label="Teams" value={f.config.teams} min={2} max={20} onChange={(teams) => f.setConfig({ ...f.config, teams })} />
            <NumberField label="Your pick" value={f.config.slot} min={1} max={f.config.teams} onChange={(slot) => f.setConfig({ ...f.config, slot })} />
            <NumberField label="Rounds" value={f.config.rounds} min={1} max={30} onChange={(rounds) => f.setConfig({ ...f.config, rounds })} />
          </div>
          <Segmented label="Roster view" options={rosterViews} value={view} onChange={setView} />
        </div>
      }
    >
      <ul>
        {view === "draftOrder"
          ? f.myPicks.map((pick, i) => (
              <PickRow
                key={pick}
                label={`R${i + 1}`}
                sublabel={`#${pick}`}
                player={f.selections[pick] ? f.playersById[f.selections[pick]!] : undefined}
                armed={f.armedPick === pick}
                onClick={() => f.armPick(pick)}
              />
            ))
          : slots.map((slot, i) => {
              const target = slot.pick ?? nextOpen;
              return (
                <PickRow
                  key={`${slot.label}-${i}`}
                  slot={slot.label}
                  sublabel={slot.pick ? `#${slot.pick}` : undefined}
                  player={slot.playerId ? f.playersById[slot.playerId] : undefined}
                  armed={f.armedPick != null && f.armedPick === target && (slot.pick != null || !slot.playerId)}
                  onClick={() => target != null && f.armPick(target)}
                />
              );
            })}
      </ul>
    </BoardPanel>
  );
}

"use client";

import { CloseIcon } from "@/components/icons";
import { Modal } from "@/components/ui/dialog";
import type { Player } from "@/lib/draft/types";
import { buttonStyles } from "./controls";
import { PlayerTable } from "./player-table";

/**
 * Pick a player for a scenario: the same player table as the board, with this
 * scenario's pick markers. The target pick is highlighted and scrolled into view.
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
  return (
    <Modal label={title} onClose={onClose} className="h-[min(44rem,calc(100dvh-2rem))] w-[min(60rem,calc(100vw-2rem))] p-0">
      <div className="flex h-full flex-col">
        <header className="flex flex-wrap items-center gap-3 px-5 pt-5 sm:px-6">
          <h2 className="mr-auto font-display text-2xl leading-tight font-bold uppercase">{title}</h2>
          <form method="dialog">
            <button aria-label="Close" className={buttonStyles.icon}>
              <CloseIcon />
            </button>
          </form>
        </header>
        <PlayerTable mode={{ kind: "picker", myPicks, targetPick, excludeIds, onSelect }} />
      </div>
    </Modal>
  );
}

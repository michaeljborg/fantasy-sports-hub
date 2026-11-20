"use client";

import { useState } from "react";
import { useDraft } from "./draft-state";

/**
 * Shared click behavior for player rows on the board:
 * drafted → undo; a pick is armed → assign; otherwise toggle a Draft button.
 */
export function useRowSelect() {
  const { football } = useDraft();
  const [selected, setSelected] = useState<string | null>(null);

  return {
    selected,
    rowClick(id: string) {
      if (football.drafted.has(id) || football.armedPick != null) football.clickPlayer(id);
      else setSelected((prev) => (prev === id ? null : id));
    },
    draft(id: string) {
      football.draftPlayer(id);
      setSelected(null);
    },
    showDraftButton(id: string) {
      return selected === id && !football.drafted.has(id) && football.armedPick == null;
    },
    rowTitle(id: string) {
      if (football.drafted.has(id)) return "Undo this pick";
      if (football.impliedTaken.has(id)) return "Probably taken. Click to draft anyway";
      if (football.armedPick != null) return `Assign to pick ${football.armedPick}`;
      return "Select to draft";
    },
  };
}

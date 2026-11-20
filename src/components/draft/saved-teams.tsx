"use client";

import { useMemo, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { buildPositionalSlots } from "@/lib/draft/roster-slots";
import type { PlayerRef, SavedTeam, Selections } from "@/lib/draft/types";
import { buttonStyles, Segmented } from "./controls";
import { useDraft } from "./draft-state";
import { PickRow, rosterViews, type RosterView } from "./my-team-panel";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Teams saved from the draft board. */
export function SavedTeams() {
  const { football } = useDraft();

  if (!football.savedTeams.length) {
    return (
      <EmptyState
        title="No saved teams yet"
        description="Draft some players on the board, then choose Save team to keep that roster here."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {football.savedTeams.map((team) => (
        <SavedTeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

function SavedTeamCard({ team }: { team: SavedTeam }) {
  const { football } = useDraft();
  const [view, setView] = useState<RosterView>("positional");

  // Rebuild the roster from this team's own snapshot of its picks.
  const { picks, selections, byId } = useMemo(() => {
    const selections: Selections = {};
    const byId: Record<string, PlayerRef> = {};
    for (const { pick, player } of team.picks) {
      selections[pick] = player.id;
      byId[player.id] = player;
    }
    return { picks: team.picks.map((p) => p.pick), selections, byId };
  }, [team.picks]);
  const slots = useMemo(() => buildPositionalSlots(picks, selections, byId), [picks, selections, byId]);

  return (
    <section className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <header className="flex items-start gap-2 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <input
            value={team.name}
            aria-label="Team name"
            onChange={(e) => football.renameTeam(team.id, e.target.value)}
            className="-mx-1 w-full rounded-md bg-transparent px-1 font-display text-2xl leading-tight font-bold uppercase outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
          />
          <p className="mt-1 text-xs text-fg-muted">
            {team.config.teams} teams, pick {team.config.slot}. Saved {dateFormat.format(new Date(team.createdAt))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => football.deleteTeam(team.id)}
          aria-label={`Delete ${team.name}`}
          className={buttonStyles.icon + " hover:text-danger"}
        >
          <CloseIcon />
        </button>
      </header>
      <div className="px-5 pt-4">
        <Segmented label="Roster view" options={rosterViews} value={view} onChange={setView} />
      </div>
      <ul className="mt-3 border-t border-border">
        {view === "positional"
          ? slots.map((slot, i) => (
              <PickRow
                key={`${slot.label}-${i}`}
                slot={slot.label}
                sublabel={slot.pick ? `#${slot.pick}` : undefined}
                player={slot.playerId ? byId[slot.playerId] : undefined}
              />
            ))
          : picks.map((pick, i) => (
              <PickRow key={pick} label={`R${i + 1}`} sublabel={`#${pick}`} player={byId[selections[pick]!]} />
            ))}
      </ul>
    </section>
  );
}

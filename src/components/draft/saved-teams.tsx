"use client";

import { useMemo, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import { buildRosterSlots, rosterFor } from "@/lib/draft/roster";
import type { SavedTeam } from "@/lib/draft/types";
import { buttonStyles, Segmented } from "./controls";
import { useSportState } from "./draft-state";
import { PickRow, rosterViews, type RosterView } from "./my-team-panel";

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Teams saved from the draft board. */
export function SavedTeams() {
  const d = useSportState();

  if (!d.savedTeams.length) {
    return (
      <EmptyState
        title="No saved teams yet"
        description="Draft some players on the board, then choose Save team to keep that roster here."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {d.savedTeams.map((team) => (
        <SavedTeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

function SavedTeamCard({ team }: { team: SavedTeam }) {
  const d = useSportState();
  const [view, setView] = useState<RosterView>("positional");

  // Rebuild the roster from this team's own snapshot of its picks.
  const picks = useMemo(() => [...team.picks].sort((a, b) => a.pick - b.pick), [team.picks]);
  const byId = useMemo(() => Object.fromEntries(team.picks.map(({ player }) => [player.id, player])), [team.picks]);
  const slots = useMemo(
    () => buildRosterSlots(rosterFor(d.sport.starters, team.config.rounds), picks),
    [d.sport.starters, team.config.rounds, picks],
  );

  return (
    <section className="flex flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <header className="flex items-start gap-2 px-5 pt-5">
        <div className="min-w-0 flex-1">
          <input
            value={team.name}
            aria-label="Team name"
            onChange={(e) => d.renameTeam(team.id, e.target.value)}
            className="-mx-1 w-full rounded-md bg-transparent px-1 font-display text-2xl leading-tight font-bold uppercase outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
          />
          <p className="mt-1 text-xs text-fg-muted">
            {team.config.teams} teams, pick {team.config.slot}. Saved {dateFormat.format(new Date(team.createdAt))}
          </p>
        </div>
        <button
          type="button"
          onClick={() => d.deleteTeam(team.id)}
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
          : picks.map(({ pick, player }, i) => (
              <PickRow key={pick} label={`R${i + 1}`} sublabel={`#${pick}`} player={player} />
            ))}
      </ul>
    </section>
  );
}

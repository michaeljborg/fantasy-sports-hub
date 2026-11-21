"use client";

/**
 * In-memory draft state, one copy per sport, shared by every tab. Nothing is
 * saved yet: a refresh starts over from the mock data, like the dashboard.
 */

import { createContext, use, useMemo, useState } from "react";
import type { DraftPool } from "@/lib/draft/draft";
import { addTreeNode, deleteTreeNode } from "@/lib/draft/draft-tree";
import { buildRosterSlots, rosterFor } from "@/lib/draft/roster";
import { getMyPicks } from "@/lib/draft/snake-draft";
import { getSport, type SportDef } from "@/lib/draft/sports";
import type { DraftConfig, DraftSportId, DraftTree, Note, NoteColor, Player, PlayerRef, SavedTeam, Selections } from "@/lib/draft/types";

export const NOTE_COLORS: NoteColor[] = ["yellow", "blue", "green", "pink", "purple", "white"];

const ref = (p: PlayerRef): PlayerRef => ({ id: p.id, name: p.name, positions: p.positions, team: p.team });
const without = <T,>(list: T[], item: T) => list.filter((x) => x !== item);
function omit<T extends object>(obj: T, key: PropertyKey): T {
  const next = { ...obj };
  delete next[key as keyof T];
  return next;
}

/**
 * One sport's draft. Snake draft settings give you pick numbers. The Draft
 * button fills an armed pick, or your next open pick when "next pick is mine"
 * is on, and otherwise marks the player taken by another team.
 */
function useSportDraft(sport: SportDef, pool: Player[]) {
  const [config, setConfigState] = useState<DraftConfig>(sport.defaultConfig);
  const [selections, setSelections] = useState<Selections>({});
  const [taken, setTaken] = useState<string[]>([]);
  const [armedPick, setArmedPick] = useState<number | null>(null);
  const [nextPickIsMine, setNextPickIsMine] = useState(false);
  const [slotOverrides, setSlotOverrides] = useState<Record<string, string>>({});
  const [rankEdits, setRankEdits] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [trees, setTrees] = useState<DraftTree[]>([]);

  const players = useMemo(() => pool.map((p) => ({ ...p, rank: rankEdits[p.id] ?? p.rank })), [pool, rankEdits]);
  const playersById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const myPicks = useMemo(() => getMyPicks(config).filter((pick) => pick <= players.length), [config, players.length]);
  const mine = useMemo(() => new Set(Object.values(selections).filter((id): id is string => !!id)), [selections]);
  const takenSet = useMemo(() => new Set(taken), [taken]);
  const nextOpen = myPicks.find((pick) => !selections[pick]);

  // Once you draft someone, everyone ranked ahead of them is presumed gone.
  const impliedTaken = useMemo(() => {
    const worst = Math.max(0, ...[...mine].map((id) => playersById[id]?.rank ?? 0));
    return new Set(players.filter((p) => p.rank <= worst && !mine.has(p.id) && !takenSet.has(p.id)).map((p) => p.id));
  }, [mine, takenSet, playersById, players]);

  const roster = useMemo(() => rosterFor(sport.starters, config.rounds), [sport.starters, config.rounds]);
  const slots = useMemo(
    () =>
      buildRosterSlots(
        roster,
        myPicks.filter((pick) => selections[pick]).map((pick) => ({ pick, player: playersById[selections[pick]!] })),
        slotOverrides,
      ),
    [roster, myPicks, selections, playersById, slotOverrides],
  );

  const pickOf = (id: string) => Number(Object.entries(selections).find(([, pid]) => pid === id)?.[0]);

  return {
    sport,
    players,
    playersById,
    config,
    myPicks,
    selections,
    armedPick,
    nextPickIsMine,
    mine,
    taken: takenSet,
    impliedTaken,
    roster,
    slots,
    watchlist,
    savedTeams,
    notes,
    trees,
    /** Where the next Draft click sends a player. */
    draftTarget: armedPick ?? (nextPickIsMine ? nextOpen : undefined),
    rosterFull: nextOpen == null,
    hasPicks: mine.size > 0 || taken.length > 0,

    setConfig(next: DraftConfig) {
      setConfigState({ ...next, slot: Math.min(next.slot, next.teams) });
    },
    setRank(id: string, rank: number) {
      if (Number.isFinite(rank) && rank > 0) setRankEdits((prev) => ({ ...prev, [id]: rank }));
    },
    armPick(pick: number) {
      setArmedPick((prev) => (prev === pick ? null : pick));
    },
    toggleNextPickIsMine() {
      setNextPickIsMine((v) => !v);
    },

    /** Fills the armed pick, or your next open pick, or marks the player taken. */
    draft(id: string) {
      const target = armedPick ?? (nextPickIsMine ? nextOpen : undefined);
      if (target != null) {
        setSelections((prev) => ({ ...prev, [target]: id }));
        setTaken((prev) => without(prev, id));
        setArmedPick(null);
        setNextPickIsMine(false);
      } else if (!armedPick && !nextPickIsMine) {
        setTaken((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
    },
    /** Removes a player from your picks or from the taken list. */
    undo(id: string) {
      if (mine.has(id)) {
        setSelections((prev) => omit(prev, pickOf(id)));
        setSlotOverrides((prev) => omit(prev, id));
      }
      setTaken((prev) => without(prev, id));
    },
    moveToSlot(id: string, label: string) {
      setSlotOverrides((prev) => ({ ...prev, [id]: label }));
    },
    clearBoard() {
      setSelections({});
      setTaken([]);
      setArmedPick(null);
      setNextPickIsMine(false);
      setSlotOverrides({});
    },
    saveTeam() {
      const picks = myPicks
        .filter((pick) => selections[pick])
        .map((pick) => ({ pick, player: ref(playersById[selections[pick]!]) }));
      if (!picks.length) return;
      const team: SavedTeam = {
        id: crypto.randomUUID(),
        name: `Team ${savedTeams.length + 1}`,
        createdAt: new Date().toISOString(),
        config,
        picks,
      };
      setSavedTeams((prev) => [team, ...prev]);
    },
    renameTeam(id: string, name: string) {
      setSavedTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    },
    deleteTeam(id: string) {
      setSavedTeams((prev) => prev.filter((t) => t.id !== id));
    },
    toggleWatch(id: string) {
      setWatchlist((prev) => {
        const next = new Set(prev);
        if (!next.delete(id)) next.add(id);
        return next;
      });
    },

    addNote() {
      const offset = (notes.length % 6) * 32;
      setNotes((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: "",
          text: "",
          color: NOTE_COLORS[prev.length % NOTE_COLORS.length],
          x: 24 + offset,
          y: 24 + offset,
          width: 240,
          height: 200,
        },
      ]);
    },
    updateNote(id: string, patch: Partial<Omit<Note, "id">>) {
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    },
    deleteNote(id: string) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },

    createTree(tree: DraftTree) {
      setTrees((prev) => [tree, ...prev]);
    },
    renameTree(id: string, name: string) {
      setTrees((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    },
    deleteTree(id: string) {
      setTrees((prev) => prev.filter((t) => t.id !== id));
    },
    addTreePick(treeId: string, parentId: string | null, player: Player) {
      setTrees((prev) => prev.map((t) => (t.id === treeId ? addTreeNode(t, parentId, ref(player)) : t)));
    },
    deleteTreePick(treeId: string, nodeId: string) {
      setTrees((prev) => prev.map((t) => (t.id === treeId ? deleteTreeNode(t, nodeId) : t)));
    },
  };
}

export type SportDraft = ReturnType<typeof useSportDraft>;

const DraftContext = createContext<Record<DraftSportId, SportDraft> | null>(null);
const SportContext = createContext<DraftSportId | null>(null);

/** Holds every sport's draft so switching sports keeps your work. */
export function DraftProvider({ pool, children }: { pool: DraftPool; children: React.ReactNode }) {
  const football = useSportDraft(getSport("football"), pool.football);
  const hockey = useSportDraft(getSport("hockey"), pool.hockey);
  const basketball = useSportDraft(getSport("basketball"), pool.basketball);
  return <DraftContext value={{ football, hockey, basketball }}>{children}</DraftContext>;
}

/** Marks which sport the pages below belong to. */
export function SportProvider({ sport, children }: { sport: DraftSportId; children: React.ReactNode }) {
  return <SportContext value={sport}>{children}</SportContext>;
}

/** The current sport's draft. */
export function useSportState(): SportDraft {
  const drafts = use(DraftContext);
  const sport = use(SportContext);
  if (!drafts || !sport) throw new Error("useSportState must be used inside <DraftProvider> and <SportProvider>");
  return drafts[sport];
}

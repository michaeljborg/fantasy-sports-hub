"use client";

/**
 * In-memory state for the draft prep app, shared by every tab. Nothing is
 * saved yet: a refresh starts over from the mock data, like the dashboard.
 */

import { createContext, use, useMemo, useState } from "react";
import { addTreeNode, deleteTreeNode } from "@/lib/draft/draft-tree";
import type { DraftPool } from "@/lib/draft/draft";
import { BASKETBALL_ROSTER, buildRosterSlots, HOCKEY_ROSTER, type SlotDef } from "@/lib/draft/board-roster";
import { getMyPicks } from "@/lib/draft/snake-draft";
import type { DraftConfig, DraftTree, BoardPlayer, Note, NoteColor, Player, PlayerRef, SavedTeam, Selections } from "@/lib/draft/types";

export const NOTE_COLORS: NoteColor[] = ["yellow", "blue", "green", "pink", "purple", "white"];

const ref = (p: PlayerRef): PlayerRef => ({ id: p.id, name: p.name, position: p.position, team: p.team });
const without = <T,>(list: T[], item: T) => list.filter((x) => x !== item);
function omit<T extends object>(obj: T, key: PropertyKey): T {
  const next = { ...obj };
  delete next[key as keyof T];
  return next;
}

function useDraftState(pool: DraftPool) {
  /* ---------- Football ---------- */
  const [config, setConfigState] = useState<DraftConfig>(pool.football.defaultConfig);
  const [selections, setSelections] = useState<Selections>({});
  const [armedPick, setArmedPick] = useState<number | null>(null);
  const [rankEdits, setRankEdits] = useState<Record<string, number>>({});
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [trees, setTrees] = useState<DraftTree[]>([]);

  const players = useMemo(
    () => pool.football.players.map((p) => ({ ...p, rank: rankEdits[p.id] ?? p.rank })),
    [pool.football.players, rankEdits],
  );
  const playersById = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const myPicks = useMemo(() => getMyPicks(config).filter((pick) => pick <= players.length), [config, players.length]);
  const drafted = useMemo(() => new Set(Object.values(selections).filter((id): id is string => !!id)), [selections]);

  // Once you draft someone, everyone ranked ahead of them is presumed gone.
  const impliedTaken = useMemo(() => {
    const worst = Math.max(0, ...[...drafted].map((id) => playersById[id]?.rank ?? 0));
    return new Set(players.filter((p) => p.rank <= worst && !drafted.has(p.id)).map((p) => p.id));
  }, [drafted, playersById, players]);

  const football = {
    players,
    playersById,
    config,
    myPicks,
    selections,
    armedPick,
    drafted,
    impliedTaken,
    watchlist,
    savedTeams,
    notes,
    trees,

    setConfig(next: DraftConfig) {
      setConfigState({ ...next, slot: Math.min(next.slot, next.teams) });
    },
    setRank(id: string, rank: number) {
      if (Number.isFinite(rank) && rank > 0) setRankEdits((prev) => ({ ...prev, [id]: rank }));
    },
    armPick(pick: number) {
      setArmedPick((prev) => (prev === pick ? null : pick));
    },
    /** Undo a drafted player, or assign them to the armed pick. */
    clickPlayer(id: string) {
      if (drafted.has(id)) {
        const entry = Object.entries(selections).find(([, pid]) => pid === id);
        if (entry) setSelections((prev) => omit(prev, Number(entry[0])));
        return;
      }
      if (armedPick == null) return;
      setSelections((prev) => ({ ...prev, [armedPick]: id }));
      setArmedPick(null);
    },
    /** Draft straight to your next open pick. */
    draftPlayer(id: string) {
      const next = myPicks.find((pick) => !selections[pick]);
      if (next != null) setSelections((prev) => ({ ...prev, [next]: id }));
    },
    clearBoard() {
      setSelections({});
      setArmedPick(null);
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

  /* ---------- Single-board sports ---------- */
  const hockey = useBoardDraft(pool.hockey.players, HOCKEY_ROSTER);
  const basketball = useBoardDraft(pool.basketball.players, BASKETBALL_ROSTER);

  return { football, hockey, basketball };
}

/**
 * Single draft board (hockey, basketball): each Draft click either marks a
 * player taken by another team or, when "next pick is mine" is on, adds them
 * to your roster.
 */
function useBoardDraft<P extends BoardPlayer>(pool: P[], roster: SlotDef[]) {
  const [myPicks, setMyPicks] = useState<string[]>([]);
  const [taken, setTaken] = useState<string[]>([]);
  const [nextPickIsMine, setNextPickIsMine] = useState(false);
  const [slotOverrides, setSlotOverrides] = useState<Record<string, string>>({});

  const playersById = useMemo(() => Object.fromEntries(pool.map((p) => [p.id, p])), [pool]);
  const slots = useMemo(
    () => buildRosterSlots(roster, myPicks, playersById, slotOverrides),
    [roster, myPicks, playersById, slotOverrides],
  );
  const rosterFull = myPicks.length >= roster.length;

  return {
    players: pool,
    playersById,
    rosterSize: roster.length,
    slots,
    rosterFull,
    myPicks: new Set(myPicks),
    taken: new Set(taken),
    nextPickIsMine,
    canClear: myPicks.length > 0 || taken.length > 0,

    /** Drafts to your team when "next pick is mine" is on, otherwise marks the player taken. */
    draft(id: string) {
      if (nextPickIsMine) {
        if (!rosterFull) setMyPicks((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setTaken((prev) => without(prev, id));
        setNextPickIsMine(false);
      } else {
        setTaken((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setMyPicks((prev) => without(prev, id));
      }
    },
    undo(id: string) {
      setMyPicks((prev) => without(prev, id));
      setTaken((prev) => without(prev, id));
      setSlotOverrides((prev) => omit(prev, id));
    },
    moveToSlot(id: string, label: string) {
      setSlotOverrides((prev) => ({ ...prev, [id]: label }));
    },
    toggleNextPickIsMine() {
      setNextPickIsMine((v) => !v);
    },
    clearBoard() {
      setMyPicks([]);
      setTaken([]);
      setSlotOverrides({});
      setNextPickIsMine(false);
    },
  };
}

type DraftState = ReturnType<typeof useDraftState>;

const DraftContext = createContext<DraftState | null>(null);

export function DraftProvider({ pool, children }: { pool: DraftPool; children: React.ReactNode }) {
  const state = useDraftState(pool);
  return <DraftContext value={state}>{children}</DraftContext>;
}

export function useDraft() {
  const state = use(DraftContext);
  if (!state) throw new Error("useDraft must be used inside <DraftProvider>");
  return state;
}

export type FootballState = DraftState["football"];
export type BoardState = ReturnType<typeof useBoardDraft<BoardPlayer>>;

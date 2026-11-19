"use client";

import { useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowUpRightIcon, CloseIcon, PlusIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  countNodes,
  createTreeFromSavedTeam,
  createTreeFromScratch,
  layoutTree,
  pathPlayerIds,
  TREE_BRANCH_WIDTH,
  TREE_LEVEL_HEIGHT,
  TREE_NODE_HEIGHT,
  TREE_NODE_WIDTH,
} from "@/lib/draft/draft-tree";
import { getMyPicks } from "@/lib/draft/snake-draft";
import type { DraftConfig, DraftTree } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { buttonStyles, PositionBadge, SelectField } from "./controls";
import { useDraft } from "./draft-state";
import { TreePlayerPicker } from "./tree-player-picker";

/** Branching "what if" scenarios: the list, or one scenario open in the editor. */
export function DraftTrees() {
  const { football } = useDraft();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = football.trees.find((t) => t.id === openId);

  return open ? <TreeEditor tree={open} onBack={() => setOpenId(null)} /> : <TreeList onOpen={setOpenId} />;
}

const configLine = (c: DraftConfig) => `${c.teams} teams, pick ${c.slot}, ${c.rounds} rounds`;

function TreeList({ onOpen }: { onOpen: (id: string) => void }) {
  const { football: f } = useDraft();
  const [picking, setPicking] = useState(false);
  const myPicks = useMemo(() => getMyPicks(f.config), [f.config]);

  function start(tree: DraftTree) {
    f.createTree(tree);
    onOpen(tree.id);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="font-display text-xl leading-tight font-bold tracking-tight uppercase sm:text-2xl">Start a scenario</h2>
        <p className="mt-1 text-sm text-fg-muted">Map out different ways your draft could go, pick by pick.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">From a saved team</span>
            {f.savedTeams.length ? (
              <SelectField
                label="Saved team"
                value=""
                onChange={(id) => {
                  const team = f.savedTeams.find((t) => t.id === id);
                  if (team) start(createTreeFromSavedTeam(`${team.name} scenario`, team));
                }}
                options={[{ id: "", label: "Choose a saved team" }, ...f.savedTeams.map((t) => ({ id: t.id, label: t.name }))]}
              />
            ) : (
              <p className="rounded-full border border-dashed border-border-strong px-3 py-1.5 text-sm text-fg-subtle">
                Save a team on the board first
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-fg-muted">From scratch ({configLine(f.config)})</span>
            <button type="button" onClick={() => setPicking(true)} className={cn(buttonStyles.primary, "self-start")}>
              <PlusIcon className="size-4" />
              Choose a Round 1 pick
            </button>
          </div>
        </div>
      </section>

      {picking && (
        <TreePlayerPicker
          title="Round 1 pick"
          myPicks={myPicks}
          targetPick={myPicks[0]}
          excludeIds={new Set()}
          onClose={() => setPicking(false)}
          onSelect={(player) => {
            setPicking(false);
            start(createTreeFromScratch(`Scenario ${f.trees.length + 1}`, f.config, player));
          }}
        />
      )}

      {f.trees.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {f.trees.map((tree) => (
            <section key={tree.id} className="flex flex-col rounded-card border border-border bg-surface p-5 shadow-card">
              <div className="flex items-start gap-2">
                <input
                  value={tree.name}
                  aria-label="Scenario name"
                  onChange={(e) => f.renameTree(tree.id, e.target.value)}
                  className="-mx-1 min-w-0 flex-1 rounded-md bg-transparent px-1 font-display text-2xl leading-tight font-bold uppercase outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
                />
                <button
                  type="button"
                  onClick={() => f.deleteTree(tree.id)}
                  aria-label={`Delete ${tree.name}`}
                  className={buttonStyles.icon + " hover:text-danger"}
                >
                  <CloseIcon />
                </button>
              </div>
              <p className="mt-1 text-xs text-fg-muted">
                {configLine(tree.config)}. {countNodes(tree.roots)} picks
              </p>
              <button
                type="button"
                onClick={() => onOpen(tree.id)}
                className="group mt-5 inline-flex items-center gap-1 self-start text-sm font-medium text-(--accent) transition-[scale] active:scale-95"
              >
                Open scenario
                <ArrowUpRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState title="No scenarios yet" description="Start one from a saved team or from a Round 1 pick." />
      )}
    </div>
  );
}

const PAD = 24;

function TreeEditor({ tree, onBack }: { tree: DraftTree; onBack: () => void }) {
  const { football: f } = useDraft();
  const picks = useMemo(() => getMyPicks(tree.config), [tree.config]);
  const { positioned, cols, maxDepth } = useMemo(() => layoutTree(tree.roots), [tree.roots]);
  const byId = useMemo(() => new Map(positioned.map((p) => [p.node.id, p])), [positioned]);
  // undefined: closed. null: adding a Round 1 option. string: adding after that node.
  const [pickerFor, setPickerFor] = useState<string | null | undefined>(undefined);

  const width = cols * TREE_BRANCH_WIDTH + PAD * 2;
  const height = (maxDepth + 1) * TREE_LEVEL_HEIGHT + PAD * 2;
  const pickerDepth = pickerFor ? (byId.get(pickerFor)?.depth ?? -1) + 1 : 0;

  return (
    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <header className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted transition-[color,scale] hover:text-fg active:scale-95"
        >
          <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Scenarios
        </button>
        <input
          value={tree.name}
          aria-label="Scenario name"
          onChange={(e) => f.renameTree(tree.id, e.target.value)}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 font-display text-2xl leading-tight font-bold uppercase outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
        />
        <span className="text-xs text-fg-muted">{configLine(tree.config)}</span>
        <button type="button" onClick={() => setPickerFor(null)} className={buttonStyles.primary}>
          <PlusIcon className="size-4" />
          Round 1 option
        </button>
      </header>

      <div className="canvas-grid h-[70dvh] min-h-[28rem] overflow-auto border-t border-border">
        {tree.roots.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-fg-muted">No picks yet. Add a Round 1 option to start.</p>
        ) : (
          <div className="relative mx-auto" style={{ width, height }}>
            <svg aria-hidden="true" className="pointer-events-none absolute inset-0" width={width} height={height}>
              {positioned.map((p) => {
                const parent = p.parentId && byId.get(p.parentId);
                if (!parent) return null;
                const x1 = parent.x + PAD + TREE_NODE_WIDTH / 2;
                const y1 = parent.y + PAD + TREE_NODE_HEIGHT;
                const x2 = p.x + PAD + TREE_NODE_WIDTH / 2;
                const y2 = p.y + PAD;
                const mid = (y1 + y2) / 2;
                return (
                  <path
                    key={p.node.id}
                    d={`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`}
                    fill="none"
                    stroke="var(--border-strong)"
                    strokeWidth={2}
                  />
                );
              })}
            </svg>
            {positioned.map((p) => (
              <div
                key={p.node.id}
                style={{ left: p.x + PAD, top: p.y + PAD, width: TREE_NODE_WIDTH, height: TREE_NODE_HEIGHT }}
                className="absolute flex flex-col rounded-2xl border border-border bg-surface p-3 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-fg-subtle">
                    R{p.depth + 1} · #{p.node.pick}
                  </span>
                  <button
                    type="button"
                    onClick={() => f.deleteTreePick(tree.id, p.node.id)}
                    aria-label="Delete this pick and everything after it"
                    title="Delete this pick and everything after it"
                    className={cn(buttonStyles.icon, "-m-1.5 size-6 hover:text-danger [&_svg]:size-3.5")}
                  >
                    <CloseIcon />
                  </button>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">{p.node.player.name}</span>
                  <PositionBadge label={p.node.player.position} className="min-w-0" />
                </div>
                {p.depth + 1 < picks.length && (
                  <button
                    type="button"
                    onClick={() => setPickerFor(p.node.id)}
                    className="mt-auto inline-flex items-center gap-1 self-start text-xs font-medium text-(--accent) transition-[scale] active:scale-95"
                  >
                    <PlusIcon className="size-3.5" />
                    Add pick
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pickerFor !== undefined && (
        <TreePlayerPicker
          title={`Round ${pickerDepth + 1} pick`}
          myPicks={picks}
          targetPick={picks[pickerDepth]}
          excludeIds={pathPlayerIds(tree, pickerFor)}
          onClose={() => setPickerFor(undefined)}
          onSelect={(player) => {
            f.addTreePick(tree.id, pickerFor, player);
            setPickerFor(undefined);
          }}
        />
      )}
    </section>
  );
}

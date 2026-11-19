import { getMyPicks } from "./snake-draft";
import type { DraftConfig, DraftTree, DraftTreeNode, PlayerRef, SavedTeam } from "./types";

const node = (pick: number, player: PlayerRef, children: DraftTreeNode[] = []): DraftTreeNode => ({
  id: crypto.randomUUID(),
  pick,
  player,
  children,
});

export function createTreeFromScratch(name: string, config: DraftConfig, player: PlayerRef): DraftTree {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    config,
    roots: [node(getMyPicks(config)[0], player)],
  };
}

/** Chains a saved team's picks into one straight path, ready to branch from. */
export function createTreeFromSavedTeam(name: string, team: SavedTeam): DraftTree {
  const picks = [...team.picks].sort((a, b) => a.pick - b.pick);
  let children: DraftTreeNode[] = [];
  for (let i = picks.length - 1; i >= 0; i--) children = [node(picks[i].pick, picks[i].player, children)];
  return { id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), config: team.config, roots: children };
}

/** Adds a pick under `parentId`, or a new Round 1 option when `parentId` is null. */
export function addTreeNode(tree: DraftTree, parentId: string | null, player: PlayerRef): DraftTree {
  const picks = getMyPicks(tree.config);
  if (parentId === null) return { ...tree, roots: [...tree.roots, node(picks[0], player)] };

  const recurse = (nodes: DraftTreeNode[], depth: number): DraftTreeNode[] =>
    nodes.map((n) => {
      if (n.id === parentId) {
        if (depth + 1 >= picks.length) return n;
        return { ...n, children: [...n.children, node(picks[depth + 1], player)] };
      }
      return n.children.length ? { ...n, children: recurse(n.children, depth + 1) } : n;
    });

  return { ...tree, roots: recurse(tree.roots, 0) };
}

/** Removes a node and everything after it. */
export function deleteTreeNode(tree: DraftTree, nodeId: string): DraftTree {
  const recurse = (nodes: DraftTreeNode[]): DraftTreeNode[] =>
    nodes.filter((n) => n.id !== nodeId).map((n) => ({ ...n, children: recurse(n.children) }));
  return { ...tree, roots: recurse(tree.roots) };
}

export function countNodes(nodes: DraftTreeNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

/** Players already used from the root down to `nodeId`, so they can't be picked again. */
export function pathPlayerIds(tree: DraftTree, nodeId: string | null): Set<string> {
  const find = (nodes: DraftTreeNode[], path: DraftTreeNode[]): DraftTreeNode[] | null => {
    for (const n of nodes) {
      const next = [...path, n];
      if (n.id === nodeId) return next;
      const found = find(n.children, next);
      if (found) return found;
    }
    return null;
  };
  const path = nodeId === null ? [] : (find(tree.roots, []) ?? []);
  return new Set(path.map((n) => n.player.id));
}

export type PositionedNode = { node: DraftTreeNode; depth: number; x: number; y: number; parentId: string | null };

export const TREE_LEVEL_HEIGHT = 140;
export const TREE_BRANCH_WIDTH = 216;
export const TREE_NODE_WIDTH = 196;
export const TREE_NODE_HEIGHT = 96;

/** Rounds run top to bottom, branches spread left to right without overlap. */
export function layoutTree(roots: DraftTreeNode[]) {
  const positioned: PositionedNode[] = [];
  let leaf = 0;
  let maxDepth = 0;

  const place = (n: DraftTreeNode, depth: number, parentId: string | null): number => {
    maxDepth = Math.max(maxDepth, depth);
    let col: number;
    if (!n.children.length) col = leaf++;
    else {
      const cols = n.children.map((c) => place(c, depth + 1, n.id));
      col = (cols[0] + cols[cols.length - 1]) / 2;
    }
    positioned.push({ node: n, depth, x: col * TREE_BRANCH_WIDTH, y: depth * TREE_LEVEL_HEIGHT, parentId });
    return col;
  };

  for (const root of roots) place(root, 0, null);
  return { positioned, cols: Math.max(leaf, 1), maxDepth };
}

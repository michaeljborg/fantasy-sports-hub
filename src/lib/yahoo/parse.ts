/**
 * Yahoo's JSON output mirrors its XML, which makes it awkward to read:
 * - Collections are objects keyed "0", "1", … plus a `count` field:
 *   `{ "0": { team: … }, "1": { team: … }, count: 2 }`
 * - An entity is an array of fragments, often nested, that together make up
 *   its fields: `[[{ team_key: "…" }, { name: "…" }], { roster: … }]`
 *
 * `list` turns a collection into an array; `fields` merges an entity's
 * fragments into one plain object.
 */
type Obj = Record<string, unknown>;

const isObj = (value: unknown): value is Obj =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Items of a Yahoo collection, unwrapped from their `{ [itemKey]: … }` wrapper. */
export function list(collection: unknown, itemKey: string): unknown[] {
  // Small collections (e.g. a team's `managers`) are sometimes plain arrays.
  const items = Array.isArray(collection)
    ? collection
    : isObj(collection)
      ? Object.keys(collection)
          .filter((key) => /^\d+$/.test(key))
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => collection[key])
      : [];
  return items
    .map((item) => (isObj(item) ? item[itemKey] : undefined))
    .filter((item) => item !== undefined);
}

/** Merges an entity's fragment array (at any nesting depth) into one object. */
export function fields(entity: unknown): Obj {
  const out: Obj = {};
  const walk = (node: unknown) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (isObj(node)) Object.assign(out, node);
  };
  walk(entity);
  return out;
}

export const str = (value: unknown) =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined;

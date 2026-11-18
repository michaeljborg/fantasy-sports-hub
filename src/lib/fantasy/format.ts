import type { Category } from "./types";

/** "total" for week-to-date sums, "avg" for per-game averages. */
export function formatStat(
  category: Category,
  value: number,
  mode: "total" | "avg" = "total",
) {
  if (category.format === "pct") return value.toFixed(3).replace(/^0/, "");
  return mode === "avg" ? value.toFixed(1) : String(Math.round(value));
}

export function formatGap(category: Category, gap: number) {
  return category.format === "pct"
    ? gap.toFixed(3).replace(/^0/, "")
    : String(Math.round(gap));
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatRecord({ w, l, t }: { w: number; l: number; t: number }) {
  return `${w}-${l}-${t}`;
}

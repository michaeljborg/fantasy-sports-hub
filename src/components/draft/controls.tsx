"use client";

import { useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/icons";
import type { HockeySlotLabel } from "@/lib/draft/hockey-roster-slots";
import type { SlotLabel } from "@/lib/draft/roster-slots";
import { cn } from "@/lib/navigation";

/* ---------- Buttons ---------- */

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-[background-color,color,opacity,scale] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-40";

export const buttonStyles = {
  primary: cn(buttonBase, "bg-(--accent) px-3.5 py-1.5 text-sm text-bg hover:opacity-90"),
  quiet: cn(buttonBase, "bg-surface-muted px-3.5 py-1.5 text-sm text-fg-muted hover:text-fg"),
  danger: cn(buttonBase, "bg-surface-muted px-3.5 py-1.5 text-sm text-fg-muted hover:bg-danger/12 hover:text-danger"),
  small: cn(buttonBase, "bg-(--accent) px-2.5 py-0.5 text-xs text-bg hover:opacity-90"),
  icon: cn(buttonBase, "size-7 shrink-0 text-fg-subtle hover:bg-surface-muted hover:text-fg [&_svg]:size-4"),
};

/* ---------- Position badge ---------- */

const hues: Record<string, string> = {
  QB: "--hue-purple",
  RB: "--hue-blue",
  WR: "--hue-green",
  TE: "--hue-orange",
  K: "--hue-amber",
  DST: "--hue-red",
  "W/R/T": "--hue-indigo",
  C: "--hue-purple",
  LW: "--hue-green",
  RW: "--hue-blue",
  D: "--hue-orange",
  G: "--hue-amber",
};

/** Colored position or roster-slot label. Bench (BN) is neutral. */
export function PositionBadge({
  label,
  muted,
  className,
}: {
  label: SlotLabel | HockeySlotLabel;
  muted?: boolean;
  className?: string;
}) {
  const hue = hues[label];
  return (
    <span
      style={hue && !muted ? ({ "--pos": `var(${hue})` } as React.CSSProperties) : undefined}
      className={cn(
        "inline-flex min-w-9 items-center justify-center rounded-md px-1.5 py-0.5 font-mono text-[11px] leading-4 font-semibold ring-1 ring-inset",
        hue && !muted ? "bg-(--pos)/12 text-(--pos) ring-(--pos)/25" : "bg-surface-muted text-fg-subtle ring-border",
        className,
      )}
    >
      {label}
    </span>
  );
}

/* ---------- Segmented toggle ---------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-surface-muted p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 font-medium whitespace-nowrap transition-[background-color,color,scale] duration-150 active:scale-95",
            o.id === value ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Switch ---------- */

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-fg-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-(--accent)" : "bg-border-strong",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-spring",
            checked && "translate-x-4",
          )}
        />
      </button>
    </label>
  );
}

/* ---------- Inputs ---------- */

const field =
  "rounded-full border border-border bg-surface text-sm text-fg outline-none transition-[border-color] duration-150 placeholder:text-fg-subtle hover:border-border-strong focus-visible:border-(--accent)";

export function SearchField({
  value,
  onChange,
  autoFocus,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-subtle" />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search players"
        aria-label="Search players"
        className={cn(field, "w-full py-1.5 pr-8 pl-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:text-fg"
        >
          <CloseIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  return (
    <select
      value={value}
      aria-label={label}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(field, "cursor-pointer py-1.5 pr-3 pl-3")}
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function positionOptions<T extends string>(positions: readonly T[]) {
  return [{ id: "ALL" as const, label: "All positions" }, ...positions.map((p) => ({ id: p, label: p }))];
}

/** Small labelled number input, used for the draft config. */
export function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isInteger(n) && n >= min && n <= max) onChange(n);
        }}
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 font-mono text-sm tabular-nums outline-none hover:border-border-strong focus-visible:border-(--accent)"
      />
    </label>
  );
}

/* ---------- Sorting ---------- */

export type SortDir = "asc" | "desc";

/** Click a column once to sort ascending, again to flip. */
export function useSort<K extends string>(initial: K) {
  const [key, setKey] = useState<K>(initial);
  const [dir, setDir] = useState<SortDir>("asc");
  return {
    key,
    dir,
    toggle(next: K) {
      if (next === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setKey(next);
        setDir("asc");
      }
    },
    reset() {
      setKey(initial);
      setDir("asc");
    },
  };
}

export function SortTh<K extends string>({
  label,
  sortKey,
  sort,
  className,
  title,
}: {
  label: string;
  sortKey: K;
  sort: { key: K; dir: SortDir; toggle: (k: K) => void };
  className?: string;
  title?: string;
}) {
  const active = sort.key === sortKey;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
      className={cn("px-2 py-2 font-medium", className)}
    >
      <button
        type="button"
        title={title}
        onClick={() => sort.toggle(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-fg",
          active && "text-fg",
        )}
      >
        {label}
        <span aria-hidden="true" className={cn("text-[9px]", active ? "text-(--accent)" : "invisible")}>
          {sort.dir === "asc" ? "▲" : "▼"}
        </span>
      </button>
    </th>
  );
}

/** "Pick 19" marker between players in rank order. */
export function PickBar({ pick, highlight }: { pick: number; highlight?: boolean }) {
  const line = cn("h-px flex-1", highlight ? "bg-success/50" : "bg-(--accent)/35");
  return (
    <span className="flex items-center gap-2 px-5 py-1 sm:px-6">
      <span className={line} />
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold",
          highlight ? "bg-success/14 text-success" : "bg-(--accent)/12 text-(--accent)",
        )}
      >
        Pick {pick}
        {highlight && " · this pick"}
      </span>
      <span className={line} />
    </span>
  );
}

/** PickBar as a full-width table row. */
export function PickDivider({ pick, colSpan }: { pick: number; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <PickBar pick={pick} />
      </td>
    </tr>
  );
}

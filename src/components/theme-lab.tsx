"use client";

/**
 * TEMP: floating palette / light-dark switcher for choosing a color scheme.
 * Remove this component, its <ThemeLab /> + script in layout.tsx, and the
 * unused palettes in src/styles/palettes.css once a scheme is picked.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/navigation";

const STORAGE_KEY = "fsh-theme-lab";

const palettes = [
  { id: "scorebook", name: "Scorebook" },
  { id: "royal", name: "Home Royal" },
  { id: "red", name: "Road Red" },
  { id: "purple", name: "Court Purple" },
] as const;

const modes = [
  { id: "system", label: "Auto" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

type PaletteId = (typeof palettes)[number]["id"];
type ModeId = (typeof modes)[number]["id"];
type LabState = { palette: PaletteId; mode: ModeId };

const DEFAULT_STATE: LabState = { palette: "scorebook", mode: "light" };

/** Inline script for <head> so the saved choice applies before first paint. */
export const themeLabScript = `try{var s=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}");var r=document.documentElement;var ids=${JSON.stringify(palettes.map((p) => p.id))};if(ids.indexOf(s.palette)>-1)r.dataset.palette=s.palette;var m=s.mode||"${DEFAULT_STATE.mode}";if(m!=="system")r.dataset.theme=m;}catch(e){}`;

function readState(): LabState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      palette: palettes.some((p) => p.id === saved.palette)
        ? saved.palette
        : DEFAULT_STATE.palette,
      mode: modes.some((m) => m.id === saved.mode)
        ? saved.mode
        : DEFAULT_STATE.mode,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function applyState({ palette, mode }: LabState) {
  const root = document.documentElement;
  root.dataset.palette = palette;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ palette, mode }));
  } catch {}
}

export function ThemeLab() {
  const [state, setState] = useState<LabState>(DEFAULT_STATE);
  const [expanded, setExpanded] = useState(true);

  // Sync from localStorage after mount (server render can't know it).
  useEffect(() => {
    setState(readState()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function update(next: Partial<LabState>) {
    const merged = { ...state, ...next };
    setState(merged);
    applyState(merged);
  }

  const active = palettes.find((p) => p.id === state.palette) ?? palettes[0];

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Open theme lab (${active.name})`}
        title="Theme lab"
        data-palette={active.id}
        className="fixed top-20 left-4 z-60 size-9 rounded-full border-2 border-surface bg-[linear-gradient(135deg,var(--accent-primary)_50%,var(--accent-secondary)_50%)] shadow-card ring-1 ring-border-strong transition-[scale] duration-200 ease-spring hover:scale-110 active:scale-90"
      />
    );
  }

  return (
    <div className="fixed top-20 left-4 z-60 flex flex-col gap-2 rounded-2xl border border-border-strong bg-surface/85 p-2.5 shadow-card backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-fg-subtle uppercase">
          Theme lab
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-medium">{active.name}</span>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Collapse theme lab"
            className="grid size-5 place-items-center rounded-full text-fg-muted transition-[color,background-color,scale] hover:bg-surface-muted hover:text-fg active:scale-90"
          >
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>

      <div className="flex gap-1.5" role="radiogroup" aria-label="Palette">
        {palettes.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={p.id === state.palette}
            aria-label={p.name}
            title={p.name}
            data-palette={p.id}
            onClick={() => update({ palette: p.id })}
            className={cn(
              "size-8 rounded-full bg-[linear-gradient(135deg,var(--accent-primary)_50%,var(--accent-secondary)_50%)] ring-offset-2 ring-offset-surface transition-[scale,box-shadow] duration-200 ease-spring hover:scale-110 active:scale-90",
              p.id === state.palette ? "ring-2 ring-fg" : "ring-1 ring-border",
            )}
          />
        ))}
      </div>

      <div
        className="grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-0.5"
        role="radiogroup"
        aria-label="Color mode"
      >
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === state.mode}
            onClick={() => update({ mode: m.id })}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-95",
              m.id === state.mode
                ? "bg-surface text-fg shadow-sm"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

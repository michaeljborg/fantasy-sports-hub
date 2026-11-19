"use client";

import { useRef, useState } from "react";
import { CloseIcon, GripIcon, PlusIcon } from "@/components/icons";
import { ConfirmButton } from "@/components/ui/dialog";
import type { Note, NoteColor } from "@/lib/draft/types";
import { cn } from "@/lib/navigation";
import { buttonStyles } from "./controls";
import { NOTE_COLORS, useDraft } from "./draft-state";

const noteHue: Record<NoteColor, string | undefined> = {
  yellow: "--hue-amber",
  blue: "--hue-blue",
  green: "--hue-green",
  pink: "--hue-pink",
  purple: "--hue-purple",
  white: undefined,
};

const hueStyle = (color: NoteColor) =>
  ({ "--note": noteHue[color] ? `var(${noteHue[color]})` : "var(--fg-subtle)" }) as React.CSSProperties;

const MIN_W = 180;
const MIN_H = 140;

/** Freeform sticky notes. Drag the grip to move, the corner to resize. */
export function NotesBoard() {
  const { football } = useDraft();
  return (
    <section className="overflow-hidden rounded-card border border-border bg-surface shadow-card">
      <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <p className="text-sm text-fg-muted">
          {football.notes.length ? "Drag a note by its handle to move it." : "Add a note for draft day reminders, sleepers or league rules."}
        </p>
        <button type="button" onClick={football.addNote} className={buttonStyles.primary}>
          <PlusIcon className="size-4" />
          Add note
        </button>
      </header>
      <div className="h-[70dvh] min-h-[28rem] overflow-auto border-t border-border">
        <div className="canvas-grid relative h-[1400px] w-[1600px]">
          {football.notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pointer drag that reports the delta from where it started. */
function useDrag(onDrag: (dx: number, dy: number) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown(e: React.PointerEvent) {
      e.currentTarget.setPointerCapture(e.pointerId);
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerMove(e: React.PointerEvent) {
      if (start.current) onDrag(e.clientX - start.current.x, e.clientY - start.current.y);
    },
    onPointerUp(e: React.PointerEvent) {
      start.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
  };
}

function NoteCard({ note }: { note: Note }) {
  const { football } = useDraft();
  const [colorsOpen, setColorsOpen] = useState(false);
  const origin = useRef(note);

  const remember = (e: React.PointerEvent, handler: (e: React.PointerEvent) => void) => {
    origin.current = note;
    handler(e);
  };
  const move = useDrag((dx, dy) =>
    football.updateNote(note.id, { x: Math.max(0, origin.current.x + dx), y: Math.max(0, origin.current.y + dy) }),
  );
  const resize = useDrag((dx, dy) =>
    football.updateNote(note.id, {
      width: Math.max(MIN_W, origin.current.width + dx),
      height: Math.max(MIN_H, origin.current.height + dy),
    }),
  );

  return (
    <div
      style={{ left: note.x, top: note.y, width: note.width, height: note.height, ...hueStyle(note.color) }}
      className={cn(
        "absolute flex flex-col rounded-2xl border bg-surface shadow-card",
        note.color === "white" ? "border-border-strong" : "border-(--note)/30",
      )}
    >
      {note.color !== "white" && <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-(--note)/12" />}
      <div className="relative flex items-center gap-1 px-1.5 pt-1.5">
        <div
          {...move}
          onPointerDown={(e) => remember(e, move.onPointerDown)}
          title="Drag to move"
          className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-full text-fg-subtle hover:bg-fg/5 active:cursor-grabbing"
        >
          <GripIcon className="size-4" />
        </div>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setColorsOpen((o) => !o)}
            aria-label="Change color"
            aria-expanded={colorsOpen}
            className="grid size-7 place-items-center rounded-full hover:bg-fg/5"
          >
            <span className="size-3.5 rounded-full bg-(--note) ring-1 ring-fg/10" />
          </button>
          {colorsOpen && (
            <div className="absolute top-8 left-0 z-20 flex gap-1 rounded-full border border-border-strong bg-surface p-1.5 shadow-card">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => {
                    football.updateNote(note.id, { color: c });
                    setColorsOpen(false);
                  }}
                  style={hueStyle(c)}
                  className={cn(
                    "size-5 rounded-full ring-1 ring-fg/10 transition-[scale] duration-150 hover:scale-110 active:scale-90",
                    c === "white" ? "bg-surface" : "bg-(--note)",
                    c === note.color && "ring-2 ring-fg",
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <input
          value={note.title}
          aria-label="Note title"
          onChange={(e) => football.updateNote(note.id, { title: e.target.value })}
          placeholder="Untitled"
          className="min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-fg-subtle"
        />
        <ConfirmButton
          title="Delete this note?"
          message="This can't be undone."
          confirmLabel="Delete note"
          onConfirm={() => football.deleteNote(note.id)}
          aria-label="Delete note"
          className={buttonStyles.icon + " hover:text-danger"}
        >
          <CloseIcon />
        </ConfirmButton>
      </div>
      <textarea
        value={note.text}
        aria-label="Note text"
        onChange={(e) => football.updateNote(note.id, { text: e.target.value })}
        placeholder="Type a note"
        className="relative flex-1 resize-none bg-transparent px-3 pt-1 pb-3 text-sm outline-none placeholder:text-fg-subtle"
      />
      <div
        {...resize}
        onPointerDown={(e) => remember(e, resize.onPointerDown)}
        title="Drag to resize"
        className="absolute right-0 bottom-0 size-5 cursor-nwse-resize touch-none rounded-br-2xl"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-full p-1 text-fg-subtle">
          <path d="M12 4 4 12M12 8.5 8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

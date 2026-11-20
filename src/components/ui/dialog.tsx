"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/navigation";

const panel =
  "m-auto rounded-card border border-border-strong bg-surface text-fg shadow-card backdrop:bg-fg/25 " +
  "opacity-0 scale-95 transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-spring " +
  "open:opacity-100 open:scale-100 starting:open:opacity-0 starting:open:scale-95";

/**
 * Native modal <dialog>, open while mounted. Esc and backdrop clicks close it.
 * Animated the same way as the Apps menu.
 */
export function Modal({
  onClose,
  className,
  label,
  children,
}: {
  onClose: () => void;
  className?: string;
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && ref.current?.close()}
      className={cn(panel, className)}
    >
      {children}
    </dialog>
  );
}

/** A button that asks for confirmation in a dialog before running `onConfirm`. */
export function ConfirmButton({
  title,
  message,
  confirmLabel,
  onConfirm,
  children,
  ...button
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  children: React.ReactNode;
} & Omit<React.ComponentProps<"button">, "onClick" | "title" | "type">) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} {...button}>
        {children}
      </button>
      {open && (
        <Modal label={title} onClose={() => setOpen(false)} className="w-[min(24rem,calc(100vw-2rem))] p-6">
          <h2 className="font-display text-2xl leading-tight font-bold uppercase">{title}</h2>
          <p className="mt-2 text-sm text-fg-muted">{message}</p>
          <form method="dialog" className="mt-6 flex justify-end gap-2">
            <button className="rounded-full px-4 py-2 text-sm font-medium text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white transition-[scale,opacity] duration-150 hover:opacity-90 active:scale-95"
            >
              {confirmLabel}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}

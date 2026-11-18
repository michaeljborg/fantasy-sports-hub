import type { Outcome } from "@/lib/fantasy/analysis";
import type { PlayerStatus } from "@/lib/fantasy/types";
import { cn } from "@/lib/navigation";

/** One place for win / close / lose colors. Literal class names for Tailwind. */
export const outcomeStyles: Record<
  Outcome,
  { label: string; text: string; fill: string; soft: string }
> = {
  winning: { label: "Winning", text: "text-success", fill: "bg-success", soft: "bg-success/12 text-success ring-success/25" },
  close: { label: "Close", text: "text-warning", fill: "bg-warning", soft: "bg-warning/14 text-warning ring-warning/30" },
  losing: { label: "Losing", text: "text-danger", fill: "bg-danger", soft: "bg-danger/12 text-danger ring-danger/25" },
};

export function OutcomeBadge({ outcome, className }: { outcome: Outcome; className?: string }) {
  const s = outcomeStyles[outcome];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", s.soft, className)}>
      {s.label}
    </span>
  );
}

export function StatusTag({ status }: { status: PlayerStatus }) {
  if (status === "healthy") return null;
  return (
    <span
      className={cn(
        "rounded px-1 py-px text-[10px] leading-none font-bold",
        status === "out" ? "bg-danger/15 text-danger" : "bg-warning/18 text-warning",
      )}
    >
      {status === "out" ? "OUT" : "DTD"}
    </span>
  );
}

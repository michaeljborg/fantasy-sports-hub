import { dayCall, type DayCall } from "@/lib/fantasy/analysis";
import type { Week } from "@/lib/fantasy/types";
import { cn } from "@/lib/navigation";

const calls: Record<DayCall, { label: (n: number) => string; tone: string }> = {
  sit: { label: (n) => `Sit ${n}`, tone: "bg-warning/14 text-warning ring-warning/30" },
  open: { label: (n) => `${n} open`, tone: "bg-surface-muted text-fg-muted ring-border" },
  full: { label: () => "Full", tone: "bg-success/12 text-success ring-success/25" },
};

/** The week at a glance: players with games vs. starting slots, per day. */
export function DayStrip({
  week,
  active,
  slots,
  compact = false,
}: {
  week: Week;
  active: number[];
  slots: number;
  compact?: boolean;
}) {
  return (
    <ol className={cn("grid grid-cols-7", compact ? "gap-1" : "gap-1.5 sm:gap-2")}>
      {week.days.map((day, i) => {
        const n = active[i];
        const call = dayCall(n, slots);
        const past = i < week.today;
        const today = i === week.today;
        return (
          <li
            key={day.short}
            aria-current={today ? "date" : undefined}
            className={cn(
              "flex flex-col items-center rounded-xl text-center ring-1 ring-inset",
              compact ? "gap-1 px-0.5 py-2" : "gap-1.5 px-1 py-3",
              past ? "opacity-45 ring-border" : today ? "bg-(--accent)/6 ring-(--accent)/40" : "ring-border",
            )}
          >
            <span className="text-xs font-medium text-fg-muted">{day.short}</span>
            {!compact && <span className="font-display text-2xl leading-none font-bold">{day.date}</span>}
            <span className="font-mono text-xs tabular-nums">
              {n}<span className="text-fg-subtle">/{slots}</span>
            </span>
            {past ? (
              <span className="text-[10px] font-medium text-fg-subtle">Done</span>
            ) : (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] leading-none font-semibold whitespace-nowrap ring-1 ring-inset",
                  calls[call].tone,
                )}
              >
                {calls[call].label(Math.abs(n - slots))}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

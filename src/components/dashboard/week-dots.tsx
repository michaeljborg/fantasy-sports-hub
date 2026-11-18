import type { WeekDay } from "@/lib/fantasy/types";
import { cn } from "@/lib/navigation";

/** Seven small marks, filled on game days. Past days dim. */
export function WeekDots({
  games,
  days,
  today,
}: {
  games: number[];
  days: WeekDay[];
  today: number;
}) {
  const left = games.filter((d) => d >= today).length;
  return (
    <span
      className="inline-flex items-center gap-[3px]"
      aria-label={`${games.length} games this week, ${left} left`}
      title={days.filter((_, i) => games.includes(i)).map((d) => d.short).join(", ")}
    >
      {days.map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "h-3 w-1.5 rounded-full",
            games.includes(i)
              ? i < today
                ? "bg-fg/30"
                : "bg-(--accent)"
              : "bg-surface-muted",
          )}
        />
      ))}
    </span>
  );
}

import type { CategoryResult } from "@/lib/fantasy/analysis";
import { cn } from "@/lib/navigation";
import { outcomeStyles } from "./outcome";

/**
 * Tug-of-war bar: your share fills from the left, colored by outcome.
 * The center tick marks an even split.
 */
export function CategoryBar({
  result,
  animate = false,
  delay = 0,
  className,
}: {
  result: CategoryResult;
  animate?: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={cn("relative h-2 rounded-full bg-surface-muted", className)}>
      <div
        className={cn(
          "absolute inset-y-0 left-0 origin-left rounded-full",
          outcomeStyles[result.outcome].fill,
          animate && "motion-safe:animate-fill",
        )}
        style={{ width: `${result.share * 100}%`, animationDelay: `${delay}ms` }}
      />
      <div aria-hidden="true" className="absolute -inset-y-1 left-1/2 w-px bg-fg/35" />
    </div>
  );
}

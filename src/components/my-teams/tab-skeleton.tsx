import { cn } from "@/lib/navigation";

function Block({ className }: { className?: string }) {
  return <div className={cn("rounded-lg bg-surface-muted motion-safe:animate-pulse", className)} />;
}

/** A panel with a title bar and a few rows, shaped like the real panels. */
function PanelSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-5 shadow-card sm:p-6", className)}>
      <Block className="h-6 w-40" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <Block key={i} className="h-8" />
        ))}
      </div>
    </div>
  );
}

/**
 * Shown the moment a tab is clicked, while its data streams in, so switching
 * tabs responds immediately.
 */
export function TabSkeleton({ variant = "list" }: { variant?: "overview" | "list" }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-6">
      {variant === "overview" ? (
        <>
          <Block className="h-20 rounded-card" />
          <div className="grid gap-6 lg:grid-cols-3">
            <PanelSkeleton rows={8} className="lg:col-span-2" />
            <div className="space-y-6">
              <PanelSkeleton rows={4} />
              <PanelSkeleton rows={4} />
            </div>
          </div>
        </>
      ) : (
        <PanelSkeleton rows={8} />
      )}
    </div>
  );
}

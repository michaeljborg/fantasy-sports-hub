export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-muted/60 px-2.5 py-1 text-xs font-medium text-fg-muted">
      {children}
    </span>
  );
}

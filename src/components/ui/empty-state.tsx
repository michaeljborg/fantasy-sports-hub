export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-card border border-dashed border-border-strong bg-surface/40 px-6 py-14 text-center backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="mx-auto mb-5 flex h-10 items-end justify-center gap-1.5"
      >
        {[40, 75, 55, 100, 65].map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-(--accent)/30"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-fg-muted">{description}</p>
    </div>
  );
}

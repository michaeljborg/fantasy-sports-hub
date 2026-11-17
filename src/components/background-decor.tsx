/** Fixed decorative backdrop: accent glows, court grid and a center-court circle. */
export function BackgroundDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="court-grid absolute inset-0" />
      <div className="absolute top-[-14rem] left-1/2 size-[38rem] -translate-x-1/2 rounded-full border border-(--grid-line)">
        <div className="absolute inset-[30%] rounded-full border border-(--grid-line)" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(40rem_28rem_at_0%_0%,color-mix(in_oklab,var(--brand)_8%,transparent),transparent_70%),radial-gradient(40rem_28rem_at_100%_0%,color-mix(in_oklab,var(--accent-primary)_8%,transparent),transparent_70%)]" />
    </div>
  );
}

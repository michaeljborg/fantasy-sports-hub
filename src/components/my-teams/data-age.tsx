import { dataAge } from "@/lib/yahoo/snapshots";
import { RefreshButton } from "./refresh-button";

// Server-rendered, so pin the zone (Vercel runs on UTC). Eastern matches the weekly cutoff.
const WHEN = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeZoneName: "short",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/**
 * "Yahoo data from Mon, Nov 23, 6:12 AM · Refresh". Render it after the page's
 * Yahoo reads have finished, so it sees how old they are. Shows nothing when
 * there's no database (the data is always live then).
 */
export function DataAge({ slug }: { slug: string }) {
  const fetchedAt = dataAge();
  if (!fetchedAt) return null;
  return (
    <p className="mt-8 flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
      <span>
        Yahoo data from <time dateTime={fetchedAt.toISOString()}>{WHEN.format(fetchedAt)}</time>
      </span>
      <span aria-hidden>·</span>
      <RefreshButton slug={slug} />
    </p>
  );
}

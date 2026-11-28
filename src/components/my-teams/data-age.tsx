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
 * "Yahoo data from Mon, Nov 23, 6:12 AM EST · Refresh". `fetchedAt` comes from
 * the page's loader (see src/lib/my-teams/loaders.ts); without a database it's
 * missing and nothing is shown, since the data is always live then.
 */
export function DataAge({ slug, fetchedAt }: { slug: string; fetchedAt?: string }) {
  if (!fetchedAt) return null;
  const when = new Date(fetchedAt);
  return (
    <p className="mt-8 flex flex-wrap items-center gap-x-2 text-xs text-fg-subtle">
      <span>
        Yahoo data from <time dateTime={fetchedAt}>{WHEN.format(when)}</time>
      </span>
      <span aria-hidden>·</span>
      <RefreshButton slug={slug} />
    </p>
  );
}

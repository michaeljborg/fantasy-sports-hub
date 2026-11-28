/**
 * Saved Yahoo reads ("snapshots") in Postgres, so My Teams doesn't call Yahoo
 * on every visit. Read-through: a fresh snapshot is returned as is; a stale or
 * missing one is fetched from Yahoo with the visitor's own token and saved.
 *
 * Freshness tiers:
 * - weekly: due after the latest week cutoff, Monday 06:00 US Eastern
 *   (Tuesday 06:00 for football, after Monday Night Football).
 * - hourly: due after an hour.
 *
 * Without DATABASE_URL every read goes straight to Yahoo, as before.
 */
import { cache } from "react";
import { db } from "@/lib/db";
import { rethrowNextErrors } from "@/lib/next-errors";
import type { SportId } from "@/lib/fantasy/types";
import { getSession } from "./session";

/** Bump to make every saved snapshot stale (e.g. after a parser fix). */
const VERSION = "v1";
const HOUR_MS = 60 * 60 * 1000;
const ZONE = "America/New_York";
const CUTOFF_HOUR = 6;
const ALL_SPORTS: SportId[] = ["basketball", "football", "hockey"];

// ---------------------------------------------------------------------------
// Week cutoff (DST-aware, no time-zone library)
// ---------------------------------------------------------------------------

const zoneParts = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONE,
  hourCycle: "h23",
  weekday: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
});

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function partsIn(date: Date) {
  const p = Object.fromEntries(zoneParts.formatToParts(date).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
    weekday: WEEKDAYS.indexOf(p.weekday),
  };
}

/** Minutes Eastern time is ahead of UTC at `date` (−300 in winter, −240 in summer). */
function offsetMinutes(date: Date) {
  const p = partsIn(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

/** The UTC instant of a wall-clock time in Eastern time. */
function easternToUtc(year: number, month: number, day: number, hour: number) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const first = guess - offsetMinutes(new Date(guess)) * 60000;
  // Re-check at the result, in case the guess landed on the other side of a DST change.
  return new Date(guess - offsetMinutes(new Date(first)) * 60000);
}

/** Latest Monday 06:00 ET (Tuesday for football) at or before `now`. */
export function weekCutoff(sport: SportId, now = new Date()) {
  const target = sport === "football" ? 2 : 1;
  const p = partsIn(now);
  let daysBack = (p.weekday - target + 7) % 7;
  if (daysBack === 0 && p.hour < CUTOFF_HOUR) daysBack = 7;
  const day = new Date(Date.UTC(p.year, p.month - 1, p.day - daysBack));
  return easternToUtc(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), CUTOFF_HOUR);
}

/** The most recent cutoff among several sports (unknown sport: all of them). */
function latestCutoff(sports: SportId[], now: Date) {
  const list = sports.length ? sports : ALL_SPORTS;
  return new Date(Math.max(...list.map((s) => weekCutoff(s, now).getTime())));
}

// ---------------------------------------------------------------------------
// Data age for the current render
// ---------------------------------------------------------------------------

/** Per request: the oldest snapshot used, so a page can say how old its data is. */
const ages = cache(() => ({ oldest: undefined as Date | undefined }));

function noteAge(fetchedAt: Date) {
  const store = ages();
  if (!store.oldest || fetchedAt < store.oldest) store.oldest = fetchedAt;
}

/** When the oldest data on this page was fetched from Yahoo; undefined without a database. */
export function dataAge() {
  return ages().oldest;
}

// ---------------------------------------------------------------------------
// Read-through cache
// ---------------------------------------------------------------------------

type Options<T> = {
  kind: string;
  key: string;
  tier: "weekly" | "hourly";
  /** The sport(s) whose week cutoff applies (weekly tier). */
  sport?: SportId | SportId[];
  /** Or read the sport from the saved data itself. */
  sportOf?: (data: T) => SportId | SportId[] | undefined;
  /** Leave out of the page's "data from" time (e.g. the header's team list). */
  trackAge?: boolean;
};

const asList = (s: SportId | SportId[] | undefined) => (s === undefined ? [] : Array.isArray(s) ? s : [s]);

function isFresh<T>(opts: Options<T>, data: T, fetchedAt: Date, now: Date) {
  if (opts.tier === "hourly") return now.getTime() - fetchedAt.getTime() < HOUR_MS;
  const sports = opts.sport !== undefined ? asList(opts.sport) : asList(opts.sportOf?.(data));
  return fetchedAt >= latestCutoff(sports, now);
}

// ---------------------------------------------------------------------------
// One query per team page: everything saved for the team, its league and the
// team list is read together, so the header and the tab arrive at the same
// time instead of in a series of separate lookups.
// ---------------------------------------------------------------------------

type Row = { data: unknown; fetchedAt: Date };

/** Per request: the team the page is about, if any (see scopeToTeam). */
const scope = cache(() => ({ team: undefined as { teamKey: string; leagueKey: string } | undefined }));

/** Call before a team page's reads, so they share one database query. */
export function scopeToTeam(teamKey: string, leagueKey: string) {
  scope().team = { teamKey, leagueKey };
}

const inScope = (key: string, s: { teamKey: string; leagueKey: string }) =>
  key === s.teamKey || key === s.leagueKey || key === "" || key.startsWith(`${s.teamKey}:`);

const teamRows = cache(async (guid: string, teamKey: string, leagueKey: string) => {
  const rows = await db()!`
    select kind, key, data, fetched_at from yahoo_snapshots
    where user_guid = ${guid}
      and (key = any(${[teamKey, leagueKey, ""]}) or key like ${`${teamKey}:%`})`;
  return new Map<string, Row>(
    rows.map((r) => [`${r.kind}|${r.key}`, { data: r.data, fetchedAt: new Date(r.fetched_at as string) }]),
  );
});

async function readSaved(guid: string, kind: string, key: string): Promise<Row | undefined> {
  const s = scope().team;
  if (s && inScope(key, s)) return (await teamRows(guid, s.teamKey, s.leagueKey)).get(`${kind}|${key}`);
  const rows = await db()!`
    select data, fetched_at from yahoo_snapshots
    where user_guid = ${guid} and kind = ${kind} and key = ${key}`;
  return rows[0] ? { data: rows[0].data, fetchedAt: new Date(rows[0].fetched_at as string) } : undefined;
}

let warnedNoGuid = false;

export async function cached<T>(opts: Options<T>, fetcher: () => Promise<T>): Promise<T> {
  const sql = db();
  const guid = sql ? (await getSession())?.guid : undefined;
  if (sql && !guid && !warnedNoGuid && process.env.NODE_ENV === "development") {
    warnedNoGuid = true;
    console.warn(
      "[snapshots] No Yahoo user ID in the session yet, so nothing is saved on this request. The proxy fills it in on the next page load.",
    );
  }
  if (!sql || !guid) return fetcher();

  const kind = `${VERSION}:${opts.kind}`;
  const track = opts.trackAge !== false;
  const now = new Date();

  let saved: { data: T; fetchedAt: Date } | undefined;
  try {
    saved = (await readSaved(guid, kind, opts.key)) as typeof saved;
  } catch (error) {
    // A prefetch render being cut off isn't a database problem: let Next handle it.
    rethrowNextErrors(error);
    console.error("[snapshots] read failed, calling Yahoo directly:", (error as Error).message);
    return fetcher();
  }

  if (saved && isFresh(opts, saved.data, saved.fetchedAt, now)) {
    if (track) noteAge(saved.fetchedAt);
    return saved.data;
  }

  let data: T;
  try {
    data = await fetcher();
  } catch (error) {
    rethrowNextErrors(error);
    // Yahoo is down or the session expired: an old snapshot beats an error page.
    if (saved) {
      if (track) noteAge(saved.fetchedAt);
      return saved.data;
    }
    throw error;
  }

  try {
    await sql`
      insert into yahoo_snapshots (user_guid, kind, key, data, fetched_at)
      values (${guid}, ${kind}, ${opts.key}, ${JSON.stringify(data)}::jsonb, ${now.toISOString()})
      on conflict (user_guid, kind, key)
      do update set data = excluded.data, fetched_at = excluded.fetched_at`;
  } catch (error) {
    rethrowNextErrors(error);
    console.error("[snapshots] write failed:", (error as Error).message);
  }
  if (track) noteAge(now);
  return data;
}

/**
 * Deletes the user's snapshots for these keys, plus any keyed under them
 * (e.g. "466.l.1.t.3:w6"), so the next read goes to Yahoo.
 */
export async function clearSnapshots(guid: string, keys: string[]) {
  const sql = db();
  if (!sql) return;
  const prefixes = keys.filter(Boolean).map((k) => `${k}:%`);
  await sql`
    delete from yahoo_snapshots
    where user_guid = ${guid}
      and (key = any(${keys}) or key like any(${prefixes}))`;
}

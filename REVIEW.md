# Review: Yahoo data, My Teams and page loading

The decisions behind the Yahoo integration, the My Teams app, saved data, and how pages load. Each entry covers what was decided, why, and what it costs. Known drawbacks and suggested follow-ups are at the end.

Branch: `my-teams`, built on `ui-polish`. As of 2026-11-28.

---

## 1. Yahoo sign-in and session

### 1.1 Session in an encrypted cookie, no auth database
- **Decision:** Yahoo's tokens are stored in one httpOnly cookie (`fsh_yahoo`), encrypted with AES-GCM using `SESSION_SECRET`.
- **Why:** it works the same locally and on Vercel, and needs no database for sign-in. Each browser has its own session, so league mates can sign in later without changes.
- **Cost:** the server can't act for a user who isn't on the site. That rules out scheduled jobs (see 3.3). Signing out only affects the current browser.
- **Files:** `src/lib/yahoo/session.ts`, `crypto.ts`, `oauth.ts`, `src/app/api/auth/yahoo/*`

### 1.2 Token refresh in the proxy
- **Decision:** `src/proxy.ts` refreshes the 1-hour access token before a page renders.
- **Why:** Server Components can read cookies but can't write them. The proxy runs before rendering and can set the cookie for both the page and the browser.
- **Cost:** the proxy runs on every page request that has the session cookie, including prefetches. It's cheap when the token is still fresh.

### 1.3 Read-only access
- **Decision:** the Yahoo app is registered as Fantasy Sports **Read**.
- **Why:** the app only shows data. Lineup changes, adds and trades stay on Yahoo.
- **Cost:** moving any of those into the app later means re-registering with Read/Write.

### 1.4 The Yahoo user ID comes from the Fantasy API
- **Decision:** the user's GUID comes from `/users;use_login=1`.
  - New sign-ins fetch it in the callback.
  - Existing sessions get it filled in by the proxy, which stores it in the cookie.
- **Why:** saved data is keyed by the GUID. Yahoo's token field `xoauth_yahoo_guid` is deprecated and wasn't sent. The OpenID `id_token` needs an OpenID scope this app doesn't request. Without a GUID, the cache silently did nothing.
- **Cost:** one extra Yahoo call per session.
- **File:** `src/lib/yahoo/identity.ts`

---

## 2. The My Teams app

### 2.1 Scope: team data, not matchup data
- **Decision:** the app has four tabs (Overview, Roster, Draft, Activity). The only matchup content is a small "This week" card showing the opponent with no score. For basketball it links to Weekly Matchup.
- **Why:** to keep the two apps separate. The card links across instead of duplicating the matchup view.
- **Cost:** football and hockey cards don't link anywhere yet, because Weekly Matchup only supports basketball.

### 2.2 Home-page team cards open My Teams
- **Decision:** clicking a team on the home page opens it in My Teams. "View on Yahoo" moved into the team header.

### 2.3 URL slugs
- **Decision:** team keys become slugs with dashes: `478.l.14326.t.2` → `478-l-14326-t-2`.
- **Why:** dots in a path segment look like file extensions.
- **File:** `src/lib/my-teams/slug.ts`

### 2.4 Defensive parsing and a dev-only raw viewer
- **Decision:** every Yahoo field is optional and missing values are hidden. `/api/yahoo/raw?path=…` shows the raw JSON, in dev only.
- **Why:** Yahoo's docs only have 2019 XML samples, and many fields (injury status, FAAB, manager details) aren't documented. The raw viewer is how the parsers get checked against real responses.
- **Cost:** a wrong field name shows up as missing data, not as an error, so it's easy to miss.
- **Files:** `src/lib/yahoo/parse.ts`, `team.ts`, `src/app/api/yahoo/raw/route.ts`

---

## 3. Saved Yahoo data (Neon Postgres)

### 3.1 Save every Yahoo read
- **Decision:** each read is saved per user in one table, `yahoo_snapshots`, keyed by user GUID, kind and team or league key. Pages use the saved copy until it's due.
- **Why:** before this, opening My Teams and clicking through the tabs took about 22 Yahoo calls, and revisiting a tab fetched it again.
- **Files:** `src/lib/yahoo/snapshots.ts`, `src/lib/db.ts`, `db/schema.sql`

### 3.2 Two freshness tiers

| Data | Refreshes | Reason |
|---|---|---|
| Team list, standings, this week's opponent, league settings, team details, season stats, draft | Weekly: Monday 6:00 AM ET (Tuesday for football) | Head-to-head standings only change when a week ends; the cutoff lines up with Yahoo's week rollover. |
| Roster, Activity | At most hourly | Injuries, lineups, moves and waiver claims change daily. |

The cutoff is worked out with `Intl` (no time-zone library) and was tested across both 2026 daylight-saving changes.

### 3.3 Refresh on first visit, no scheduled job
- **Decision:** the first visit after data is due fetches it with that visitor's token and saves it.
- **Why:** a scheduled job would need every user's Yahoo refresh token stored in the database, which is a security cost. It would also only run once the app is deployed.
- **Cost:** the first visit after a cutoff waits on Yahoo.

### 3.4 Snapshot versioning and stale fallback
- **Decision:** a `VERSION` prefix sits on each kind. If Yahoo fails and an old copy exists, the old copy is shown.
- **Why:** bumping `VERSION` after a parser fix makes every old snapshot stale at once. Showing an old copy beats showing an error page.

### 3.5 Refresh button and "Yahoo data from" line
- **Decision:** each tab shows when its data was fetched. Refresh deletes that team's snapshots and re-renders the page.
- **Why:** an escape hatch for mid-week changes, such as a trade.

### 3.6 One database query per team page
- **Decision:** the header and the tab load everything saved for the team, its league and the team list in **one** query (`scopeToTeam`).
- **Why:** separate lookups landed at different times and made the page fill in piece by piece.

### 3.7 `db()` reads the env every time
- **Decision:** the client is only created when `DATABASE_URL` is set, and "no database" is never cached.
- **Why:** it used to cache "no database" if a page ran before the URL was pasted in, so nothing was saved until a full restart.

---

## 4. Page loading

### 4.1 Each tab has its own loading boundary
- **Decision:** each tab page renders its placeholder straight away and streams its content inside `<Suspense>`. The blank `loading.tsx` was removed.
- **Why:** Next 16's dev check flagged that tab pages blocked navigation. The blank box was also the first of several visible stages.

### 4.2 Placeholders the same size as the real content
- **Decision:**
  - The header skeleton matches the real header row heights.
  - The tab bar renders straight away, since it only needs the URL.
  - The home-page skeleton matches the team-card grid.
- **Why:** so nothing moves when real content replaces a placeholder.

### 4.3 Short fade-in, no slide on My Teams tabs
- **Decision:** tab content fades in over 0.2s, which reduced-motion settings disable. The sideways slide was removed from My Teams tab pages.
- **Why:** the slide could replay when streamed content arrived. Note the diagnosis: the visible left-right movement turned out to be the scrollbar (4.4). Removing the slide didn't fix that.
- **Cost:** My Teams tabs don't slide; Weekly Matchup tabs still do.

### 4.4 `scrollbar-gutter: stable`
- **Decision:** the scrollbar's space is always reserved, in `src/app/globals.css`.
- **Why:** this was the real cause of the shift. On Windows the scrollbar appeared and disappeared as short placeholders were swapped for long content, moving centered content sideways.
- **Cost:** short pages have an empty scrollbar-width strip on the right.

### 4.5 Load pages ahead of the click (`use cache: private` + `prefetch={true}`)
- **Decision:**
  - The home page's team list (`getAccount`) and every My Teams page loader (`src/lib/my-teams/loaders.ts`) are `'use cache: private'` with a 5-minute browser lifetime.
  - Links into My Teams use `prefetch={true}`: home team cards, the tabs, and the team switcher.
- **Why:** this is Next 16's documented way to make signed-in pages instant. The result is kept only in the user's browser, never on the server.
- **Cost:** background requests; see Drawbacks.

### 4.6 Warm-up step removed
- **Decision:** the invisible step that loaded all four tabs on entering a team is gone.
- **Why:** prefetching the tab links does the same job. Keeping it would have made every prefetched team card load all four tabs from Yahoo.

### 4.7 Next's internal errors are rethrown
- **Decision:** `rethrowNextErrors()` runs first in every `catch` around data loading. It covers `unstable_rethrow` plus the Neon driver's `sourceError`.
- **Why:** prefetch renders get cut off by Next, and our catches treated that as a broken database. They logged warnings and wasted Yahoo calls.
- **File:** `src/lib/next-errors.ts`

---

## Drawbacks and risks

| # | Drawback | Impact | Mitigation or follow-up |
|---|---|---|---|
| D1 | **Background requests from prefetching.** Every prefetched link is a server invocation plus a database read. | Low for one user. It grows with teams on screen and with users; it counts against Vercel and Neon free-tier limits and uses mobile data. | Watch usage after deploying. If needed, switch the home team cards to plain links, or prefetch on hover. |
| D2 | **Weekly Yahoo burst.** The first home visit after the cutoff fetches every team's Overview in the background. | About 4 Yahoo calls per team at once. Yahoo publishes no rate limit and throttles "excessive" use. | Fine for one user. With many users, share league-wide data (D5) or stagger refreshes. |
| D3 | **Weekly data can be a week old.** Season stats change daily in the NBA. Points and rotisserie leagues update standings daily, but the weekly tier assumes head-to-head. | Some numbers lag until Monday or a Refresh. | Make the tier depend on league type, e.g. daily for `point`/`roto` and for season stats. |
| D4 | **Browser copy is up to 5 minutes old,** and error states are cached for those 5 minutes too. | After a Yahoo hiccup, the error can persist while clicking around. | Refresh, sign-in and sign-out clear it. Could stop caching error results. |
| D5 | **Snapshots are per user.** League mates in the same league each fetch the same league data. | More Yahoo calls and rows once others sign in. | Store league-wide data (settings, standings, season stats) keyed by league, not user. |
| D6 | **First visit after a cutoff is slow.** No scheduled refresh. | That one visit waits on Yahoo, behind placeholders. | Accepted to avoid storing Yahoo tokens (3.3). |
| D7 | **Neon free tier scales to zero** after a period of inactivity. | The first query after idling can take noticeably longer. | Paid tier, or accept it. |
| D8 | **Relies on newer Next 16 features and internals:** `partialPrefetching`, `use cache: private`, `instant`, `unstable_rethrow`, the prefetch abort behavior. | A Next upgrade could change behavior. | Re-check prefetching and the `rethrowNextErrors` logs after upgrades. |
| D9 | **Parsers rely on undocumented Yahoo JSON.** | A field rename shows up as missing data, not an error. | Use `/api/yahoo/raw` to check, and bump `VERSION` after parser fixes. |
| D10 | **No database means no caching.** | Every visit calls Yahoo live. | Intended fallback; set `DATABASE_URL` everywhere the app runs. |
| D11 | **`instant = false` on the My Teams layout** turns off Next's dev checks for entering the app. | Future regressions there won't be flagged. | Tab-to-tab navigations are still checked. |
| D12 | **No automated tests.** Everything here was checked by hand, with build and lint, and one script for the week cutoff. | Regressions rely on manual testing. | Add tests for `weekCutoff`, the parsers and `cached()`, plus an e2e check of instant tab switches. |

## Suggested follow-ups
1. Daily freshness for points and rotisserie leagues, and for season stats (D3).
2. Share league-wide snapshots across users before inviting league mates (D5).
3. Don't cache error results in the private loaders (D4).
4. Add tests (D12).
5. Optionally add an `.env.example` template. For now the README lists the variables directly.

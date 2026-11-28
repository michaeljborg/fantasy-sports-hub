# Fantasy Sports Hub

Fantasy sports tools for your Yahoo leagues. Sign in with Yahoo to see your basketball, football and hockey teams.

Built with Next.js 16, React 19 and Tailwind CSS 4. Design decisions and known trade-offs are in [REVIEW.md](REVIEW.md).

## Apps

| App | Status |
|---|---|
| My Teams | Built, real Yahoo data |
| Weekly Matchup | Built, mock data |
| Draft Prep | Built, mock data |
| Hall of Fame, Trades & Injury Alerts, Playoff Odds, Trade Analyzer | Placeholders |

**My Teams** (`/my-teams/<team>`) switches between your Yahoo teams, with four tabs:
- **Overview:** this week's opponent (links to Weekly Matchup), standings, team status, league settings and season stats
- **Roster:** players by slot, with injury status and season stats
- **Draft:** your picks, and whether each player is still on your roster
- **Activity:** pending claims and offers, plus your adds, drops and trades

## Setup

1. **Create a Yahoo app** at https://developer.yahoo.com/apps/create/:
   - API permissions: **Fantasy Sports → Read**
   - Redirect URI: `https://localhost:3000/api/auth/yahoo/callback`
2. **Create `.env.local`** (gitignored; restart the dev server after changing it):

   | Variable | Value |
   |---|---|
   | `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET` | From your Yahoo app |
   | `YAHOO_REDIRECT_URI` | Exactly the redirect URI above |
   | `SESSION_SECRET` | 32+ random characters: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
   | `DATABASE_URL` | Optional. Neon Postgres connection string. Without it, Yahoo is called live on every visit. |

3. **Database (optional):** create a free Postgres database at https://neon.com (US East region), put its `postgresql://…` string in `DATABASE_URL`, then run `pnpm db:setup`. Keep the string private; it contains the password.
4. **Run:** `pnpm install`, then `pnpm dev:https`, and open https://localhost:3000. Accept the self-signed certificate warning once. Yahoo only redirects to HTTPS, so sign-in needs `dev:https`.

| Script | What it does |
|---|---|
| `pnpm dev` / `pnpm dev:https` | Dev server over HTTP / HTTPS |
| `pnpm build` / `pnpm start` | Production build / run it (http://localhost:3000; an existing sign-in still works) |
| `pnpm lint` | ESLint |
| `pnpm db:setup` | Create the database table (safe to re-run) |

## Yahoo sign-in

1. `/api/auth/yahoo/login` sends you to Yahoo's consent page.
2. Yahoo returns you to `/api/auth/yahoo/callback`. The server exchanges the code for tokens and fetches your Yahoo user ID, which keys your saved data.
3. Tokens and user ID live in an encrypted, httpOnly cookie (`fsh_yahoo`). No tokens are stored in the database.
4. `src/proxy.ts` refreshes the 1-hour access token before each page renders, and fills in the user ID if an older session lacks it.
5. **Sign out** posts to `/api/auth/yahoo/logout`, which clears the cookie.

## Yahoo APIs used

Read-only. The code is in `src/lib/yahoo/`.
- **Auth docs:** https://developer.yahoo.com/oauth2/guide/flows_authcode/
- **Fantasy docs:** https://sports.yahoo.com/developer/docs/
- **Fantasy base URL:** `https://fantasysports.yahooapis.com/fantasy/v2`

| Endpoint | Returns | Called from |
|---|---|---|
| `GET api.login.yahoo.com/oauth2/request_auth` | Login and consent page | `oauth.ts` → `authorizeUrl()` |
| `POST api.login.yahoo.com/oauth2/get_token` | Tokens from the sign-in code, and hourly refreshes | `oauth.ts` → `exchangeCode()`, `refreshTokens()` |
| `/users;use_login=1` | Your Yahoo user ID | `identity.ts` → `fetchYahooGuid()` |
| `/users;use_login=1/games;game_keys=nba,nfl,nhl/teams` and `/leagues` | Your current-season teams, league names and sizes | `api.ts` → `getMyTeams()` |
| `/teams;team_keys=…/standings` | Rank and W-L-T per team (optional) | `api.ts` → `getStandings()` |
| `/league/{league_key};out=settings,standings` | League settings, scoring categories, standings | `team.ts` → `getLeague()` |
| `/league/{league_key}/teams/stats` | All teams' season totals, to rank you per category | `team.ts` → `getSeasonStats()` |
| `/team/{team_key}` | Waivers, FAAB, moves, trades, draft grade, managers | `team.ts` → `getTeamDetails()` |
| `/team/{team_key}/matchups;weeks={week}` | This week's opponent (no scores) | `team.ts` → `getThisWeek()` |
| `/team/{team_key}/roster/players/stats` | Roster with injuries and season stats (falls back to `/roster`) | `team.ts` → `getRoster()` |
| `/team/{team_key}/draftresults` and `/league/{league_key}/players;player_keys=…` | Draft picks and player names (25 per request) | `team.ts` → `getDraft()` |
| `/league/{league_key}/transactions;types=add,drop,trade;team_key=…` | Adds, drops and trades | `team.ts` → `getActivity()` |
| `/league/{league_key}/transactions;types=waiver,pending_trade;team_key=…` | Pending claims and trade offers (only you can see them) | `team.ts` → `getActivity()` |

Requests go through `yahooGet()` (`client.ts`), and `parse.ts` flattens Yahoo's nested JSON. Show "Fantasy data provided by Yahoo Fantasy" wherever Yahoo data appears.

**Debugging (dev only):**
- Each real Yahoo call is logged as `Yahoo GET <path>`.
- `/api/yahoo/raw?path=…` shows the raw JSON for any path, using your session. Yahoo's docs are incomplete, so this is how to check field names.

## How Yahoo data is saved and loaded

With `DATABASE_URL` set, each Yahoo read is saved per user in `yahoo_snapshots` (`src/lib/yahoo/snapshots.ts`). Pages use the saved copy until it's due. The next visit then fetches it fresh with that visitor's token; there's no scheduled job.

| Data | Refreshes |
|---|---|
| Team list, standings, this week's opponent, league settings, team details, season stats, draft | Weekly, after Monday 6:00 AM US Eastern (Tuesday for football) |
| Roster and Activity | At most hourly |

- **One query per page:** each team page reads everything it needs in a single database query.
- **Refresh button:** each tab shows when its data was fetched, plus **Refresh** to fetch it again now.
- **Fallback:** if Yahoo fails, the last saved copy is shown instead of an error.
- **Loaded ahead:**
  - The home page's team list and each My Teams page use `'use cache: private'` loaders (`yahoo-account.tsx`, `src/lib/my-teams/loaders.ts`). Your browser keeps the result for 5 minutes.
  - Team cards, tabs and the team switcher use `<Link prefetch={true}>`.
  - Together, opening a team or switching tabs is usually instant.
- **Cost:** each prefetched link is a background request, normally one database read. On the first home visit after the weekly cutoff, every team's Overview loads from Yahoo (about 4 calls per team).
- **Parser changes:** bump `VERSION` in `snapshots.ts` so old saved copies are ignored.

## Project layout

```
db/schema.sql            Database table (pnpm db:setup)
scripts/db-setup.mjs     Applies db/schema.sql
src/
  app/                   Pages and routes, one folder per app
    api/auth/yahoo/      Sign-in, callback, sign-out
    api/yahoo/raw/       Dev-only raw Yahoo JSON viewer
    my-teams/            My Teams pages and the Refresh action
  components/            Shared UI (my-teams/ for My Teams)
  lib/
    apps.ts              Apps shown on the home page
    my-teams/            My Teams loaders, URLs, tabs, formatting
    yahoo/               Yahoo auth, API client, parsing, saved snapshots
    fantasy/, draft/     Weekly Matchup and Draft Prep (mock data)
    db.ts                Neon Postgres client
    next-errors.ts       Rethrows Next's internal errors inside catch blocks
  proxy.ts               Token refresh and user-ID backfill
```

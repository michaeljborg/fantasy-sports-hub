# Fantasy Sports Hub

A hub of fantasy sports tools for your Yahoo leagues. Sign in with Yahoo and the app shows your teams across basketball, football and hockey.

Built with Next.js 16, React 19 and Tailwind CSS 4.

## Apps

| App | Status |
|---|---|
| My Teams | Built, on real Yahoo data |
| Weekly Matchup | Built, on mock data |
| Draft Prep | Built, on mock data |
| Hall of Fame | Placeholder |
| Trades & Injury Alerts | Placeholder |
| Playoff Odds | Placeholder |
| Trade Analyzer | Placeholder |

The home page team list and My Teams use real Yahoo data. The other apps still run on mock data.

**My Teams** (`/my-teams/<team>`) switches between your Yahoo teams. Each team has four tabs:
- **Overview:** who you play this week (links to Weekly Matchup), standings, team status, league settings and season stats.
- **Roster:** players by slot, with injury status and season stats.
- **Draft:** your picks and whether each player is still on your roster.
- **Activity:** pending claims and offers, plus your adds, drops and trades.

## Setup

### 1. Create a Yahoo app

1. Create an app at https://developer.yahoo.com/apps/create/.
2. Under API permissions, choose **Fantasy Sports → Read**.
3. Set the redirect URI to `https://localhost:3000/api/auth/yahoo/callback`.

### 2. Add environment variables

Copy `.env.example` to `.env.local` and fill it in:

| Variable | Value |
|---|---|
| `YAHOO_CLIENT_ID` | Client ID from your Yahoo app |
| `YAHOO_CLIENT_SECRET` | Client secret from your Yahoo app |
| `YAHOO_REDIRECT_URI` | Must match the Yahoo app exactly, e.g. `https://localhost:3000/api/auth/yahoo/callback` |
| `SESSION_SECRET` | At least 32 random characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |

`.env.local` is gitignored. Restart the dev server after changing it.

### 3. Run locally

```bash
pnpm install
pnpm dev:https
```

Open https://localhost:3000 and accept the self-signed certificate warning once.

Yahoo only redirects to HTTPS URLs, so sign-in needs `pnpm dev:https`. Plain `pnpm dev` (http://localhost:3000) works for everything else.

### Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server over HTTP |
| `pnpm dev:https` | Dev server over HTTPS (needed for Yahoo sign-in) |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |

## How Yahoo sign-in works

1. **Sign in with Yahoo** goes to `/api/auth/yahoo/login`, which sends you to Yahoo's consent page.
2. Yahoo sends you back to `/api/auth/yahoo/callback` with a one-time code. The server exchanges it for tokens.
3. The tokens are stored in an encrypted, httpOnly cookie (`fsh_yahoo`). There is no database.
4. Access tokens last 1 hour. `src/proxy.ts` refreshes them before a page renders.
5. **Sign out** posts to `/api/auth/yahoo/logout`, which clears the cookie.

## Yahoo APIs used

The app has read-only access. Yahoo code lives in `src/lib/yahoo/`.

### Auth (OAuth 2.0)

Docs: https://developer.yahoo.com/oauth2/guide/flows_authcode/

| Endpoint | Used for | Called from |
|---|---|---|
| `GET https://api.login.yahoo.com/oauth2/request_auth` | Yahoo login and consent page | `oauth.ts` → `authorizeUrl()` |
| `POST https://api.login.yahoo.com/oauth2/get_token` (`grant_type=authorization_code`) | Exchange the sign-in code for tokens | `oauth.ts` → `exchangeCode()` |
| `POST https://api.login.yahoo.com/oauth2/get_token` (`grant_type=refresh_token`) | Get a new access token every hour | `oauth.ts` → `refreshTokens()` |

### Fantasy Sports API

Docs: https://sports.yahoo.com/developer/docs/
Base URL: `https://fantasysports.yahooapis.com/fantasy/v2`

| Endpoint | Returns | Called from |
|---|---|---|
| `/users;use_login=1/games;game_keys=nba,nfl,nhl/teams` | The signed-in user's current-season teams | `api.ts` → `getMyTeams()` |
| `/users;use_login=1/games;game_keys=nba,nfl,nhl/leagues` | League names and sizes for those teams | `api.ts` → `getMyTeams()` |
| `/teams;team_keys=…/standings` | Rank and W-L-T for each team (optional; teams still show if it fails) | `api.ts` → `getStandings()` |
| `/league/{league_key};out=settings,standings` | League settings, scoring categories and full standings | `team.ts` → `getLeague()` |
| `/league/{league_key}/teams/stats` | Every team's season totals, used to rank you per category | `team.ts` → `getSeasonStats()` |
| `/team/{team_key}` | Waiver priority, FAAB, moves, trades, draft grade, managers | `team.ts` → `getTeamDetails()` |
| `/team/{team_key}/matchups;weeks={week}` | This week's opponent (no scores) | `team.ts` → `getThisWeek()` |
| `/team/{team_key}/roster/players/stats` | Roster with injury status and season stats (falls back to `/team/{team_key}/roster`) | `team.ts` → `getRoster()` |
| `/team/{team_key}/draftresults` | The team's draft picks | `team.ts` → `getDraft()` |
| `/league/{league_key}/players;player_keys=…` | Names and positions for drafted players, 25 per request | `team.ts` → `getDraft()` |
| `/league/{league_key}/transactions;types=add,drop,trade;team_key=…` | The team's adds, drops and trades | `team.ts` → `getActivity()` |
| `/league/{league_key}/transactions;types=waiver,pending_trade;team_key=…` | Pending waiver claims and trade offers (only visible to the team) | `team.ts` → `getActivity()` |

Requests go through `yahooGet()` in `client.ts`, which adds the access token and `format=json`. `parse.ts` flattens Yahoo's nested JSON.

**Checking real responses:** Yahoo's docs are incomplete, so in dev you can see the raw JSON for any path at `/api/yahoo/raw?path=/team/{team_key}/roster`. It uses your own session and returns 404 outside `pnpm dev`.

When you show Yahoo data, include the line "Fantasy data provided by Yahoo Fantasy".

## Project layout

```
src/
  app/              Pages and routes (one folder per app)
    api/auth/yahoo/ Yahoo login, callback and logout routes
    api/yahoo/raw/  Dev-only raw Yahoo JSON viewer
    my-teams/       My Teams app (real Yahoo data)
  components/       Shared UI
  lib/
    apps.ts         The list of apps on the home page
    my-teams/       My Teams URLs, tabs and formatting
    fantasy/        Weekly Matchup data and analysis (mock data for now)
    draft/          Draft Prep data (mock data for now)
    yahoo/          Yahoo auth, session and API client
  proxy.ts          Refreshes the Yahoo token
```

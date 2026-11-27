# Fantasy Sports Hub

A hub of fantasy sports tools for your Yahoo leagues. Sign in with Yahoo and the app shows your teams across basketball, football and hockey.

Built with Next.js 16, React 19 and Tailwind CSS 4.

## Apps

| App | Status |
|---|---|
| Weekly Matchup Dashboard | Built, on mock data |
| Draft Prep | Built, on mock data |
| Hall of Fame | Placeholder |
| Trades & Injury Alerts | Placeholder |
| Playoff Odds | Placeholder |
| Trade Analyzer | Placeholder |

Only the Yahoo sign-in and team list on the home page use real Yahoo data so far.

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
| `/users;use_login=1/games;game_keys=nba,nfl,nhl/leagues` | League names for those teams | `api.ts` → `getMyTeams()` |

Requests go through `yahooGet()` in `client.ts`, which adds the access token and `format=json`. `parse.ts` flattens Yahoo's nested JSON.

When you show Yahoo data, include the line "Fantasy data provided by Yahoo Fantasy".

## Project layout

```
src/
  app/              Pages and routes (one folder per app)
    api/auth/yahoo/ Yahoo login, callback and logout routes
  components/       Shared UI
  lib/
    apps.ts         The list of apps on the home page
    fantasy/        Weekly Matchup data and analysis (mock data for now)
    draft/          Draft Prep data (mock data for now)
    yahoo/          Yahoo auth, session and API client
  proxy.ts          Refreshes the Yahoo token
```

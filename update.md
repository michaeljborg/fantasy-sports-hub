# Session update: Weekly Matchup Dashboard

Changes made in this session. All dashboard data is placeholder (fictional players and teams) until the Yahoo scraper exists. Nothing has been committed yet.

## 1. Windows performance (no code changes)

The app felt choppy on Windows compared with the Mac because Chrome was rendering on the CPU: `chrome://gpu` showed compositing and rasterization as "Software only". Turning on hardware acceleration fixed most of it. Some remaining difference is expected from `next dev` overhead and display/GPU differences. A production build (`pnpm build && pnpm start`) is closer to what Vercel will serve.

## 2. Matchup dashboard: tabs and layout

The Weekly Matchup app is now a dashboard with five tabs:

| Tab | Contents |
|---|---|
| **My Team** (hub) | Preview tiles for the other four tabs (matchup score with a 9-category strip, sit/start decision days, top waiver pickup, top trade target). Roster table with season averages and a game-day strip per player. Season profile (see section 3). |
| **Matchup** | Scoreboard (you vs. opponent, category score, day of week). Categories grouped into **Winning / Close / Losing**, each with a bar showing your share. "Flip watch" lists close categories and what it takes to swing them. Games left comparison. |
| **Sit / Start** | Seven-day strip comparing players with games against the 10 starting slots ("Sit 1", "Full", "2 open"). Grid of who plays which day. Decision days, and open-slot days for streaming. |
| **Waiver Wire** | Free agents ranked by fit: helps a close category (x2) plus games left. Stats that help close categories are highlighted. |
| **Trade Targets** | Cards with owner, categories helped (weak ones highlighted), suggested player to give, and a note. |

Shared pieces:
- Compact dashboard header: team name, week, record, league rank and sport switcher.
- Sticky tab bar with badges for the matchup score and the number of sit/start days. Tabs to the right slide content forward and tabs to the left slide it back. The active underline moves between tabs.
- One animated moment: category bars fill in on the Matchup page. No backdrop blur on new UI, for performance.

## 3. Season profile (My Team)

- **Spider chart** of your league rank in each category. 1st is the outer edge, last is the center. The guide rings mark the strong / middle / weak thirds. Hovering a point shows the category and rank.
- **Table beside it** in standard category order (FG%, FT%, 3PM, PTS, REB, AST, STL, BLK, TO). Columns are **Rank, Category, You, League** (league average). Ranks are colored by tier.
- A pie/donut version was tried and removed.

## 4. Multiple teams per sport

- Each team has its own URL: `/weekly-matchup/<team>/<tab>`, for example `/weekly-matchup/swish-army-knife/waivers`.
- `/weekly-matchup` redirects to the default team, so the hub card is unchanged.
- **Team switcher:** a league-name button under the team name opens a menu of your teams in that sport. Switching keeps you on the same tab. If you have only one team in a sport, it shows as plain text.
- **Sport switcher:** each sport links to your first team in it once that sport is available. Hockey and Football are greyed out for now.
- Unknown team URLs show the not-found page. Because of streaming, the HTTP status is 200 rather than 404.
- Two placeholder basketball teams: **Pick and Roll Call** (Office Hoops League, 12 teams) and **Swish Army Knife** (College Friends Dynasty, 10 teams).

**Fix:** the team menu first opened in the top-left corner because CSS anchor positioning didn't resolve in the browser. It's now placed by script directly under the league button, kept inside the screen edges, and follows the button on scroll or resize.

## 5. Data layer (ready for the scraper)

| File | Purpose |
|---|---|
| `src/lib/fantasy/types.ts` | Sport-agnostic shapes: `Category`, `Player`, `Matchup`, `CategoryRank` (with `leagueAvg`), `UserTeam`, `TeamData`, etc. |
| `src/lib/fantasy/sports.ts` | Sport list and the 9 basketball categories (TO is lower-is-better), with a starting-slot count. |
| `src/lib/fantasy/teams.ts` | The user's teams (id, sport, league). Will come from the Yahoo account later. |
| `src/lib/fantasy/mock-basketball.ts` | Placeholder data, one data set per team. |
| `src/lib/fantasy/dashboard.ts` | `getDashboard(teamId)` / `loadDashboard(params)`: the single entry point every page reads from. |
| `src/lib/fantasy/analysis.ts` | Winning / close / losing per category (placeholder fixed margins, to be replaced by projections), score, daily active counts, sit/start calls, `rankTier()` league thirds. |
| `src/lib/fantasy/format.ts` | Stat, gap, ordinal and record formatting. |
| `src/lib/fantasy/sections.ts` | Tab list and team-aware URL helpers. |

## 6. Files

**New components** (`src/components/dashboard/`): `dashboard-header`, `section-tabs`, `team-switcher`, `panel`, `summary-tile`, `category-bar`, `outcome`, `day-strip`, `week-dots`, `roster-table`, `radar-chart`.

**Routes** (`src/app/weekly-matchup/`):
- `page.tsx`: redirects to the default team.
- `[team]/layout.tsx`: header and tabs. Lists the known teams so their pages are built ahead of time.
- `[team]/page.tsx`: My Team.
- `[team]/matchup`, `[team]/sit-start`, `[team]/waivers`, `[team]/trade-targets`.

**Other edits:**
- `src/styles/theme.css`: added the `animate-fill` keyframe.
- `src/components/icons.tsx`: added chevron-down and check icons.

## Next steps

- Remember the last team viewed instead of always opening the default team.
- Replace placeholder close/win margins with projections based on games left.
- Build the Yahoo scraper and swap `mock-basketball.ts` for real data.
- Update the README (it still lists only two apps).

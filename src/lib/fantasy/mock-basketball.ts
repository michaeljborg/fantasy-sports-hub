/**
 * PLACEHOLDER DATA. Fictional players and teams so the UI has something to
 * render. Replace with scraped Yahoo data; keep the shapes from types.ts.
 */
import type {
  CategoryRank,
  FreeAgent,
  Matchup,
  Player,
  TeamData,
  TradeTarget,
  Week,
} from "./types";

const s = (
  fgp: number, ftp: number, tpm: number, pts: number, reb: number,
  ast: number, stl: number, blk: number, to: number,
) => ({ fgp, ftp, tpm, pts, reb, ast, stl, blk, to });

export const week: Week = {
  number: 5,
  label: "Nov 16 – 22",
  days: [
    { short: "Mon", date: "16" },
    { short: "Tue", date: "17" },
    { short: "Wed", date: "18" },
    { short: "Thu", date: "19" },
    { short: "Fri", date: "20" },
    { short: "Sat", date: "21" },
    { short: "Sun", date: "22" },
  ],
  today: 1,
};

export const roster: Player[] = [
  { id: "p1", name: "Jalen Brooks", position: "PG", team: "ATL", status: "healthy", slot: "PG", games: [0, 2, 4, 6], stats: s(0.462, 0.884, 3.1, 24.1, 4.2, 8.9, 1.4, 0.3, 3.4) },
  { id: "p2", name: "Devin Carter", position: "SG", team: "MIA", status: "healthy", slot: "SG", games: [1, 2, 4, 5], stats: s(0.451, 0.861, 2.9, 19.8, 3.9, 4.1, 1.1, 0.4, 2.1) },
  { id: "p3", name: "Malik Ford", position: "PG,SG", team: "LAL", status: "healthy", slot: "G", games: [0, 2, 4, 5], stats: s(0.438, 0.902, 3.4, 17.2, 3.1, 5.6, 1.6, 0.2, 2.4) },
  { id: "p4", name: "Theo Lindqvist", position: "SF", team: "BOS", status: "healthy", slot: "SF", games: [1, 2, 4, 6], stats: s(0.489, 0.812, 2.2, 21.5, 6.8, 3.3, 1.2, 0.6, 2.2) },
  { id: "p5", name: "Isaiah Grant", position: "PF", team: "DEN", status: "healthy", slot: "PF", games: [0, 2, 4], stats: s(0.531, 0.744, 0.8, 16.4, 9.1, 2.4, 0.7, 1.1, 1.8) },
  { id: "p6", name: "Rafael Souza", position: "SF,PF", team: "MIL", status: "healthy", slot: "F", games: [1, 2, 4, 5], stats: s(0.472, 0.795, 1.9, 14.9, 6.2, 2.8, 1.0, 0.5, 1.5) },
  { id: "p7", name: "Kofi Mensah", position: "C", team: "OKC", status: "healthy", slot: "C", games: [0, 2, 4, 6], stats: s(0.584, 0.701, 0.3, 15.7, 11.4, 2.1, 0.8, 2.3, 1.9) },
  { id: "p8", name: "Bram de Vries", position: "C", team: "MIN", status: "dtd", slot: "C", games: [2, 3, 4], stats: s(0.562, 0.688, 0.6, 12.8, 10.2, 1.7, 0.6, 1.6, 1.4) },
  { id: "p9", name: "Jordan Pierce", position: "SG,SF", team: "PHX", status: "healthy", slot: "UTIL", games: [0, 2, 4, 5], stats: s(0.447, 0.871, 2.7, 15.3, 3.6, 2.9, 0.9, 0.3, 1.3) },
  { id: "p10", name: "Nate Albright", position: "PF,C", team: "SAC", status: "healthy", slot: "UTIL", games: [2, 3, 4], stats: s(0.518, 0.776, 1.1, 13.1, 8.0, 1.9, 0.6, 1.2, 1.2) },
  { id: "p11", name: "Eli Navarro", position: "PG", team: "SAS", status: "healthy", slot: "BN", games: [0, 2, 5], stats: s(0.429, 0.851, 1.8, 11.6, 2.8, 6.2, 1.3, 0.1, 2.0) },
  { id: "p12", name: "Marcus Webb", position: "SF", team: "NYK", status: "healthy", slot: "BN", games: [1, 3, 4], stats: s(0.455, 0.809, 1.6, 10.9, 4.4, 1.8, 0.8, 0.4, 0.9) },
  { id: "p13", name: "Trey Holloway", position: "SG", team: "GSW", status: "out", slot: "IL", games: [1, 3, 5], stats: s(0.441, 0.893, 3.0, 18.6, 3.2, 3.1, 1.0, 0.2, 1.7) },
];

export const matchup: Matchup = {
  me: { id: "t1", name: "Pick and Roll Call", manager: "You", record: { w: 7, l: 3, t: 0 }, rank: 2 },
  opponent: { id: "t2", name: "Board Man Gets Paid", manager: "Opponent", record: { w: 6, l: 4, t: 0 }, rank: 4 },
  totals: {
    me: s(0.478, 0.812, 14, 121, 44, 31, 8, 4, 15),
    opponent: s(0.471, 0.846, 10, 112, 51, 24, 7, 7, 14),
  },
  opponentGamesLeft: 31,
};

export const leagueSize = 12;

/** Season rank among the league, 1 = best (for TO, 1 = fewest). */
export const seasonRanks: CategoryRank[] = [
  { key: "fgp", rank: 6, value: 0.474, leagueAvg: 0.471 },
  { key: "ftp", rank: 8, value: 0.809, leagueAvg: 0.816 },
  { key: "tpm", rank: 3, value: 12.4, leagueAvg: 11.1 },
  { key: "pts", rank: 2, value: 118.6, leagueAvg: 112.9 },
  { key: "reb", rank: 9, value: 44.1, leagueAvg: 46.3 },
  { key: "ast", rank: 1, value: 29.8, leagueAvg: 25.7 },
  { key: "stl", rank: 4, value: 8.7, leagueAvg: 8.2 },
  { key: "blk", rank: 11, value: 4.6, leagueAvg: 5.5 },
  { key: "to", rank: 10, value: 15.9, leagueAvg: 14.8 },
];

export const freeAgents: FreeAgent[] = [
  { id: "f1", name: "Tariq Nelson", position: "C", team: "CHA", rostered: 38, games: [1, 2, 4, 5], helps: ["reb", "blk", "fgp"], stats: s(0.571, 0.702, 0.2, 10.4, 9.1, 1.2, 0.5, 1.9, 1.1) },
  { id: "f2", name: "Owen Park", position: "PG", team: "UTA", rostered: 22, games: [2, 4, 5, 6], helps: ["ast", "stl", "tpm"], stats: s(0.432, 0.846, 2.1, 11.8, 2.9, 6.4, 1.5, 0.2, 2.3) },
  { id: "f3", name: "Luis Romero", position: "SF", team: "CHI", rostered: 41, games: [1, 2, 4, 6], helps: ["pts", "tpm", "stl"], stats: s(0.452, 0.828, 2.5, 14.6, 4.1, 2.2, 1.3, 0.4, 1.6) },
  { id: "f4", name: "Andre Mitchell", position: "PF", team: "ORL", rostered: 17, games: [2, 3, 5], helps: ["reb", "fgp"], stats: s(0.548, 0.731, 0.4, 9.2, 7.6, 1.4, 0.6, 0.8, 0.9) },
  { id: "f5", name: "Kenji Watanabe", position: "SG", team: "POR", rostered: 12, games: [1, 3, 4, 6], helps: ["tpm", "ftp"], stats: s(0.441, 0.902, 2.8, 12.1, 2.4, 2.0, 0.7, 0.1, 1.0) },
  { id: "f6", name: "Corey Banks", position: "C", team: "DET", rostered: 29, games: [2, 4, 6], helps: ["blk", "fgp"], stats: s(0.596, 0.655, 0.0, 8.3, 7.9, 0.9, 0.4, 2.1, 0.8) },
];

export const tradeTargets: TradeTarget[] = [
  { id: "x1", name: "Victor Hayes", position: "C", team: "HOU", owner: "Dunk Tank", helps: ["reb", "blk"], give: "Devin Carter", note: "They're last in assists and carry three centers." },
  { id: "x2", name: "Ryan Cole", position: "SF,PF", team: "IND", owner: "Splash Zone", helps: ["ftp", "blk", "reb"], give: "Malik Ford", note: "Their guards are hurt and they need steals." },
  { id: "x3", name: "Dario Kim", position: "PF,C", team: "MEM", owner: "Glass Cleaners", helps: ["reb", "blk", "fgp"], give: "Jordan Pierce", note: "They're punting FG% and chasing threes." },
];

/* ----------------------------------------------------------------------------
   A second basketball team in another league, so the team switcher has
   something to switch to. Same player shapes, different names and numbers.
   ------------------------------------------------------------------------- */

const teamBNames = [
  "Andre Olsen", "Cam Whitfield", "Luca Bianchi", "Darius Cole", "Omar Haddad",
  "Felix Mbeki", "Grant Sully", "Hugo Laurent", "Ike Turner Jr.", "Jace Morrow",
  "Kai Delgado", "Leon Fischer", "Milo Reyes",
];

const teamB: TeamData = {
  roster: roster.map((p, i) => ({ ...p, id: `b-${p.id}`, name: teamBNames[i] })),
  matchup: {
    me: { id: "t7", name: "Swish Army Knife", manager: "You", record: { w: 4, l: 5, t: 1 }, rank: 7 },
    opponent: { id: "t8", name: "Fast Break Fever", manager: "Opponent", record: { w: 8, l: 2, t: 0 }, rank: 1 },
    totals: {
      me: s(0.455, 0.861, 11, 104, 49, 22, 6, 7, 13),
      opponent: s(0.482, 0.79, 13, 118, 47, 26, 9, 5, 16),
    },
    opponentGamesLeft: 36,
  },
  leagueSize: 10,
  seasonRanks: [
    { key: "fgp", rank: 8, value: 0.461, leagueAvg: 0.472 },
    { key: "ftp", rank: 2, value: 0.842, leagueAvg: 0.801 },
    { key: "tpm", rank: 5, value: 11.6, leagueAvg: 11.4 },
    { key: "pts", rank: 7, value: 109.8, leagueAvg: 112.1 },
    { key: "reb", rank: 3, value: 48.7, leagueAvg: 45.9 },
    { key: "ast", rank: 6, value: 25.1, leagueAvg: 25.4 },
    { key: "stl", rank: 9, value: 7.1, leagueAvg: 8.3 },
    { key: "blk", rank: 1, value: 6.9, leagueAvg: 5.3 },
    { key: "to", rank: 4, value: 13.9, leagueAvg: 14.6 },
  ],
  freeAgents: [...freeAgents].reverse().map((fa) => ({ ...fa, id: `b-${fa.id}` })),
  tradeTargets: [
    { id: "y1", name: "Silas Grant", position: "PG", team: "TOR", owner: "Fast Break Fever", helps: ["stl", "ast", "pts"], give: "Omar Haddad", note: "They lead the league but are thin at center." },
    { id: "y2", name: "Rico Vance", position: "SG,SF", team: "DAL", owner: "Bucket List", helps: ["pts", "tpm", "fgp"], give: "Felix Mbeki", note: "They're chasing blocks for a playoff push." },
  ],
};

const teamA: TeamData = { roster, matchup, leagueSize, seasonRanks, freeAgents, tradeTargets };

/** Keyed by UserTeam.id (see teams.ts). */
export const fixtures: Record<string, TeamData> = {
  "pick-and-roll-call": teamA,
  "swish-army-knife": teamB,
};

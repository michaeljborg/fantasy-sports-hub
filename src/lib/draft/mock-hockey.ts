/**
 * PLACEHOLDER DATA. Fictional players and keeper league so the hockey board
 * has something to render. Replace with a real source; keep types.ts shapes.
 */
import type { HockeyGoalie, HockeyPlayer, HockeyPosition, HockeySkater } from "./types";

/** The user's team in the keeper league. */
export const myTeamName = "The Bedardians";
/** How many keepers each team holds. */
export const keepersPerTeam = 3;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

let preRank = 0;

function skater(
  name: string, positions: HockeyPosition[], team: string, rosterStatus: string,
  [gamesPlayed, fantasyPoints, rankCurrent]: [number, number, number],
  [toiPerGame, goals, assists, plusMinus, powerPlayPoints, shotsOnGoal, hits, blocks]:
    [string, number, number, number, number, number, number, number],
): HockeySkater {
  return {
    kind: "skater", id: `${slug(name)}-${positions[0].toLowerCase()}`, name, positions, team, rosterStatus,
    gamesPlayed, fantasyPoints, rankPreSeason: ++preRank, rankCurrent,
    toiPerGame, goals, assists, plusMinus, powerPlayPoints, shotsOnGoal, hits, blocks,
  };
}

function goalie(
  name: string, team: string, rosterStatus: string,
  [gamesPlayed, fantasyPoints, rankCurrent]: [number, number, number],
  [timeOnIce, wins, goalsAgainst, saves, shutouts]: [string, number, number, number, number],
): HockeyGoalie {
  return {
    kind: "goalie", id: `${slug(name)}-g`, name, positions: ["G"], team, rosterStatus,
    gamesPlayed, fantasyPoints, rankPreSeason: ++preRank, rankCurrent,
    timeOnIce, wins, goalsAgainst, saves, shutouts,
  };
}

const FA = "FA";
const FIVE_HOLE = "Five Hole Fanatics";
const ICE_COLD = "Ice Cold Takes";

// In pre-season rank order (shared across skaters and goalies).
export const players: HockeyPlayer[] = [
  skater("Connor Blackwood", ["C"], "EDM", FIVE_HOLE, [82, 1084.2, 2], ["22:41", 49, 88, 18, 52, 301, 41, 29]),
  skater("Nils Lindqvist", ["C", "RW"], "COL", myTeamName, [80, 1062.5, 1], ["21:58", 52, 71, 34, 44, 322, 55, 31]),
  skater("Austin Reidel", ["C"], "TOR", ICE_COLD, [79, 998.7, 4], ["20:47", 58, 41, 12, 33, 344, 62, 40]),
  skater("Kirill Sokolov", ["LW", "RW"], "MIN", FA, [81, 951.3, 3], ["21:12", 44, 62, 21, 37, 287, 38, 25]),
  skater("Cale Morrison", ["D"], "COL", FIVE_HOLE, [82, 942.0, 6], ["25:10", 22, 70, 30, 39, 241, 70, 112]),
  skater("Lukas Brandt", ["C", "LW"], "EDM", FA, [78, 930.8, 5], ["21:30", 45, 55, 9, 40, 260, 58, 44]),
  goalie("Igor Volkov", "NYR", ICE_COLD, [60, 905.4, 7], ["3,512:08", 39, 141, 1712, 6]),
  skater("Jack Dunleavy", ["C"], "NJ", FA, [76, 887.1, 9], ["19:44", 38, 59, 15, 35, 270, 22, 18]),
  skater("Matty Larsen", ["LW"], "TB", myTeamName, [80, 871.6, 8], ["19:20", 41, 47, 6, 28, 255, 66, 30]),
  skater("Quinn Ashby", ["D"], "VAN", FA, [82, 860.9, 10], ["24:31", 17, 66, 25, 36, 218, 81, 140]),
  goalie("Thatcher Holm", "VAN", FA, [58, 842.3, 12], ["3,388:47", 35, 132, 1601, 5]),
  skater("Brady Kowal", ["LW"], "OTT", FA, [79, 830.2, 11], ["20:05", 37, 42, -4, 30, 246, 188, 32]),
  skater("Mikko Aaltonen", ["RW"], "CAR", FIVE_HOLE, [77, 812.4, 15], ["19:02", 39, 40, 14, 25, 268, 44, 21]),
  skater("Elias Norberg", ["C", "RW"], "VAN", FA, [80, 798.0, 14], ["19:37", 34, 51, 19, 31, 230, 35, 47]),
  skater("Adam Hale", ["D"], "NYR", ICE_COLD, [78, 781.9, 13], ["24:02", 15, 60, 22, 34, 190, 30, 98]),
  goalie("Juuso Berg", "NSH", FA, [62, 765.5, 18], ["3,610:15", 31, 158, 1802, 4]),
  skater("Tage Ekholm", ["C", "LW"], "CBJ", FA, [81, 752.6, 16], ["18:48", 31, 44, 3, 22, 234, 92, 41]),
  skater("Roope Laine", ["C"], "DAL", FA, [74, 740.1, 20], ["18:15", 33, 37, 17, 21, 211, 40, 26]),
  skater("Zach Werner", ["D"], "CBJ", myTeamName, [80, 735.8, 17], ["25:44", 19, 52, 8, 29, 247, 51, 105]),
  skater("Jordan Kyle", ["RW", "C"], "STL", FA, [82, 721.3, 19], ["18:30", 33, 35, -6, 19, 248, 30, 22]),
  goalie("Jake Ostrander", "DAL", FIVE_HOLE, [57, 708.7, 21], ["3,301:52", 33, 136, 1520, 3]),
  skater("Brock Bowman", ["RW"], "VAN", FA, [79, 694.5, 24], ["17:22", 35, 30, 12, 20, 222, 46, 19]),
  skater("Evan Boucher", ["D"], "EDM", FA, [82, 683.0, 22], ["23:15", 16, 56, 11, 32, 205, 44, 88]),
  skater("Tom Whitlock", ["RW"], "WSH", FA, [76, 670.4, 25], ["17:45", 26, 28, 9, 14, 176, 231, 36]),
  goalie("Logan Thorne", "WSH", FA, [55, 652.2, 23], ["3,166:31", 32, 128, 1455, 3]),
  skater("Owen Tibbs", ["RW", "LW"], "PHI", FA, [80, 641.9, 27], ["17:10", 28, 25, -2, 13, 251, 79, 23]),
  skater("Jakob Cerny", ["D"], "WSH", FA, [78, 630.6, 26], ["22:19", 18, 32, 4, 17, 210, 69, 101]),
  skater("Logan Corliss", ["C"], "UTA", FA, [80, 618.3, 28], ["18:01", 25, 40, 1, 18, 199, 33, 24]),
  goalie("Dustin Fairweather", "CGY", FA, [60, 602.7, 29], ["3,498:20", 29, 150, 1690, 4]),
  skater("Moritz Seiler", ["D"], "DET", FA, [82, 590.4, 30], ["24:40", 9, 38, -3, 14, 160, 192, 168]),
];

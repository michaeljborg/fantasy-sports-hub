/**
 * The user's teams across sports and leagues. PLACEHOLDER: this list will come
 * from the user's Yahoo account once the scraper exists.
 */
import { sports } from "./sports";
import type { SportId, UserTeam } from "./types";

export const userTeams: UserTeam[] = [
  { id: "pick-and-roll-call", sport: "basketball", league: "Office Hoops League" },
  { id: "swish-army-knife", sport: "basketball", league: "College Friends Dynasty" },
];

export const defaultTeam = userTeams[0];

export function getUserTeam(id: string) {
  return userTeams.find((t) => t.id === id);
}

export function teamsForSport(sport: SportId) {
  return userTeams.filter((t) => t.sport === sport);
}

/** A sport is selectable when it's built and the user has a team in it. */
export function sportOptions() {
  return sports.map((sport) => {
    const first = teamsForSport(sport.id)[0];
    return { ...sport, firstTeamId: sport.available ? first?.id : undefined };
  });
}

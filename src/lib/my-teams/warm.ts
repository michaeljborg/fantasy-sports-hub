import {
  currentWeekOf,
  getActivity,
  getDraft,
  getLeague,
  getRoster,
  getSeasonStats,
  getTeamDetails,
  getThisWeek,
} from "@/lib/yahoo/team";

/**
 * Reads every tab's data for one team (Overview, Roster, Draft, Activity) in
 * parallel, so each result is saved and switching tabs makes no Yahoo calls.
 * Uses the same reads and arguments as the tab pages, so React cache() shares
 * them with whichever tab is rendering in the same request.
 */
export async function warmTeam(teamKey: string, leagueKey: string) {
  // The league comes first: its sport sets when the weekly data is due.
  const league = await getLeague(leagueKey);
  const week = currentWeekOf(league);
  await Promise.allSettled([
    getTeamDetails(teamKey, league.sport),
    getSeasonStats(league, teamKey),
    week ? getThisWeek(teamKey, week, league.sport) : null,
    getRoster(teamKey),
    getDraft(teamKey, leagueKey, league.sport),
    getActivity(teamKey, leagueKey),
  ]);
}

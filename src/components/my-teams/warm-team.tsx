import { db } from "@/lib/db";
import type { TeamParams } from "@/lib/my-teams/load";
import { leagueKeyOf, teamKeyFromSlug } from "@/lib/my-teams/slug";
import { warmTeam } from "@/lib/my-teams/warm";
import { getSession } from "@/lib/yahoo/session";
import { scopeToTeam } from "@/lib/yahoo/snapshots";
import { rethrowNextErrors } from "@/lib/next-errors";

/**
 * Renders nothing. On entering a team (not on tab switches: the layout stays
 * mounted), loads every tab's Yahoo data at once so it's saved in the
 * database. Render it in its own <Suspense fallback={null}> so nothing waits
 * on it. Skipped without a database, since nothing would be saved.
 */
export async function WarmTeam({ params }: { params: TeamParams }) {
  if (!db()) return null;
  const teamKey = teamKeyFromSlug((await params).team);
  // Signed out or a bad link: the header shows the right message, so just stop.
  if (!teamKey || !(await getSession())) return null;

  const leagueKey = leagueKeyOf(teamKey);
  scopeToTeam(teamKey, leagueKey);
  try {
    await warmTeam(teamKey, leagueKey);
  } catch (error) {
    rethrowNextErrors(error);
    // Only getLeague can throw here; the tab pages show that error themselves.
  }
  return null;
}

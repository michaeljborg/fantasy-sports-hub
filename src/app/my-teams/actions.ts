"use server";

import { refresh } from "next/cache";
import { leagueKeyOf, teamKeyFromSlug } from "@/lib/my-teams/slug";
import { getSession } from "@/lib/yahoo/session";
import { clearSnapshots } from "@/lib/yahoo/snapshots";

/**
 * Forgets the saved Yahoo data for one team (its league, details, roster,
 * draft, moves) and your team list, then re-renders the page, which fetches
 * them fresh from Yahoo.
 */
export async function refreshTeam(slug: string) {
  const session = await getSession();
  const teamKey = teamKeyFromSlug(slug);
  if (!session?.guid || !teamKey) return;

  // "" is the team list.
  await clearSnapshots(session.guid, [teamKey, leagueKeyOf(teamKey), ""]);
  refresh();
}

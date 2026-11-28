import { notFound, redirect } from "next/navigation";
import { getMyTeams, type YahooTeam } from "@/lib/yahoo/api";
import { getSession } from "@/lib/yahoo/session";
import { leagueKeyOf, teamKeyFromSlug } from "./slug";

export type TeamParams = Promise<{ team: string }>;

/**
 * Resolves the team in the URL. Signed out -> /my-teams (sign-in prompt);
 * a malformed slug -> not found. Pages call this to get the keys they need;
 * the layout also checks the team is one of the user's own (see loadMyTeam).
 */
export async function teamFromParams(params: TeamParams) {
  const { team: slug } = await params;
  if (!(await getSession())) redirect("/my-teams");
  const teamKey = teamKeyFromSlug(slug);
  if (!teamKey) notFound();
  return { slug, teamKey, leagueKey: leagueKeyOf(teamKey) };
}

export type MyTeamResult =
  | { ok: true; slug: string; team: YahooTeam; teams: YahooTeam[] }
  | { ok: false; slug: string; error: unknown };

/**
 * The team in the URL plus all the user's teams (for the switcher). Only the
 * user's own teams can be opened. Yahoo errors come back as `{ ok: false }`
 * so the caller can show them; redirect/notFound are thrown as usual.
 */
export async function loadMyTeam(params: TeamParams): Promise<MyTeamResult> {
  const { slug, teamKey } = await teamFromParams(params);
  let teams: YahooTeam[];
  try {
    teams = await getMyTeams();
  } catch (error) {
    return { ok: false, slug, error };
  }
  const team = teams.find((t) => t.teamKey === teamKey);
  if (!team) notFound();
  return { ok: true, slug, team, teams };
}

import { notFound } from "next/navigation";
import { leagueKeyOf, teamKeyFromSlug } from "./slug";

export type TeamParams = Promise<{ team: string }>;

/**
 * The team and league keys from the URL; a malformed slug -> not found.
 * Doesn't read the session: the loaders in ./loaders do that, inside their
 * private cache, and report "signed-out" so the page can redirect.
 */
export async function keysFromParams(params: TeamParams) {
  const { team: slug } = await params;
  const teamKey = teamKeyFromSlug(slug);
  if (!teamKey) notFound();
  return { slug, teamKey, leagueKey: leagueKeyOf(teamKey) };
}

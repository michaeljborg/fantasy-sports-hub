/**
 * URL slugs for Yahoo team keys: "466.l.12345.t.3" <-> "466-l-12345-t-3".
 * Dots in a path segment look like file extensions, so swap them for dashes.
 */
const SLUG = /^(\d+)-l-(\d+)-t-(\d+)$/;

export function teamSlug(teamKey: string) {
  return teamKey.replaceAll(".", "-");
}

/** The team key for a slug, or null if the slug isn't a valid team. */
export function teamKeyFromSlug(slug: string) {
  const m = SLUG.exec(slug);
  return m ? `${m[1]}.l.${m[2]}.t.${m[3]}` : null;
}

/** "466.l.12345.t.3" -> "466.l.12345" */
export function leagueKeyOf(teamKey: string) {
  return teamKey.replace(/\.t\.\d+$/, "");
}

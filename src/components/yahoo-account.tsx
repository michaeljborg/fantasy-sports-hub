import Link from "next/link";
import { SignInButton, SPORT_LABEL, SportIcon, TeamLogo, YAHOO_ATTRIBUTION } from "@/components/yahoo-ui";
import { ordinal } from "@/lib/fantasy/format";
import { teamHref } from "@/lib/my-teams/sections";
import { teamSlug } from "@/lib/my-teams/slug";
import { NAV_FORWARD } from "@/lib/navigation";
import { getMyTeams, type YahooTeam } from "@/lib/yahoo/api";
import { YahooAuthError } from "@/lib/yahoo/client";
import { getSession } from "@/lib/yahoo/session";

export function SignOutButton() {
  return (
    <form action="/api/auth/yahoo/logout" method="post">
      <button
        type="submit"
        className="text-sm font-medium text-fg-subtle underline-offset-4 transition-colors hover:text-fg hover:underline"
      >
        Sign out
      </button>
    </form>
  );
}

/**
 * Yahoo sign-in state for the home page. Reads the session cookie, so render
 * it inside <Suspense>: with Cache Components the rest of the page stays
 * prerendered and only this part is rendered per request.
 */
export async function YahooAccount() {
  const session = await getSession();
  if (!session) return <SignInButton />;

  let teams: YahooTeam[];
  try {
    teams = await getMyTeams();
  } catch (error) {
    if (error instanceof YahooAuthError) {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <SignInButton label="Sign in with Yahoo again" />
          <p className="text-sm text-fg-muted">Your Yahoo session expired.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">
          Couldn&apos;t load your Yahoo leagues: {(error as Error).message}
        </p>
        <SignOutButton />
      </div>
    );
  }

  const name = session.name ?? teams.find((t) => t.managerName)?.managerName;

  // Group by sport, keeping the order Yahoo returned them in.
  const bySport = new Map<YahooTeam["sport"], YahooTeam[]>();
  for (const team of teams) bySport.set(team.sport, [...(bySport.get(team.sport) ?? []), team]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="text-sm font-semibold text-fg-muted">Your teams</h2>
        <div className="hidden h-px flex-1 bg-fg/30 sm:block" />
        <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <span className="size-2 rounded-full bg-success" />
          Signed in{name ? ` as ${name}` : " with Yahoo"}
        </p>
        <SignOutButton />
      </div>

      {teams.length === 0 ? (
        <p className="mt-6 text-fg-muted">
          No basketball, football or hockey teams this season on your Yahoo account. Join a
          league on Yahoo and it will show up here.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {[...bySport].map(([sport, sportTeams]) => (
            <section
              key={sport}
              aria-label={SPORT_LABEL[sport]}
              className="grid grid-cols-[2rem_1fr] items-start gap-3 sm:gap-4"
            >
              {/* h-16 = one card's height, so the icon lines up with the first row */}
              <h3 className="flex h-16 items-center justify-center text-fg" title={SPORT_LABEL[sport]}>
                <SportIcon sport={sport} className="size-7" />
                <span className="sr-only">{SPORT_LABEL[sport]}</span>
              </h3>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sportTeams.map((team) => (
                  <li key={team.teamKey}>
                    <TeamCard team={team} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-fg-subtle">{YAHOO_ATTRIBUTION}</p>
    </div>
  );
}

function TeamCard({ team }: { team: YahooTeam }) {
  const record = team.record
    ? `${team.record.w}–${team.record.l}${team.record.t ? `–${team.record.t}` : ""}`
    : undefined;

  return (
    <Link
      href={teamHref(teamSlug(team.teamKey))}
      transitionTypes={NAV_FORWARD}
      title={`Open ${team.teamName} in My Teams`}
      className="flex h-16 items-center gap-3 rounded-xl border border-border bg-surface/70 px-3 shadow-card transition-[translate,border-color] duration-200 ease-out hover:border-border-strong motion-safe:hover:-translate-y-0.5"
    >
      <TeamLogo name={team.teamName} url={team.logoUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{team.teamName}</p>
        <p className="truncate text-sm text-fg-muted">{team.leagueName}</p>
      </div>
      <div className="shrink-0 text-right">
        {team.rank ? (
          <>
            <p className="font-display text-xl leading-none font-bold">{ordinal(team.rank)}</p>
            <p className="mt-1 text-xs text-fg-subtle tabular-nums">
              {record ?? (team.leagueSize ? `of ${team.leagueSize}` : "")}
            </p>
          </>
        ) : (
          <p className="text-xs text-fg-subtle">
            {team.leagueSize ? `${team.leagueSize} teams` : team.season}
          </p>
        )}
      </div>
    </Link>
  );
}

export function YahooAccountSkeleton() {
  return <div className="h-10 w-48 animate-pulse rounded-full bg-surface-muted" />;
}

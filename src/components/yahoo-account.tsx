import { cacheLife } from "next/cache";
import Link from "next/link";
import { SignInButton, SPORT_LABEL, SportIcon, TeamLogo, YAHOO_ATTRIBUTION } from "@/components/yahoo-ui";
import { ordinal } from "@/lib/fantasy/format";
import { teamHref } from "@/lib/my-teams/sections";
import { teamSlug } from "@/lib/my-teams/slug";
import { NAV_FORWARD } from "@/lib/navigation";
import { getMyTeams, type YahooTeam } from "@/lib/yahoo/api";
import { YahooAuthError } from "@/lib/yahoo/client";
import { getSession } from "@/lib/yahoo/session";
import { rethrowNextErrors } from "@/lib/next-errors";

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

type Account =
  | { status: "signed-out" }
  | { status: "expired" }
  | { status: "error"; message: string }
  | { status: "ok"; name?: string; teams: YahooTeam[] };

/**
 * The visitor's sign-in state and team list. `use cache: private` keeps the
 * result in the visitor's browser (never on the server) for 5 minutes, which
 * puts it in the home page's per-session shell: coming back to the home page
 * from an app shows the teams immediately instead of loading them again.
 * Sign-in and sign-out are full page loads, and My Teams' Refresh calls
 * refresh(); all of them clear this browser copy.
 */
async function getAccount(): Promise<Account> {
  "use cache: private";
  cacheLife({ stale: 300 });

  const session = await getSession();
  if (!session) return { status: "signed-out" };
  try {
    const teams = await getMyTeams();
    return { status: "ok", name: session.name ?? teams.find((t) => t.managerName)?.managerName, teams };
  } catch (error) {
    rethrowNextErrors(error);
    if (error instanceof YahooAuthError) return { status: "expired" };
    return { status: "error", message: (error as Error).message };
  }
}

/**
 * Yahoo sign-in state for the home page. Render it inside <Suspense>: the rest
 * of the page is prerendered, and this part comes from the per-session shell
 * (see getAccount) or, on a cold load, streams in behind YahooAccountSkeleton.
 */
export async function YahooAccount() {
  const account = await getAccount();

  if (account.status === "signed-out") return <SignInButton />;
  if (account.status === "expired") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <SignInButton label="Sign in with Yahoo again" />
        <p className="text-sm text-fg-muted">Your Yahoo session expired.</p>
      </div>
    );
  }
  if (account.status === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-danger">Couldn&apos;t load your Yahoo leagues: {account.message}</p>
        <SignOutButton />
      </div>
    );
  }

  const { name, teams } = account;

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
      // Loads the team's page ahead of the click, so opening it is instant.
      prefetch
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

const pulse = "rounded-xl bg-surface-muted motion-safe:animate-pulse";

/**
 * Cold-load placeholder (first visit, or after 5 minutes), built from the same
 * header row and grid as the real block, so the first row of teams lands
 * exactly where the placeholder was.
 */
export function YahooAccountSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your teams">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 className="text-sm font-semibold text-fg-muted">Your teams</h2>
        <div className="hidden h-px flex-1 bg-fg/30 sm:block" />
        <div className={`h-5 w-44 rounded-full ${pulse}`} />
      </div>
      <div className="mt-5 grid grid-cols-[2rem_1fr] items-start gap-3 sm:gap-4">
        <div className="flex h-16 items-center justify-center">
          <div className={`size-7 rounded-full ${pulse}`} />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* One card on phones, two on tablets, three on desktop: one full row of the real grid. */}
          {["", "hidden sm:block", "hidden lg:block"].map((visibility, i) => (
            <li key={i} className={`h-16 ${visibility} ${pulse}`} />
          ))}
        </ul>
      </div>
    </div>
  );
}

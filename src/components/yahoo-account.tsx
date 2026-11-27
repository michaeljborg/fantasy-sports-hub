import { getMyTeams, type YahooTeam } from "@/lib/yahoo/api";
import { YahooAuthError } from "@/lib/yahoo/client";
import { getSession } from "@/lib/yahoo/session";

const SPORT_LABEL: Record<YahooTeam["sport"], string> = {
  basketball: "Basketball",
  football: "Football",
  hockey: "Hockey",
};

function SignInButton({ label = "Sign in with Yahoo" }: { label?: string }) {
  return (
    // A plain <a>: this is a full redirect to Yahoo and must not be prefetched.
    <a
      href="/api/auth/yahoo/login"
      className="group inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition duration-200 ease-out hover:brightness-110 active:scale-95 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
    >
      {label}
      <span
        aria-hidden
        className="transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  );
}

function SignOutButton() {
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <span className="size-2 rounded-full bg-success" />
          Signed in with Yahoo{name ? ` as ${name}` : ""}
        </p>
        <SignOutButton />
      </div>

      {teams.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No current basketball, football or hockey teams found on this Yahoo account.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {teams.map((team) => (
            <li
              key={team.teamKey}
              title={`${team.teamName} · ${team.leagueName}`}
              className="min-w-0 rounded-xl border border-border bg-surface/60 px-3 py-2 backdrop-blur"
            >
              <p className="truncate text-sm font-semibold">{team.teamName}</p>
              <p className="truncate text-xs text-fg-subtle">
                {SPORT_LABEL[team.sport]} · {team.leagueName} · {team.season}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-fg-subtle">Fantasy data provided by Yahoo Fantasy</p>
    </div>
  );
}

export function YahooAccountSkeleton() {
  return <div className="h-10 w-48 animate-pulse rounded-full bg-surface-muted" />;
}

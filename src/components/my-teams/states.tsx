import { SignInButton } from "@/components/yahoo-ui";
import { YahooAuthError } from "@/lib/yahoo/client";

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface/40 px-6 py-10 text-center">
      <h2 className="font-display text-2xl font-bold tracking-tight uppercase">{title}</h2>
      <div className="mx-auto mt-3 flex max-w-md flex-col items-center gap-4 text-fg-muted">{children}</div>
    </div>
  );
}

export function SignInPrompt() {
  return (
    <Box title="Sign in to see your teams">
      <p>My Teams shows the standing, roster, draft and moves for each team on your Yahoo account.</p>
      <SignInButton />
    </Box>
  );
}

/** What to show when a Yahoo read fails: a sign-in button if the session expired, else the error. */
export function LoadError({ error, what }: { error: unknown; what: string }) {
  if (error instanceof YahooAuthError) {
    return (
      <Box title="Yahoo session expired">
        <p>Sign in again to load {what}.</p>
        <SignInButton label="Sign in with Yahoo again" />
      </Box>
    );
  }
  return (
    <Box title={`Couldn't load ${what}`}>
      <p>Yahoo returned an error. Reload the page to try again.</p>
      <p className="text-xs break-all text-fg-subtle">{(error as Error)?.message}</p>
    </Box>
  );
}

export function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box title={title}>
      <p>{children}</p>
    </Box>
  );
}

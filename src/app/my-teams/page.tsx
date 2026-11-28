import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import { Empty, LoadError, SignInPrompt } from "@/components/my-teams/states";
import { PageTransition } from "@/components/page-transition";
import { accentStyle, getApp } from "@/lib/apps";
import { teamHref } from "@/lib/my-teams/sections";
import { teamSlug } from "@/lib/my-teams/slug";
import { getMyTeams, type YahooTeam } from "@/lib/yahoo/api";
import { getSession } from "@/lib/yahoo/session";
import { rethrowNextErrors } from "@/lib/next-errors";

const app = getApp("my-teams");

export const metadata: Metadata = { title: app.name };

// Signed in, this redirects to your first team, so it can't render an instant UI.
export const instant = false;

export default function MyTeamsEntry() {
  return (
    <PageTransition>
      <main
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14"
      >
        <AppHeader app={app} />
        <section className="mt-12">
          <Suspense fallback={<div aria-busy="true" className="min-h-48" />}>
            <OpenFirstTeam />
          </Suspense>
        </section>
      </main>
    </PageTransition>
  );
}

/** Signed out: the sign-in prompt. Signed in: straight to your first team. */
async function OpenFirstTeam() {
  if (!(await getSession())) return <SignInPrompt />;

  let teams: YahooTeam[];
  try {
    teams = await getMyTeams();
  } catch (error) {
    rethrowNextErrors(error);
    return <LoadError error={error} what="your Yahoo teams" />;
  }
  if (!teams.length) {
    return (
      <Empty title="No teams this season">
        Your Yahoo account has no basketball, football or hockey teams this season. Join a league on Yahoo and it
        will show up here.
      </Empty>
    );
  }
  redirect(teamHref(teamSlug(teams[0].teamKey)));
}

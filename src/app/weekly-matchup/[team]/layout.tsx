import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionTabs, SectionTabsView } from "@/components/dashboard/section-tabs";
import { PageTransition } from "@/components/page-transition";
import { accentStyle, getApp } from "@/lib/apps";
import { getDashboard, teamName } from "@/lib/fantasy/dashboard";
import { teamsForSport, userTeams } from "@/lib/fantasy/teams";

const app = getApp("weekly-matchup");

export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.shortName}` },
};

export function generateStaticParams() {
  return userTeams.map((t) => ({ team: t.id }));
}

export default async function TeamLayout({ children, params }: LayoutProps<"/weekly-matchup/[team]">) {
  const { team } = await params;
  const d = getDashboard(team);
  if (!d) notFound();

  const { wins, losses, ties } = d.score;
  const badges = {
    matchup: `${wins}-${losses}-${ties}`,
    "sit-start": d.decisionDays.length ? String(d.decisionDays.length) : undefined,
  };
  const teams = teamsForSport(d.sport).map((t) => ({ id: t.id, league: t.league, name: teamName(t.id) }));

  return (
    <PageTransition>
      <div
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-8"
      >
        <DashboardHeader
          app={app}
          teamId={team}
          team={d.matchup.me}
          teams={teams}
          week={d.week}
          sport={d.sport}
          leagueSize={d.leagueSize}
        />
        <Suspense fallback={<SectionTabsView teamId={team} badges={badges} />}>
          <SectionTabs teamId={team} badges={badges} />
        </Suspense>
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </PageTransition>
  );
}

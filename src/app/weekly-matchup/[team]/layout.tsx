import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SectionTabs, SectionTabsView } from "@/components/dashboard/section-tabs";
import { PageTransition } from "@/components/page-transition";
import { accentStyle, getApp } from "@/lib/apps";
import { getDashboard, teamName } from "@/lib/fantasy/dashboard";
import { sectionHref, sections, type SectionId } from "@/lib/fantasy/sections";
import { teamsForSport, userTeams } from "@/lib/fantasy/teams";

const app = getApp("weekly-matchup");

export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.shortName}` },
};

// The header and team switcher depend on the team in the URL, so entering this
// layout from outside may block. Tab-to-tab navigations stay instant (see loading.tsx).
export const instant = false;

export function generateStaticParams() {
  return userTeams.map((t) => ({ team: t.id }));
}

export default async function TeamLayout({ children, params }: LayoutProps<"/weekly-matchup/[team]">) {
  const { team } = await params;
  const d = getDashboard(team);
  if (!d) notFound();

  const { wins, losses, ties } = d.score;
  const badges: Partial<Record<SectionId, string>> = {
    matchup: `${wins}-${losses}-${ties}`,
    "sit-start": d.decisionDays.length ? String(d.decisionDays.length) : undefined,
  };
  const tabs = sections.map((s) => ({ id: s.id, label: s.label, href: sectionHref(team, s.id), badge: badges[s.id] }));
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
        <Suspense fallback={<SectionTabsView items={tabs} />}>
          <SectionTabs items={tabs} />
        </Suspense>
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </PageTransition>
  );
}

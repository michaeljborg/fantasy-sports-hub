import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DataAge } from "@/components/my-teams/data-age";
import { SeasonStats } from "@/components/my-teams/season-stats";
import { Standings } from "@/components/my-teams/standings";
import { LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { LeagueFacts, TeamStatus } from "@/components/my-teams/team-info";
import { ThisWeekCard } from "@/components/my-teams/this-week-card";
import { keysFromParams, type TeamParams } from "@/lib/my-teams/load";
import { loadOverview } from "@/lib/my-teams/loaders";
import { isPointsLeague } from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Overview" };

// The page itself reads nothing, so switching to this tab shows the skeleton
// immediately while the content below streams in. Links into My Teams use
// prefetch={true}, so the content is usually loaded before the click (see
// src/lib/my-teams/loaders.ts). No slide animation: the content arrives in a
// second update, which would replay it.
export default function OverviewPage({ params }: PageProps<"/my-teams/[team]">) {
  return (
    <Suspense fallback={<TabSkeleton variant="overview" />}>
      {/* Inside the boundary, so it fades in only when the content replaces the skeleton. */}
      <div className="motion-safe:animate-fade-in">
        <Overview params={params} />
      </div>
    </Suspense>
  );
}

async function Overview({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await keysFromParams(params);
  const result = await loadOverview(teamKey, leagueKey);
  if (result.status === "signed-out") redirect("/my-teams");
  if (result.status === "error") return <LoadError problem={result.problem} what="this team" />;
  const { league, details, season, thisWeek } = result.data;

  return (
    <>
      <div className="space-y-6">
        {thisWeek && (
          <ThisWeekCard
            week={thisWeek}
            opponent={league.standings.find((r) => r.teamKey === thisWeek.opponent.teamKey)}
            sport={league.sport}
          />
        )}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <Standings league={league} teamKey={teamKey} />
          </div>
          <div className="space-y-6">
            <TeamStatus details={details} league={league} />
            <LeagueFacts league={league} />
          </div>
        </div>
        {season && <SeasonStats stats={season} points={isPointsLeague(league)} />}
      </div>
      <DataAge slug={slug} fetchedAt={result.fetchedAt} />
    </>
  );
}

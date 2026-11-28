import type { Metadata } from "next";
import { SeasonStats } from "@/components/my-teams/season-stats";
import { Standings } from "@/components/my-teams/standings";
import { LoadError } from "@/components/my-teams/states";
import { LeagueFacts, TeamStatus } from "@/components/my-teams/team-info";
import { ThisWeekCard } from "@/components/my-teams/this-week-card";
import { DataAge } from "@/components/my-teams/data-age";
import { PageTransition } from "@/components/page-transition";
import { teamFromParams } from "@/lib/my-teams/load";
import {
  currentWeekOf,
  getLeague,
  getSeasonStats,
  getTeamDetails,
  getThisWeek,
  isPointsLeague,
} from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Overview" };

async function loadOverview(teamKey: string, leagueKey: string) {
  const league = await getLeague(leagueKey);
  const week = currentWeekOf(league);
  const [details, season, thisWeek] = await Promise.all([
    getTeamDetails(teamKey, league.sport),
    // Optional extras: the page still renders if either is rejected.
    getSeasonStats(league, teamKey).catch(() => null),
    week ? getThisWeek(teamKey, week, league.sport).catch(() => null) : null,
  ]);
  return { league, details, season, thisWeek };
}

export default async function OverviewPage({ params }: PageProps<"/my-teams/[team]">) {
  const { slug, teamKey, leagueKey } = await teamFromParams(params);

  let data: Awaited<ReturnType<typeof loadOverview>>;
  try {
    data = await loadOverview(teamKey, leagueKey);
  } catch (error) {
    return <LoadError error={error} what="this team" />;
  }
  const { league, details, season, thisWeek } = data;

  return (
    <PageTransition>
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
      <DataAge slug={slug} />
    </PageTransition>
  );
}

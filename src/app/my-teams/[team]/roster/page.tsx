import type { Metadata } from "next";
import { RosterList } from "@/components/my-teams/roster-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { PageTransition } from "@/components/page-transition";
import { teamFromParams } from "@/lib/my-teams/load";
import { getLeague, getRoster, isPointsLeague } from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Roster" };

export default async function RosterPage({ params }: PageProps<"/my-teams/[team]/roster">) {
  const { teamKey, leagueKey } = await teamFromParams(params);

  let data;
  try {
    const [league, players] = await Promise.all([getLeague(leagueKey), getRoster(teamKey)]);
    data = { league, players };
  } catch (error) {
    return <LoadError error={error} what="your roster" />;
  }
  const { league, players } = data;

  return (
    <PageTransition>
      {players.length ? (
        <RosterList
          players={players}
          categories={league.categories}
          points={isPointsLeague(league)}
          sport={league.sport}
        />
      ) : (
        <Empty title="No players yet">Your roster fills in after the draft.</Empty>
      )}
    </PageTransition>
  );
}

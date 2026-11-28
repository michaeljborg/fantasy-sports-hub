import type { Metadata } from "next";
import { Suspense } from "react";
import { DataAge } from "@/components/my-teams/data-age";
import { RosterList } from "@/components/my-teams/roster-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { teamFromParams, type TeamParams } from "@/lib/my-teams/load";
import { getLeague, getRoster, isPointsLeague } from "@/lib/yahoo/team";
import { rethrowNextErrors } from "@/lib/next-errors";

export const metadata: Metadata = { title: "Roster" };

// The page itself reads nothing, so switching to this tab shows the skeleton
// immediately while the content below streams in. No slide animation here:
// the content arrives in a second update, which would replay the slide (a shake).
export default function RosterPage({ params }: PageProps<"/my-teams/[team]/roster">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      {/* Inside the boundary, so it fades in only when the content replaces the skeleton. */}
      <div className="motion-safe:animate-fade-in">
        <Roster params={params} />
      </div>
    </Suspense>
  );
}

async function Roster({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await teamFromParams(params);

  let data;
  try {
    const [league, players] = await Promise.all([getLeague(leagueKey), getRoster(teamKey)]);
    data = { league, players };
  } catch (error) {
    rethrowNextErrors(error);
    return <LoadError error={error} what="your roster" />;
  }
  const { league, players } = data;

  return (
    <>
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
      <DataAge slug={slug} />
    </>
  );
}

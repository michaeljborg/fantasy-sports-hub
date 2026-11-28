import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DataAge } from "@/components/my-teams/data-age";
import { RosterList } from "@/components/my-teams/roster-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { keysFromParams, type TeamParams } from "@/lib/my-teams/load";
import { loadRoster } from "@/lib/my-teams/loaders";
import { isPointsLeague } from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Roster" };

// See the Overview page for how loading and prefetching work.
export default function RosterPage({ params }: PageProps<"/my-teams/[team]/roster">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <div className="motion-safe:animate-fade-in">
        <Roster params={params} />
      </div>
    </Suspense>
  );
}

async function Roster({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await keysFromParams(params);
  const result = await loadRoster(teamKey, leagueKey);
  if (result.status === "signed-out") redirect("/my-teams");
  if (result.status === "error") return <LoadError problem={result.problem} what="your roster" />;
  const { league, players } = result.data;

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
      <DataAge slug={slug} fetchedAt={result.fetchedAt} />
    </>
  );
}

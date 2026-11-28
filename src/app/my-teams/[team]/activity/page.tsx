import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ActivityList } from "@/components/my-teams/activity-list";
import { DataAge } from "@/components/my-teams/data-age";
import { LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { keysFromParams, type TeamParams } from "@/lib/my-teams/load";
import { loadActivity } from "@/lib/my-teams/loaders";

export const metadata: Metadata = { title: "Activity" };

// See the Overview page for how loading and prefetching work.
export default function ActivityPage({ params }: PageProps<"/my-teams/[team]/activity">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <div className="motion-safe:animate-fade-in">
        <Activity params={params} />
      </div>
    </Suspense>
  );
}

async function Activity({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await keysFromParams(params);
  const result = await loadActivity(teamKey, leagueKey);
  if (result.status === "signed-out") redirect("/my-teams");
  if (result.status === "error") return <LoadError problem={result.problem} what="your team's moves" />;

  return (
    <>
      <ActivityList pending={result.data.pending} history={result.data.history} teamKey={teamKey} />
      <DataAge slug={slug} fetchedAt={result.fetchedAt} />
    </>
  );
}

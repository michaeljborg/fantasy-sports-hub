import type { Metadata } from "next";
import { Suspense } from "react";
import { ActivityList } from "@/components/my-teams/activity-list";
import { DataAge } from "@/components/my-teams/data-age";
import { LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { teamFromParams, type TeamParams } from "@/lib/my-teams/load";
import { getActivity } from "@/lib/yahoo/team";
import { rethrowNextErrors } from "@/lib/next-errors";

export const metadata: Metadata = { title: "Activity" };

// The page itself reads nothing, so switching to this tab shows the skeleton
// immediately while the content below streams in. No slide animation here:
// the content arrives in a second update, which would replay the slide (a shake).
export default function ActivityPage({ params }: PageProps<"/my-teams/[team]/activity">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      {/* Inside the boundary, so it fades in only when the content replaces the skeleton. */}
      <div className="motion-safe:animate-fade-in">
        <Activity params={params} />
      </div>
    </Suspense>
  );
}

async function Activity({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await teamFromParams(params);

  let activity;
  try {
    activity = await getActivity(teamKey, leagueKey);
  } catch (error) {
    rethrowNextErrors(error);
    return <LoadError error={error} what="your team's moves" />;
  }

  return (
    <>
      <ActivityList pending={activity.pending} history={activity.history} teamKey={teamKey} />
      <DataAge slug={slug} />
    </>
  );
}

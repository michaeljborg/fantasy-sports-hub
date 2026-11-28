import type { Metadata } from "next";
import { ActivityList } from "@/components/my-teams/activity-list";
import { LoadError } from "@/components/my-teams/states";
import { PageTransition } from "@/components/page-transition";
import { teamFromParams } from "@/lib/my-teams/load";
import { getActivity } from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage({ params }: PageProps<"/my-teams/[team]/activity">) {
  const { teamKey, leagueKey } = await teamFromParams(params);

  let activity;
  try {
    activity = await getActivity(teamKey, leagueKey);
  } catch (error) {
    return <LoadError error={error} what="your team's moves" />;
  }

  return (
    <PageTransition>
      <ActivityList pending={activity.pending} history={activity.history} teamKey={teamKey} />
    </PageTransition>
  );
}

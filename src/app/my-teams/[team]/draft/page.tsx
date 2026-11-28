import type { Metadata } from "next";
import { Suspense } from "react";
import { DataAge } from "@/components/my-teams/data-age";
import { DraftList } from "@/components/my-teams/draft-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { ordinal } from "@/lib/fantasy/format";
import { teamFromParams, type TeamParams } from "@/lib/my-teams/load";
import { getDraft, getLeague, getRoster, getTeamDetails } from "@/lib/yahoo/team";
import { fallbackTo, rethrowNextErrors } from "@/lib/next-errors";

export const metadata: Metadata = { title: "Draft" };

// The page itself reads nothing, so switching to this tab shows the skeleton
// immediately while the content below streams in. No slide animation here:
// the content arrives in a second update, which would replay the slide (a shake).
export default function DraftPage({ params }: PageProps<"/my-teams/[team]/draft">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      {/* Inside the boundary, so it fades in only when the content replaces the skeleton. */}
      <div className="motion-safe:animate-fade-in">
        <Draft params={params} />
      </div>
    </Suspense>
  );
}

async function Draft({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await teamFromParams(params);

  let data;
  try {
    // The league comes first: its sport sets when the weekly data is due.
    const league = await getLeague(leagueKey);
    const [details, picks, roster] = await Promise.all([
      getTeamDetails(teamKey, league.sport),
      getDraft(teamKey, leagueKey, league.sport),
      // Only used for the "On roster" markers.
      getRoster(teamKey).catch(fallbackTo([])),
    ]);
    data = { league, details, picks, roster };
  } catch (error) {
    rethrowNextErrors(error);
    return <LoadError error={error} what="your draft" />;
  }
  const { league, details, picks, roster } = data;

  if (!picks.length) {
    return (
      <>
        <Empty title={league.draftStatus === "postdraft" ? "No draft picks" : "Draft hasn't happened yet"}>
          {league.draftStatus === "postdraft"
            ? "Yahoo has no draft picks for this team."
            : "Your picks will show up here after your league drafts."}
        </Empty>
        <DataAge slug={slug} />
      </>
    );
  }

  const summary = [
    details.draftPosition && `Drafted ${ordinal(details.draftPosition)}`,
    details.draftGrade && `grade ${details.draftGrade}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <DraftList
        picks={picks}
        rosterKeys={new Set(roster.map((p) => p.playerKey))}
        auction={league.settings.isAuction}
        summary={summary || undefined}
      />
      <DataAge slug={slug} />
    </>
  );
}

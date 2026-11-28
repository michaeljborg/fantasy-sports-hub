import type { Metadata } from "next";
import { DraftList } from "@/components/my-teams/draft-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { DataAge } from "@/components/my-teams/data-age";
import { PageTransition } from "@/components/page-transition";
import { ordinal } from "@/lib/fantasy/format";
import { teamFromParams } from "@/lib/my-teams/load";
import { getDraft, getLeague, getRoster, getTeamDetails } from "@/lib/yahoo/team";

export const metadata: Metadata = { title: "Draft" };

export default async function DraftPage({ params }: PageProps<"/my-teams/[team]/draft">) {
  const { slug, teamKey, leagueKey } = await teamFromParams(params);

  let data;
  try {
    // The league comes first: its sport sets when the weekly data is due.
    const league = await getLeague(leagueKey);
    const [details, picks, roster] = await Promise.all([
      getTeamDetails(teamKey, league.sport),
      getDraft(teamKey, leagueKey, league.sport),
      // Only used for the "On roster" markers.
      getRoster(teamKey).catch(() => []),
    ]);
    data = { league, details, picks, roster };
  } catch (error) {
    return <LoadError error={error} what="your draft" />;
  }
  const { league, details, picks, roster } = data;

  if (!picks.length) {
    return (
      <PageTransition>
        <Empty title={league.draftStatus === "postdraft" ? "No draft picks" : "Draft hasn't happened yet"}>
          {league.draftStatus === "postdraft"
            ? "Yahoo has no draft picks for this team."
            : "Your picks will show up here after your league drafts."}
        </Empty>
        <DataAge slug={slug} />
      </PageTransition>
    );
  }

  const summary = [
    details.draftPosition && `Drafted ${ordinal(details.draftPosition)}`,
    details.draftGrade && `grade ${details.draftGrade}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <PageTransition>
      <DraftList
        picks={picks}
        rosterKeys={new Set(roster.map((p) => p.playerKey))}
        auction={league.settings.isAuction}
        summary={summary || undefined}
      />
      <DataAge slug={slug} />
    </PageTransition>
  );
}

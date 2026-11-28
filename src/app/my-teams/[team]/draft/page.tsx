import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DataAge } from "@/components/my-teams/data-age";
import { DraftList } from "@/components/my-teams/draft-list";
import { Empty, LoadError } from "@/components/my-teams/states";
import { TabSkeleton } from "@/components/my-teams/tab-skeleton";
import { ordinal } from "@/lib/fantasy/format";
import { keysFromParams, type TeamParams } from "@/lib/my-teams/load";
import { loadDraft } from "@/lib/my-teams/loaders";

export const metadata: Metadata = { title: "Draft" };

// See the Overview page for how loading and prefetching work.
export default function DraftPage({ params }: PageProps<"/my-teams/[team]/draft">) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <div className="motion-safe:animate-fade-in">
        <Draft params={params} />
      </div>
    </Suspense>
  );
}

async function Draft({ params }: { params: TeamParams }) {
  const { slug, teamKey, leagueKey } = await keysFromParams(params);
  const result = await loadDraft(teamKey, leagueKey);
  if (result.status === "signed-out") redirect("/my-teams");
  if (result.status === "error") return <LoadError problem={result.problem} what="your draft" />;
  const { league, details, picks, rosterKeys } = result.data;

  if (!picks.length) {
    return (
      <>
        <Empty title={league.draftStatus === "postdraft" ? "No draft picks" : "Draft hasn't happened yet"}>
          {league.draftStatus === "postdraft"
            ? "Yahoo has no draft picks for this team."
            : "Your picks will show up here after your league drafts."}
        </Empty>
        <DataAge slug={slug} fetchedAt={result.fetchedAt} />
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
        rosterKeys={new Set(rosterKeys)}
        auction={league.settings.isAuction}
        summary={summary || undefined}
      />
      <DataAge slug={slug} fetchedAt={result.fetchedAt} />
    </>
  );
}

import type { Metadata } from "next";
import { MyTeamPanel } from "@/components/draft/my-team-panel";
import { RankingsPanel } from "@/components/draft/rankings-panel";
import { TiersPanel } from "@/components/draft/tiers-panel";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function FootballBoardPage() {
  return (
    <PageTransition>
      <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
        <MyTeamPanel />
        <RankingsPanel />
        <TiersPanel />
      </div>
    </PageTransition>
  );
}

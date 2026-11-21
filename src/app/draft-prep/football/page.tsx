import type { Metadata } from "next";
import { DraftBoard } from "@/components/draft/draft-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function FootballBoardPage() {
  return (
    <PageTransition>
      <DraftBoard />
    </PageTransition>
  );
}

import type { Metadata } from "next";
import { HockeyBoard } from "@/components/draft/hockey-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function HockeyBoardPage() {
  return (
    <PageTransition>
      <HockeyBoard />
    </PageTransition>
  );
}

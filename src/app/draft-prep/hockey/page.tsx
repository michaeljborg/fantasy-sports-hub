import type { Metadata } from "next";
import { SportBoard } from "@/components/draft/sport-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function HockeyBoardPage() {
  return (
    <PageTransition>
      <SportBoard sport="hockey" />
    </PageTransition>
  );
}

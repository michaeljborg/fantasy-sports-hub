import type { Metadata } from "next";
import { KeeperBoard } from "@/components/draft/keeper-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function HockeyBoardPage() {
  return (
    <PageTransition>
      <KeeperBoard sport="hockey" />
    </PageTransition>
  );
}

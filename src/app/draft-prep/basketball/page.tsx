import type { Metadata } from "next";
import { KeeperBoard } from "@/components/draft/keeper-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Board" };

export default function BasketballBoardPage() {
  return (
    <PageTransition>
      <KeeperBoard sport="basketball" />
    </PageTransition>
  );
}

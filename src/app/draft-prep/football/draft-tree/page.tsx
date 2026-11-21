import type { Metadata } from "next";
import { DraftTrees } from "@/components/draft/draft-trees";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Draft Tree" };

export default function FootballDraftTreePage() {
  return (
    <PageTransition>
      <DraftTrees />
    </PageTransition>
  );
}

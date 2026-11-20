import type { Metadata } from "next";
import { SavedTeams } from "@/components/draft/saved-teams";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "My Teams" };

export default function SavedTeamsPage() {
  return (
    <PageTransition>
      <SavedTeams />
    </PageTransition>
  );
}

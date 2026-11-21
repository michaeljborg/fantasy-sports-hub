import type { Metadata } from "next";
import { NotesBoard } from "@/components/draft/notes-board";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "Notes" };

export default function FootballNotesPage() {
  return (
    <PageTransition>
      <NotesBoard />
    </PageTransition>
  );
}

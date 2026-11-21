"use client";

import { Suspense } from "react";
import { SectionTabs, SectionTabsView } from "@/components/dashboard/section-tabs";
import { draftSectionHref, draftSections, type DraftSectionId } from "@/lib/draft/sections";
import { useSportState } from "./draft-state";

/** Draft prep tabs, with live counts as badges. */
export function DraftTabs() {
  const draft = useSportState();
  const counts: Partial<Record<DraftSectionId, number>> = {
    "my-teams": draft.savedTeams.length,
    notes: draft.notes.length,
    "draft-tree": draft.trees.length,
  };
  const items = draftSections.map((s) => ({
    id: s.id,
    label: s.label,
    href: draftSectionHref(draft.sport.id, s.id),
    badge: counts[s.id] ? String(counts[s.id]) : undefined,
  }));
  return (
    <Suspense fallback={<SectionTabsView items={items} />}>
      <SectionTabs items={items} />
    </Suspense>
  );
}

/** One line under the title: the live draft settings. */
export function DraftSummary() {
  const { teams, slot, rounds } = useSportState().config;
  return (
    <>
      {teams} teams, pick {slot}, {rounds} rounds
    </>
  );
}

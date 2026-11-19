"use client";

import { Suspense } from "react";
import { SectionTabs, SectionTabsView } from "@/components/dashboard/section-tabs";
import { draftSectionHref, sectionsFor, type DraftSectionId } from "@/lib/draft/sections";
import type { DraftSportId } from "@/lib/draft/types";
import { useDraft } from "./draft-state";

/** Draft prep tabs, with live counts as badges. */
export function DraftTabs({ sport }: { sport: DraftSportId }) {
  const { football } = useDraft();
  const counts: Partial<Record<DraftSectionId, number>> = {
    "my-teams": football.savedTeams.length,
    notes: football.notes.length,
    "draft-tree": football.trees.length,
  };
  const items = sectionsFor(sport).map((s) => ({
    id: s.id,
    label: s.label,
    href: draftSectionHref(sport, s.id),
    badge: counts[s.id] ? String(counts[s.id]) : undefined,
  }));
  if (items.length < 2) return <div className="mt-8 border-b border-border" />;
  return (
    <Suspense fallback={<SectionTabsView items={items} />}>
      <SectionTabs items={items} />
    </Suspense>
  );
}

/** One line under the title: the live draft settings. */
export function DraftSummary({ sport }: { sport: DraftSportId }) {
  const { football, hockey } = useDraft();
  if (sport === "hockey") return <>{hockey.myTeamName}, {hockey.keepersPerTeam} keepers per team</>;
  const { teams, slot, rounds } = football.config;
  return <>{teams} teams, pick {slot}, {rounds} rounds</>;
}

import { PageTransition } from "@/components/page-transition";
import { accentStyle, getApp } from "@/lib/apps";
import type { DraftSportId } from "@/lib/draft/types";
import { DraftHeader } from "./draft-header";
import { DraftTabs } from "./draft-tabs";

export const draftApp = getApp("draft-prep");

/** Header, tabs and container shared by each sport's layout. */
export function DraftShell({ sport, children }: { sport: DraftSportId; children: React.ReactNode }) {
  return (
    <PageTransition>
      <div style={accentStyle(draftApp)} className="mx-auto w-full max-w-[96rem] flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-8">
        <DraftHeader app={draftApp} sport={sport} />
        <DraftTabs sport={sport} />
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
    </PageTransition>
  );
}

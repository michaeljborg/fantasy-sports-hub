import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { EmptyState } from "@/components/ui/empty-state";
import { accentStyle, getApp } from "@/lib/apps";

const app = getApp("weekly-matchup");

export const metadata: Metadata = {
  title: app.name,
};

export default function WeeklyMatchupHome() {
  return (
    <PageTransition>
      <main
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14"
      >
        <AppHeader app={app} />
        <section className="mt-12">
          <EmptyState
            title="Your matchup hub is warming up"
            description="This week's matchup and category breakdown will show up here."
          />
        </section>
      </main>
    </PageTransition>
  );
}

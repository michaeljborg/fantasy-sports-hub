import type { Metadata } from "next";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { EmptyState } from "@/components/ui/empty-state";
import { accentStyle, getApp } from "@/lib/apps";

const app = getApp("draft-prep");

export const metadata: Metadata = {
  title: app.name,
};

export default function DraftPrepHome() {
  return (
    <PageTransition>
      <main
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-20 sm:px-6 sm:pt-14"
      >
        <AppHeader app={app} />
        <section className="mt-12">
          <EmptyState
            title="Your draft room is being set up"
            description="Rankings and draft strategy will show up here."
          />
        </section>
      </main>
    </PageTransition>
  );
}

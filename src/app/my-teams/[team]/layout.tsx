import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamChrome, TeamChromeSkeleton } from "@/components/my-teams/team-chrome";
import { PageTransition } from "@/components/page-transition";
import { YAHOO_ATTRIBUTION } from "@/components/yahoo-ui";
import { accentStyle, getApp } from "@/lib/apps";

const app = getApp("my-teams");

export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.shortName}` },
};

// Teams come from the visitor's Yahoo session, so they can't be listed with
// generateStaticParams. The header streams in behind <Suspense>; tab-to-tab
// navigations keep it mounted (see loading.tsx).
export const instant = false;

export default function MyTeamLayout({ children, params }: LayoutProps<"/my-teams/[team]">) {
  return (
    <PageTransition>
      <div
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-8"
      >
        <Suspense fallback={<TeamChromeSkeleton />}>
          <TeamChrome params={params} />
        </Suspense>
        <div className="mt-6 sm:mt-8">{children}</div>
        <p className="mt-10 text-xs text-fg-subtle">{YAHOO_ATTRIBUTION}</p>
      </div>
    </PageTransition>
  );
}

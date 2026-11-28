import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BackLink,
  TeamHeader,
  TeamHeaderSkeleton,
  TeamTabs,
  TeamTabsPlaceholder,
} from "@/components/my-teams/team-chrome";
import { WarmTeam } from "@/components/my-teams/warm-team";
import { PageTransition } from "@/components/page-transition";
import { YAHOO_ATTRIBUTION } from "@/components/yahoo-ui";
import { accentStyle, getApp } from "@/lib/apps";

const app = getApp("my-teams");

export const metadata: Metadata = {
  title: { default: app.name, template: `%s · ${app.shortName}` },
};

// Teams come from the visitor's Yahoo session, so they can't be listed with
// generateStaticParams. The header, tabs and each tab's content stream in
// behind same-size placeholders; tab-to-tab navigations keep the header mounted.
export const instant = false;

export default function MyTeamLayout({ children, params }: LayoutProps<"/my-teams/[team]">) {
  return (
    <PageTransition>
      <div
        style={accentStyle(app)}
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-20 sm:px-6 sm:pt-8"
      >
        <BackLink />
        <Suspense fallback={<TeamHeaderSkeleton />}>
          <TeamHeader params={params} />
        </Suspense>
        <Suspense fallback={<TeamTabsPlaceholder />}>
          <TeamTabs params={params} />
        </Suspense>
        {/* Loads all four tabs' data on entering a team; renders nothing. */}
        <Suspense fallback={null}>
          <WarmTeam params={params} />
        </Suspense>
        <div className="mt-6 sm:mt-8">{children}</div>
        <p className="mt-10 text-xs text-fg-subtle">{YAHOO_ATTRIBUTION}</p>
      </div>
    </PageTransition>
  );
}

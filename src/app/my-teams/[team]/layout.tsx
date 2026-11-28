import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BackLink,
  TeamHeader,
  TeamHeaderSkeleton,
  TeamTabs,
  TeamTabsPlaceholder,
} from "@/components/my-teams/team-chrome";
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
// Links into My Teams use prefetch={true}, so pages usually load ahead of the
// click (see src/lib/my-teams/loaders.ts).
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
        <div className="mt-6 sm:mt-8">{children}</div>
        <p className="mt-10 text-xs text-fg-subtle">{YAHOO_ATTRIBUTION}</p>
      </div>
    </PageTransition>
  );
}

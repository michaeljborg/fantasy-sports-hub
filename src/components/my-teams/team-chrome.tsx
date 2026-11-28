import Link from "next/link";
import { Suspense } from "react";
import { SectionTabs, SectionTabsView, type TabItem } from "@/components/dashboard/section-tabs";
import { TeamSwitcher, TeamSwitcherMenu } from "@/components/dashboard/team-switcher";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@/components/icons";
import { SPORT_LABEL, SportIcon, TeamLogo } from "@/components/yahoo-ui";
import { ordinal } from "@/lib/fantasy/format";
import { recordText } from "@/lib/my-teams/format";
import { loadMyTeam, type TeamParams } from "@/lib/my-teams/load";
import { MY_TEAMS_BASE, sectionHref, sections } from "@/lib/my-teams/sections";
import { teamSlug } from "@/lib/my-teams/slug";
import { NAV_BACK } from "@/lib/navigation";
import { LoadError } from "./states";

function BackLink() {
  return (
    <Link
      href="/"
      transitionTypes={NAV_BACK}
      className="group inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-medium text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95"
    >
      <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      All apps
    </Link>
  );
}

/**
 * Team header and tab bar. Reads the session and the URL, so it renders inside
 * <Suspense> in the layout. Stays mounted while switching tabs.
 */
export async function TeamChrome({ params }: { params: TeamParams }) {
  const result = await loadMyTeam(params);
  if (!result.ok) {
    return (
      <>
        <BackLink />
        <div className="mt-6">
          <LoadError error={result.error} what="your Yahoo teams" />
        </div>
      </>
    );
  }

  const { slug, team, teams } = result;
  const options = teams.map((t) => ({ id: teamSlug(t.teamKey), name: t.teamName, league: t.leagueName }));
  const tabs: TabItem[] = sections.map((s) => ({ id: s.id, label: s.label, href: sectionHref(slug, s.id) }));

  return (
    <>
      <header>
        <BackLink />
        <div className="mt-5 flex min-w-0 items-center gap-4">
          <TeamLogo name={team.teamName} url={team.logoUrl} size="lg" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-fg-muted">
              <SportIcon sport={team.sport} className="size-4 text-fg" />
              {SPORT_LABEL[team.sport]}, {team.season} season
            </p>
            <h1 className="mt-0.5 truncate font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
              {team.teamName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
              {options.length > 1 ? (
                <Suspense fallback={<TeamSwitcherMenu current={slug} teams={options} base={MY_TEAMS_BASE} />}>
                  <TeamSwitcher current={slug} teams={options} base={MY_TEAMS_BASE} />
                </Suspense>
              ) : (
                <span>{team.leagueName}</span>
              )}
              {team.record && <span className="font-medium text-fg tabular-nums">{recordText(team.record)}</span>}
              {team.rank && (
                <span>
                  {ordinal(team.rank)}
                  {team.leagueSize ? ` of ${team.leagueSize}` : ""}
                </span>
              )}
              {team.teamUrl && (
                <a
                  href={team.teamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
                >
                  View on Yahoo
                  <ArrowUpRightIcon className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
      <Suspense fallback={<SectionTabsView items={tabs} />}>
        <SectionTabs items={tabs} />
      </Suspense>
    </>
  );
}

export function TeamChromeSkeleton() {
  return (
    <div aria-busy="true">
      <BackLink />
      <div className="mt-5 flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-muted" />
          <div className="h-10 w-72 max-w-[60vw] animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-56 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
      <div className="mt-8 h-12 border-b border-border" />
    </div>
  );
}

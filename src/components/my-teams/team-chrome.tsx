/**
 * The My Teams header and tab bar. Each piece has a placeholder with exactly
 * the same size, so nothing moves when the real content arrives:
 * - BackLink is static.
 * - TeamTabs only needs the URL, so it appears almost at once.
 * - TeamHeader needs your team list (one database read), then fades in.
 * All stay mounted while switching tabs.
 */
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

export function BackLink() {
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

export async function TeamHeader({ params }: { params: TeamParams }) {
  const result = await loadMyTeam(params);
  if (!result.ok) {
    return (
      <div className="mt-6">
        <LoadError error={result.error} what="your Yahoo teams" />
      </div>
    );
  }

  const { slug, team, teams } = result;
  const options = teams.map((t) => ({ id: teamSlug(t.teamKey), name: t.teamName, league: t.leagueName }));

  return (
    <header className="mt-5 flex min-w-0 items-center gap-4 motion-safe:animate-fade-in">
      <TeamLogo name={team.teamName} url={team.logoUrl} size="lg" />
      <div className="min-w-0">
        <p className="flex h-5 items-center gap-1.5 text-sm text-fg-muted">
          <SportIcon sport={team.sport} className="size-4 text-fg" />
          {SPORT_LABEL[team.sport]}, {team.season} season
        </p>
        <h1 className="mt-0.5 truncate font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
          {team.teamName}
        </h1>
        <div className="mt-2 flex min-h-[30px] flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
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
    </header>
  );
}

const pulse = "rounded-md bg-surface-muted motion-safe:animate-pulse";

/** Same box sizes as TeamHeader: 64px logo; 20px, 36px (48px on sm+) and 30px rows. */
export function TeamHeaderSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading team" className="mt-5 flex items-center gap-4">
      <div className={`size-16 shrink-0 rounded-2xl ${pulse}`} />
      <div className="min-w-0">
        <div className="flex h-5 items-center">
          <div className={`h-3.5 w-36 ${pulse}`} />
        </div>
        <div className={`mt-0.5 h-9 w-64 max-w-[55vw] sm:h-12 sm:w-80 ${pulse}`} />
        <div className={`mt-2 h-[30px] w-60 max-w-[55vw] rounded-full ${pulse}`} />
      </div>
    </div>
  );
}

export async function TeamTabs({ params }: { params: TeamParams }) {
  const { team: slug } = await params;
  const tabs: TabItem[] = sections.map((s) => ({ id: s.id, label: s.label, href: sectionHref(slug, s.id) }));
  return (
    <Suspense fallback={<SectionTabsView items={tabs} />}>
      <SectionTabs items={tabs} />
    </Suspense>
  );
}

/** The tab bar before the URL is known: same labels and size, not clickable yet. */
export function TeamTabsPlaceholder() {
  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-16 z-40 -mx-4 mt-8 border-b border-border bg-bg/95 px-4 sm:-mx-6 sm:px-6"
    >
      <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <li key={s.id} className="shrink-0">
            <span className="relative flex items-center gap-2 px-3 py-3.5 text-sm font-medium whitespace-nowrap text-fg-muted">
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}

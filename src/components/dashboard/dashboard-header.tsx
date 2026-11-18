import Link from "next/link";
import { Suspense } from "react";
import { AppIconTile } from "@/components/app-icon-tile";
import { ArrowLeftIcon } from "@/components/icons";
import type { FantasyApp } from "@/lib/apps";
import { formatRecord, ordinal } from "@/lib/fantasy/format";
import { teamHref } from "@/lib/fantasy/sections";
import { sportOptions } from "@/lib/fantasy/teams";
import type { FantasyTeam, SportId, Week } from "@/lib/fantasy/types";
import { cn, NAV_BACK } from "@/lib/navigation";
import { TeamSwitcher, TeamSwitcherMenu, type TeamOption } from "./team-switcher";

/** Compact header for the matchup dashboard: your team, the week, the sport. */
export function DashboardHeader({
  app,
  teamId,
  team,
  teams,
  week,
  sport,
  leagueSize,
}: {
  app: FantasyApp;
  teamId: string;
  team: FantasyTeam;
  /** The user's teams in this sport */
  teams: TeamOption[];
  week: Week;
  sport: SportId;
  leagueSize: number;
}) {
  return (
    <header>
      <Link
        href="/"
        transitionTypes={NAV_BACK}
        className="group inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-medium text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95"
      >
        <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        All apps
      </Link>

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <AppIconTile app={app} size="lg" />
          <div className="min-w-0">
            <p className="text-sm text-fg-muted">
              Week {week.number}, {week.label}
            </p>
            <h1 className="mt-0.5 truncate font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
              {team.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fg-muted">
              {teams.length > 1 ? (
                <Suspense fallback={<TeamSwitcherMenu current={teamId} teams={teams} />}>
                  <TeamSwitcher current={teamId} teams={teams} />
                </Suspense>
              ) : (
                <span>{teams[0]?.league}</span>
              )}
              <span className="font-mono text-fg tabular-nums">{formatRecord(team.record)}</span>
              <span>
                {ordinal(team.rank)} of {leagueSize}
              </span>
            </div>
          </div>
        </div>

        <SportSwitcher current={sport} />
      </div>
    </header>
  );
}

function SportSwitcher({ current }: { current: SportId }) {
  return (
    <nav
      aria-label="Sport"
      className="inline-flex self-start rounded-full border border-border bg-surface p-1 text-sm sm:self-auto"
    >
      {sportOptions().map((sport) => {
        const active = sport.id === current;
        const base = "rounded-full px-3 py-1.5 font-medium";
        if (active) {
          return (
            <span key={sport.id} aria-current="page" className={cn(base, "bg-(--accent) text-bg")}>
              {sport.name}
            </span>
          );
        }
        if (!sport.firstTeamId) {
          return (
            <span key={sport.id} aria-disabled="true" title="Coming soon" className={cn(base, "text-fg-subtle")}>
              {sport.name}
            </span>
          );
        }
        return (
          <Link
            key={sport.id}
            href={teamHref(sport.firstTeamId)}
            className={cn(base, "text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95")}
          >
            {sport.name}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { AppIconTile } from "@/components/app-icon-tile";
import { ArrowLeftIcon } from "@/components/icons";
import type { FantasyApp } from "@/lib/apps";
import { sportHref } from "@/lib/draft/sections";
import { draftSports } from "@/lib/draft/sports";
import type { DraftSportId } from "@/lib/draft/types";
import { cn, NAV_BACK } from "@/lib/navigation";
import { DraftSummary } from "./draft-tabs";

const titles: Record<DraftSportId, string> = {
  football: "Football draft",
  hockey: "Hockey draft",
  basketball: "Basketball draft",
};

/** Compact header for draft prep, matching the matchup dashboard header. */
export function DraftHeader({ app, sport }: { app: FantasyApp; sport: DraftSportId }) {
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
            <p className="text-sm text-fg-muted">{app.shortName}</p>
            <h1 className="mt-0.5 truncate font-display text-4xl leading-none font-extrabold tracking-tight uppercase sm:text-5xl">
              {titles[sport]}
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              <DraftSummary sport={sport} />
            </p>
          </div>
        </div>

        <SportSwitcher current={sport} />
      </div>
    </header>
  );
}

function SportSwitcher({ current }: { current: DraftSportId }) {
  return (
    <nav aria-label="Sport" className="inline-flex self-start rounded-full border border-border bg-surface p-1 text-sm sm:self-auto">
      {draftSports.map((sport) => {
        const base = "rounded-full px-3 py-1.5 font-medium";
        if (sport.id === current) {
          return (
            <span key={sport.id} aria-current="page" className={cn(base, "bg-(--accent) text-bg")}>
              {sport.name}
            </span>
          );
        }
        return (
          <Link
            key={sport.id}
            href={sportHref(sport.id)}
            className={cn(base, "text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95")}
          >
            {sport.name}
          </Link>
        );
      })}
    </nav>
  );
}

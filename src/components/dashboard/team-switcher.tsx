"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef } from "react";

const MENU_WIDTH = 320; // matches w-[min(20rem,...)]
const EDGE = 16;
const GAP = 8;
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { teamHref as matchupTeamHref } from "@/lib/fantasy/sections";
import { cn } from "@/lib/navigation";

export type TeamOption = { id: string; name: string; league: string };

/** Weekly Matchup by default; pass another app's base path (e.g. "/my-teams") to reuse. */
const hrefFor = (base: string | undefined, id: string) =>
  base ? `${base}/${id}` : matchupTeamHref(id);

/** Switches between the user's teams, staying on the same tab. */
export function TeamSwitcher(props: { current: string; teams: TeamOption[]; base?: string }) {
  const pathname = usePathname();
  const tab = pathname.slice(hrefFor(props.base, props.current).length);
  return <TeamSwitcherMenu {...props} tab={tab} />;
}

/** Hook-free version, used as the Suspense fallback (links go to My Team). */
export function TeamSwitcherMenu({
  current,
  teams,
  tab = "",
  base,
}: {
  current: string;
  teams: TeamOption[];
  tab?: string;
  base?: string;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const active = teams.find((t) => t.id === current)!;
  const id = useId();

  // Place the menu just under the button, kept inside the viewport.
  useEffect(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;

    const place = () => {
      const r = button.getBoundingClientRect();
      const width = Math.min(MENU_WIDTH, window.innerWidth - EDGE * 2);
      menu.style.top = `${r.bottom + GAP}px`;
      menu.style.left = `${Math.max(EDGE, Math.min(r.left, window.innerWidth - width - EDGE))}px`;
    };
    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "open") {
        place();
        window.addEventListener("scroll", place, { passive: true, capture: true });
        window.addEventListener("resize", place);
      } else {
        window.removeEventListener("scroll", place, { capture: true });
        window.removeEventListener("resize", place);
      }
    };

    menu.addEventListener("beforetoggle", onBeforeToggle);
    return () => {
      menu.removeEventListener("beforetoggle", onBeforeToggle);
      window.removeEventListener("scroll", place, { capture: true });
      window.removeEventListener("resize", place);
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={id}
        title="Switch team"
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-sm text-fg-muted transition-[color,border-color,scale] duration-150 hover:border-border-strong hover:text-fg active:scale-95"
      >
        {active.league}
        <ChevronDownIcon className="size-3.5" />
      </button>

      <div
        id={id}
        ref={menuRef}
        popover="auto"
        className="fixed inset-auto m-0 w-[min(20rem,calc(100vw-2rem))] origin-top-left rounded-2xl border border-border-strong bg-surface p-2 text-fg opacity-0 shadow-card transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-spring scale-95 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0"
      >
        <p className="px-2 pt-1 pb-2 text-xs text-fg-subtle">Your teams</p>
        <ul className="grid gap-0.5">
          {teams.map((team) => {
            const isCurrent = team.id === current;
            return (
              <li key={team.id}>
                <Link
                  href={hrefFor(base, team.id) + tab}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => menuRef.current?.hidePopover()}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 transition-[background-color,scale] duration-150 active:scale-[0.98]",
                    isCurrent ? "bg-surface-muted" : "hover:bg-surface-muted/70",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{team.name}</span>
                    <span className="block truncate text-xs text-fg-muted">{team.league}</span>
                  </span>
                  {isCurrent && <CheckIcon className="size-4 shrink-0 text-(--accent)" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

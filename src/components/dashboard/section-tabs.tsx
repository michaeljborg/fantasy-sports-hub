"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import { sectionHref, sections, type SectionId } from "@/lib/fantasy/sections";
import { cn, NAV_BACK, NAV_FORWARD } from "@/lib/navigation";

type Props = { teamId: string; badges: Partial<Record<SectionId, string>> };

/**
 * Sticky tab bar. Tabs to the right slide content forward, tabs to the left
 * slide it back, and the active underline morphs between tabs.
 */
export function SectionTabs(props: Props) {
  const pathname = usePathname();
  const current = sections.findIndex((s) => sectionHref(props.teamId, s.id) === pathname);
  return <SectionTabsView {...props} current={current} />;
}

/** Hook-free version, used as the Suspense fallback (no active tab). */
export function SectionTabsView({ teamId, badges, current = -1 }: Props & { current?: number }) {
  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-16 z-40 -mx-4 mt-8 border-b border-border bg-bg/95 px-4 sm:-mx-6 sm:px-6"
    >
      <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section, i) => {
          const active = i === current;
          const badge = badges[section.id];
          return (
            <li key={section.id} className="shrink-0">
              <Link
                href={sectionHref(teamId, section.id)}
                transitionTypes={active || current < 0 ? undefined : i > current ? NAV_FORWARD : NAV_BACK}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-3.5 text-sm font-medium whitespace-nowrap transition-[color,scale] duration-150 active:scale-95",
                  active ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {section.label}
                {badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 font-mono text-[11px] leading-none tabular-nums",
                      active ? "bg-(--accent) text-bg" : "bg-surface-muted text-fg-muted",
                    )}
                  >
                    {badge}
                  </span>
                )}
                {active && (
                  <ViewTransition name="section-tab-indicator" share="morph" default="none">
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-(--accent)" />
                  </ViewTransition>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

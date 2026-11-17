"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { AppIconTile } from "@/components/app-icon-tile";
import { GridIcon } from "@/components/icons";
import { accentStyle, apps } from "@/lib/apps";
import { cn, NAV_FORWARD } from "@/lib/navigation";

const pill =
  "flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-card";

export function HeaderNav() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const current = apps.find((app) => pathname.startsWith(app.href));

  return (
    <nav aria-label="Apps" className="flex items-center gap-2">
      {current && (
        <span
          style={accentStyle(current)}
          className={cn(pill, "hidden text-fg sm:flex")}
        >
          <span className="size-2 rounded-full bg-(--accent)" />
          {current.shortName}
        </span>
      )}

      <button
        type="button"
        popoverTarget="apps-menu"
        className={cn(
          pill,
          "text-fg-muted transition-[color,background-color,scale] duration-150 hover:bg-surface-muted/60 hover:text-fg active:scale-95",
        )}
      >
        <GridIcon className="size-4" />
        Apps
      </button>

      {/* Native popover: light-dismiss + Esc for free; animated via @starting-style */}
      <div
        id="apps-menu"
        ref={menuRef}
        popover="auto"
        className="fixed inset-auto top-[4.5rem] right-[max(1rem,calc((100vw-72rem)/2+1.5rem))] m-0 w-[min(22rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-border-strong bg-surface p-2 text-fg opacity-0 shadow-card transition-[opacity,scale,display,overlay] transition-discrete duration-200 ease-spring scale-95 open:scale-100 open:opacity-100 starting:open:scale-95 starting:open:opacity-0"
      >
        <ul className="grid gap-0.5">
          {apps.map((app) => {
            const active = app === current;
            return (
              <li key={app.id} style={accentStyle(app)}>
                <Link
                  href={app.href}
                  transitionTypes={active ? undefined : NAV_FORWARD}
                  aria-current={active ? "page" : undefined}
                  onClick={() => menuRef.current?.hidePopover()}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2 transition-[background-color,scale] duration-150 active:scale-[0.98]",
                    active ? "bg-surface-muted" : "hover:bg-surface-muted/70",
                  )}
                >
                  <AppIconTile app={app} size="sm" morph={false} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {app.name}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">
                      {app.tagline}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

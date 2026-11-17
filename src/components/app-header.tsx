import Link from "next/link";
import { AppIconTile } from "@/components/app-icon-tile";
import { ArrowLeftIcon } from "@/components/icons";
import type { FantasyApp } from "@/lib/apps";
import { NAV_BACK } from "@/lib/navigation";

/** Hero header at the top of each app's home page. */
export function AppHeader({ app }: { app: FantasyApp }) {
  return (
    <header>
      <Link
        href="/"
        transitionTypes={NAV_BACK}
        className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-sm font-medium text-fg-muted backdrop-blur transition-[color,border-color,scale] duration-200 hover:border-border-strong hover:text-fg active:scale-95"
      >
        <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        All apps
      </Link>

      <div className="mt-8 flex items-center gap-5">
        <AppIconTile app={app} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.18em] text-(--accent) uppercase">
            {app.tagline}
          </p>
          <h1 className="mt-1 font-display text-4xl leading-[0.95] font-extrabold tracking-tight uppercase sm:text-6xl">
            {app.name}
          </h1>
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-lg text-fg-muted">{app.description}</p>
    </header>
  );
}

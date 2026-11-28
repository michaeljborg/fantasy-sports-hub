import Link from "next/link";
import { AppIconTile } from "@/components/app-icon-tile";
import { ArrowUpRightIcon } from "@/components/icons";
import { Chip } from "@/components/ui/chip";
import { accentStyle, type FantasyApp } from "@/lib/apps";
import { NAV_FORWARD } from "@/lib/navigation";

export function AppCard({ app, number }: { app: FantasyApp; number: number }) {
  return (
    <Link
      href={app.href}
      transitionTypes={NAV_FORWARD}
      style={accentStyle(app)}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-fg/30 bg-surface/70 p-6 shadow-card backdrop-blur-sm transition-[translate,scale,border-color] duration-300 ease-spring hover:-translate-y-1 hover:border-(--accent)/40 active:translate-y-0 active:scale-[0.985] active:duration-100 sm:p-8"
    >
      {/* Jersey number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 -bottom-8 font-display text-[9rem] leading-none font-extrabold text-fg/[0.05] transition-transform duration-500 ease-spring select-none group-hover:-translate-y-2"
      >
        {String(number).padStart(2, "0")}
      </span>

      <div className="relative flex items-start justify-between gap-4">
        <AppIconTile app={app} plain />
        {app.status === "ready" ? (
          <span className="grid size-10 place-items-center rounded-full border border-border text-fg-muted transition-[background-color,border-color,color,rotate] duration-300 ease-spring group-hover:rotate-45 group-hover:border-transparent group-hover:bg-(--accent) group-hover:text-bg">
            <ArrowUpRightIcon className="size-4" />
          </span>
        ) : (
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-fg-muted">
            Coming soon
          </span>
        )}
      </div>

      <p className="relative mt-8 text-sm font-semibold text-(--accent)">{app.tagline}</p>
      <h3 className="relative mt-1.5 font-display text-3xl leading-none font-bold tracking-tight uppercase sm:text-4xl">
        {app.name}
      </h3>
      <p className="relative mt-3 max-w-md flex-1 text-fg-muted">{app.description}</p>
      {/* One row only: extra tags are clipped instead of wrapping. */}
      <ul className="relative mt-6 flex gap-2 overflow-hidden whitespace-nowrap">
        {app.tags.map((tag) => (
          <li key={tag}>
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    </Link>
  );
}

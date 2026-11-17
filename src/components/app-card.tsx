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
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface/70 p-6 shadow-card backdrop-blur-sm transition-[translate,scale,border-color,box-shadow] duration-300 ease-spring hover:-translate-y-1 hover:border-(--accent)/40 hover:shadow-[0_24px_60px_-28px_var(--accent)] active:translate-y-0 active:scale-[0.985] active:duration-100 sm:p-8"
    >
      {/* Accent glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-96 bg-[radial-gradient(closest-side,var(--accent),transparent)] opacity-10 transition-opacity duration-500 group-hover:opacity-20"
      />
      {/* Jersey number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 -bottom-8 font-display text-[9rem] leading-none font-extrabold text-fg/[0.05] transition-transform duration-500 ease-spring select-none group-hover:-translate-y-2"
      >
        {String(number).padStart(2, "0")}
      </span>

      <div className="relative flex items-start justify-between">
        <AppIconTile app={app} />
        <span className="grid size-10 place-items-center rounded-full border border-border text-fg-muted transition-[background-color,border-color,color,rotate] duration-300 ease-spring group-hover:rotate-45 group-hover:border-transparent group-hover:bg-(--accent) group-hover:text-bg">
          <ArrowUpRightIcon className="size-4" />
        </span>
      </div>

      <p className="relative mt-8 text-xs font-semibold tracking-[0.18em] text-(--accent) uppercase">
        {app.tagline}
      </p>
      <h3 className="relative mt-2 font-display text-3xl leading-none font-bold tracking-tight uppercase sm:text-4xl">
        {app.name}
      </h3>
      <p className="relative mt-3 max-w-md flex-1 text-fg-muted">
        {app.description}
      </p>
      <ul className="relative mt-6 flex flex-wrap gap-2">
        {app.tags.map((tag) => (
          <li key={tag}>
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    </Link>
  );
}

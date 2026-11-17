import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { NAV_BACK } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-50 border-b border-border bg-bg/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          transitionTypes={NAV_BACK}
          className="flex items-center gap-3 rounded-lg transition-transform duration-150 active:scale-95"
        >
          <span className="grid h-8 -skew-x-12 place-items-center rounded-md bg-brand px-2 shadow-[0_6px_20px_-6px_var(--brand)]">
            <span className="skew-x-12 font-display text-lg leading-none font-extrabold tracking-tight text-brand-fg">
              FSH
            </span>
          </span>
          <span className="hidden font-display text-lg font-bold tracking-wide uppercase sm:block">
            Fantasy Sports Hub
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}

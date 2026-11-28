import Link from "next/link";
import { HeaderNav } from "@/components/header-nav";
import { LogoMark } from "@/components/logo";
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
          className="flex items-center gap-2.5 rounded-lg transition-transform duration-150 active:scale-95"
        >
          <LogoMark className="size-8 shrink-0" />
          <span className="font-display text-lg font-extrabold tracking-wide whitespace-nowrap uppercase">
            Fantasy <span className="text-gradient-brand">Sports Hub</span>
          </span>
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}

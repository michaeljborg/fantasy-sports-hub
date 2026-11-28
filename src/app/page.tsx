import { Suspense } from "react";
import { AppCard } from "@/components/app-card";
import { YahooAccount, YahooAccountSkeleton } from "@/components/yahoo-account";
import { PageTransition } from "@/components/page-transition";
import { apps } from "@/lib/apps";

export default function Home() {
  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 pb-20 sm:px-6 sm:pt-20">
        <section>
          <h1 className="font-display text-4xl leading-[0.88] font-extrabold tracking-tight uppercase motion-safe:animate-rise sm:text-6xl lg:text-7xl">
            Fantasy <span className="text-gradient-brand">Sports Hub</span>
          </h1>
          <div className="mt-8 [animation-delay:200ms] motion-safe:animate-rise">
            <Suspense fallback={<YahooAccountSkeleton />}>
              <YahooAccount />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="apps-heading" className="mt-8">
          <div className="flex items-center gap-4">
            <h2 id="apps-heading" className="text-sm font-semibold text-fg-muted">
              Your apps
            </h2>
            <div className="h-px flex-1 bg-fg/30" />
          </div>
          {/* auto-rows-fr: every card gets the same height, not just cards in the same row */}
          <ul className="mt-6 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
            {apps.map((app, i) => (
              <li
                key={app.id}
                className="motion-safe:animate-rise"
                style={{ animationDelay: `${240 + i * 60}ms` }}
              >
                <AppCard app={app} number={i + 1} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PageTransition>
  );
}

import { Suspense } from "react";
import { AppCard } from "@/components/app-card";
import { YahooAccount, YahooAccountSkeleton } from "@/components/yahoo-account";
import { PageTransition } from "@/components/page-transition";
import { apps } from "@/lib/apps";

export default function Home() {
  return (
    <PageTransition>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-14 pb-20 sm:px-6 sm:pt-24">
        <section className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-fg-muted uppercase backdrop-blur motion-safe:animate-rise">
            <span className="relative flex size-2">
              <span className="absolute inset-0 rounded-full bg-brand opacity-60 motion-safe:animate-ping" />
              <span className="relative size-2 rounded-full bg-brand" />
            </span>
            Fantasy command center
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.88] font-extrabold tracking-tight uppercase [animation-delay:80ms] motion-safe:animate-rise min-[400px]:text-6xl sm:text-8xl">
            Win the week.
            <br />
            <span className="text-gradient-brand">Own the draft.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-fg-muted [animation-delay:160ms] motion-safe:animate-rise">
            Matchups, drafts, trades and league history for your fantasy
            leagues, all in one place.
          </p>
          <div className="mt-8 [animation-delay:200ms] motion-safe:animate-rise">
            <Suspense fallback={<YahooAccountSkeleton />}>
              <YahooAccount />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="apps-heading" className="mt-16 sm:mt-24">
          <div className="flex items-center gap-4">
            <h2
              id="apps-heading"
              className="font-display text-sm font-bold tracking-[0.2em] text-fg-subtle uppercase"
            >
              Your apps
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

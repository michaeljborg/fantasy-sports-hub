import type { Metadata } from "next";
import { Panel } from "@/components/dashboard/panel";
import { PageTransition } from "@/components/page-transition";
import { rankTier } from "@/lib/fantasy/analysis";
import { loadDashboard } from "@/lib/fantasy/dashboard";
import { categoryByKey } from "@/lib/fantasy/sports";
import { cn } from "@/lib/navigation";

export const metadata: Metadata = { title: "Trade Targets" };

export default async function TradeTargetsPage({ params }: PageProps<"/weekly-matchup/[team]/trade-targets">) {
  const d = await loadDashboard(params);
  const weak = d.seasonRanks.filter((r) => rankTier(r.rank, d.leagueSize) === "weak").map((r) => r.key);

  return (
    <PageTransition>
      <Panel
        title="Trade targets"
        description="Players on other teams who shore up your weakest categories, and who those teams might take back."
      >
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {d.tradeTargets.map((t) => (
            <li key={t.id} className="flex flex-col rounded-xl p-4 ring-1 ring-border ring-inset">
              <p className="text-sm text-fg-muted">On {t.owner}</p>
              <p className="mt-1 font-display text-2xl leading-tight font-bold uppercase">{t.name}</p>
              <p className="flex gap-2 text-xs text-fg-subtle">
                <span>{t.position}</span>
                <span>{t.team}</span>
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {t.helps.map((key) => (
                  <li
                    key={key}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                      weak.includes(key) ? "bg-success/12 text-success ring-success/25" : "bg-surface-muted text-fg-muted ring-border",
                    )}
                  >
                    {categoryByKey(d.categories, key).label}
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex-1 text-sm text-fg-muted">{t.note}</p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                <span className="text-fg-muted">You give</span>
                <span className="font-medium">{t.give}</span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </PageTransition>
  );
}

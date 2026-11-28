import { Panel } from "@/components/dashboard/panel";
import { timeText } from "@/lib/my-teams/format";
import { cn } from "@/lib/navigation";
import type { Transaction, TransactionPlayer } from "@/lib/yahoo/team";

const TYPE_LABEL: Record<string, string> = {
  add: "Added",
  drop: "Dropped",
  "add/drop": "Add / drop",
  trade: "Trade",
  waiver: "Waiver claim",
  pending_trade: "Trade offer",
};

function placeText(type?: string, teamName?: string) {
  if (type === "freeagents") return "free agents";
  if (type === "waivers") return "waivers";
  return teamName ?? type ?? "";
}

/** One player's move, from this team's point of view: in (+) or out (−). */
function Move({ player, teamKey }: { player: TransactionPlayer; teamKey: string }) {
  const incoming = player.destinationTeamKey === teamKey;
  const where = incoming
    ? `from ${placeText(player.sourceType, player.sourceTeamName)}`
    : `to ${placeText(player.destinationType, player.destinationTeamName)}`;
  return (
    <li className="flex items-baseline gap-2">
      <span
        aria-label={incoming ? "In" : "Out"}
        className={cn("w-3 shrink-0 text-center font-bold", incoming ? "text-success" : "text-danger")}
      >
        {incoming ? "+" : "−"}
      </span>
      <span className="min-w-0">
        <span className="font-medium">{player.name}</span>
        <span className="text-fg-subtle">
          {" "}
          {[player.proTeam, player.positions].filter(Boolean).join(" ")}
        </span>
        <span className="text-fg-muted"> {where}</span>
      </span>
    </li>
  );
}

function TransactionItem({ t, teamKey }: { t: Transaction; teamKey: string }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr] gap-3 border-t border-border py-3 first:border-t-0 sm:grid-cols-[6rem_1fr]">
      <div>
        <p className="text-sm font-medium tabular-nums">{t.time ? timeText(t.time) : "–"}</p>
        <p className="text-xs text-fg-subtle">{TYPE_LABEL[t.type] ?? t.type}</p>
      </div>
      <div className="min-w-0 text-sm">
        <ul className="space-y-1">
          {t.players.map((p) => (
            <Move key={`${p.playerKey}-${p.action}`} player={p} teamKey={teamKey} />
          ))}
        </ul>
        {t.faabBid !== undefined && <p className="mt-1 text-xs text-fg-subtle">FAAB bid ${t.faabBid}</p>}
      </div>
    </li>
  );
}

export function ActivityList({
  pending,
  history,
  teamKey,
}: {
  pending: Transaction[];
  history: Transaction[];
  teamKey: string;
}) {
  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <Panel title="Pending" description="Waiver claims and trade offers that haven't gone through. Only you can see these.">
          <ul>
            {pending.map((t) => (
              <TransactionItem key={t.key} t={t} teamKey={teamKey} />
            ))}
          </ul>
        </Panel>
      )}
      <Panel title="Moves" description="Adds, drops and trades this season, newest first.">
        {history.length ? (
          <ul>
            {history.map((t) => (
              <TransactionItem key={t.key} t={t} teamKey={teamKey} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">No adds, drops or trades yet this season.</p>
        )}
      </Panel>
    </div>
  );
}

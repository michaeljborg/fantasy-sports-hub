import { BoardPanel } from "./board-panel";
import { MyTeamPanel } from "./my-team-panel";
import { PlayerTable } from "./player-table";
import { SidePanel } from "./side-panel";

/** Draft board for any sport: My Team, the player table, then Tiers/Watchlist. */
export function DraftBoard() {
  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_20rem]">
      <MyTeamPanel />
      <BoardPanel title="Draft Board" flush>
        <PlayerTable mode={{ kind: "board" }} />
      </BoardPanel>
      <SidePanel />
    </div>
  );
}

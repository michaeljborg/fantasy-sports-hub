import { redirect } from "next/navigation";
import { teamHref } from "@/lib/fantasy/sections";
import { defaultTeam } from "@/lib/fantasy/teams";

// A redirect can't render an instant UI, so skip instant-navigation validation here.
export const instant = false;

/** The app entry point opens the user's default team. */
export default function WeeklyMatchupEntry() {
  redirect(teamHref(defaultTeam.id));
}

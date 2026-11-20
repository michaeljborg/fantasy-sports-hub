import { redirect } from "next/navigation";
import { sportHref } from "@/lib/draft/sections";

// A redirect can't render an instant UI, so skip instant-navigation validation here.
export const instant = false;

/** The app entry point opens the football draft. */
export default function DraftPrepEntry() {
  redirect(sportHref("football"));
}

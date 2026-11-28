"use client";

import { useTransition } from "react";
import { refreshTeam } from "@/app/my-teams/actions";

export function RefreshButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => refreshTeam(slug))}
      className="font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline disabled:cursor-wait disabled:no-underline disabled:opacity-60"
    >
      {pending ? "Refreshing…" : "Refresh"}
    </button>
  );
}

import { ViewTransition } from "react";
import { appIcons } from "@/components/icons";
import type { FantasyApp } from "@/lib/apps";
import { cn } from "@/lib/navigation";

const sizes = {
  sm: "size-9 rounded-lg [&_svg]:size-[18px]",
  md: "size-12 rounded-xl [&_svg]:size-6",
  lg: "size-16 rounded-2xl [&_svg]:size-8",
};

/**
 * Accent-colored icon tile. Shares a view-transition name per app so it morphs
 * between the hub card and the app's home page. Pass `morph={false}` for
 * extra copies on the same page (names must be unique per page).
 */
export function AppIconTile({
  app,
  size = "md",
  morph = true,
  plain = false,
}: {
  app: FantasyApp;
  size?: keyof typeof sizes;
  morph?: boolean;
  /** Just the accent-colored icon, without the tinted tile behind it. */
  plain?: boolean;
}) {
  const Icon = appIcons[app.id];
  const tile = (
    <div
      className={cn(
        "grid shrink-0 place-items-center text-(--accent)",
        plain
          ? "[&_svg]:size-8"
          : cn("bg-(--accent)/15 ring-1 ring-(--accent)/30 ring-inset", sizes[size]),
      )}
    >
      <Icon />
    </div>
  );
  if (!morph) return tile;
  return (
    <ViewTransition name={`app-icon-${app.id}`} share="morph" default="none">
      {tile}
    </ViewTransition>
  );
}

import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { NAV_FORWARD } from "@/lib/navigation";

/** Clickable preview of another dashboard section, used on My Team. */
export function SummaryTile({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      transitionTypes={NAV_FORWARD}
      className="group flex h-full flex-col rounded-card border border-border bg-surface p-5 shadow-card transition-[translate,scale,border-color] duration-300 ease-spring hover:-translate-y-0.5 hover:border-(--accent)/40 active:translate-y-0 active:scale-[0.985] active:duration-100"
    >
      <span className="flex items-center justify-between gap-2 text-sm font-medium text-fg-muted">
        {title}
        <ArrowUpRightIcon className="size-4 text-fg-subtle transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--accent)" />
      </span>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
    </Link>
  );
}

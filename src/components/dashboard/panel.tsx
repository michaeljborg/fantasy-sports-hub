import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { cn, NAV_FORWARD } from "@/lib/navigation";

/** Standard content container for dashboard sections. */
export function Panel({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-card border border-border bg-surface p-5 shadow-card sm:p-6", className)}>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-xl leading-tight font-bold tracking-tight uppercase sm:text-2xl">
            {title}
          </h2>
          {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
        </div>
        {action && (
          <Link
            href={action.href}
            transitionTypes={NAV_FORWARD}
            className="group inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-fg-muted transition-[color,scale] duration-150 hover:text-fg active:scale-95"
          >
            {action.label}
            <ArrowUpRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

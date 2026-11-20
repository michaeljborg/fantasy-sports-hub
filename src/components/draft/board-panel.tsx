import { cn } from "@/lib/navigation";

/**
 * Panel for the draft board columns: same look as the dashboard Panel, but
 * with a toolbar row and a body that scrolls inside a fixed height on desktop.
 */
export function BoardPanel({
  title,
  actions,
  toolbar,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card lg:h-[calc(100dvh-15rem)] lg:min-h-[32rem]",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <h2 className="font-display text-xl leading-tight font-bold tracking-tight uppercase sm:text-2xl">{title}</h2>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </header>
      {toolbar && <div className="flex flex-wrap items-center gap-2 px-5 pt-4 sm:px-6">{toolbar}</div>}
      <div className={cn("mt-4 max-h-[70dvh] min-h-0 flex-1 overflow-auto border-t border-border lg:max-h-none", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}

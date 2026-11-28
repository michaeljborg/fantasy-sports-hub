/** Small Yahoo-related UI pieces shared by the home page and My Teams. */
import { BasketballIcon, FootballIcon, HockeyIcon } from "@/components/icons";
import type { SportId } from "@/lib/fantasy/types";
import { cn } from "@/lib/navigation";

export const SPORT_LABEL: Record<SportId, string> = {
  basketball: "Basketball",
  football: "Football",
  hockey: "Hockey",
};

const SPORT_ICON = {
  basketball: BasketballIcon,
  football: FootballIcon,
  hockey: HockeyIcon,
} satisfies Record<SportId, unknown>;

export function SportIcon({ sport, className }: { sport: SportId; className?: string }) {
  const Icon = SPORT_ICON[sport];
  return <Icon className={className} />;
}

export function SignInButton({ label = "Sign in with Yahoo" }: { label?: string }) {
  return (
    // A plain <a>: this is a full redirect to Yahoo and must not be prefetched.
    <a
      href="/api/auth/yahoo/login"
      className="group inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition duration-200 ease-out hover:brightness-110 active:scale-95 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0"
    >
      {label}
      <span
        aria-hidden
        className="transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  );
}

const LOGO_SIZES = {
  sm: { px: 32, className: "size-8 rounded-md text-xs" },
  md: { px: 40, className: "size-10 rounded-lg text-base" },
  lg: { px: 64, className: "size-16 rounded-2xl text-2xl" },
};

/** A Yahoo team logo (or player headshot), with a two-letter fallback. */
export function TeamLogo({
  name,
  url,
  size = "md",
}: {
  name: string;
  url?: string;
  size?: keyof typeof LOGO_SIZES;
}) {
  const { px, className } = LOGO_SIZES[size];
  if (url) {
    return (
      // Yahoo serves images from several CDNs; a plain <img> avoids an image-domain allowlist.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        className={cn("shrink-0 bg-surface-muted object-cover", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center bg-surface-muted font-display font-bold uppercase",
        className,
      )}
    >
      {name.slice(0, 2)}
    </span>
  );
}

export const YAHOO_ATTRIBUTION = "Fantasy data provided by Yahoo Fantasy";

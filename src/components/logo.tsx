import type { SVGProps } from "react";

/**
 * Brand mark: a hub with four connected leagues, on a brand-gradient tile.
 * Decorative; pair it with the "Fantasy Sports Hub" wordmark.
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="fsh-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--brand)" />
          <stop offset="100%" stopColor="var(--accent-primary)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#fsh-logo-bg)" />
      <g stroke="var(--brand-fg)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M16 16 9 9M16 16l7-7M16 16l7 7M16 16l-7 7" />
      </g>
      <g fill="var(--brand-fg)">
        <circle cx="16" cy="16" r="4" />
        <circle cx="9" cy="9" r="2.6" />
        <circle cx="23" cy="9" r="2.6" />
        <circle cx="23" cy="23" r="2.6" />
        <circle cx="9" cy="23" r="2.6" />
      </g>
    </svg>
  );
}

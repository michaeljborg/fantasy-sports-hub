import { unstable_rethrow } from "next/navigation";

/**
 * Rethrows Next.js's own control-flow errors so a `catch` doesn't swallow them:
 * redirect/notFound, and the rejection Next uses to cut off a prefetch render
 * ("During prerendering, fetch() rejects when the prerender is complete").
 * Also checks `sourceError`, where the Neon driver wraps fetch failures.
 * Call it first in any catch around data loading.
 */
export function rethrowNextErrors(error: unknown) {
  unstable_rethrow(error);
  const source = (error as { sourceError?: unknown } | null | undefined)?.sourceError;
  if (source !== undefined) unstable_rethrow(source);
}

/** For optional reads: `promise.catch(fallbackTo(null))` uses the fallback on failure, but lets Next's own errors through. */
export const fallbackTo =
  <T>(value: T) =>
  (error: unknown): T => {
    rethrowNextErrors(error);
    return value;
  };

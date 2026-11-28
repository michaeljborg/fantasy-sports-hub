import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null | undefined;

/**
 * The Neon SQL client, or null when DATABASE_URL isn't set. Without a
 * database the app still works: Yahoo is called live on every visit.
 */
export function db() {
  if (client === undefined) {
    const url = process.env.DATABASE_URL;
    client = url ? neon(url) : null;
  }
  return client;
}

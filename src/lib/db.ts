import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | undefined;
let clientUrl: string | undefined;

/**
 * The Neon SQL client, or null when DATABASE_URL isn't set. Without a
 * database the app still works: Yahoo is called live on every visit.
 * Reads the env each time, so adding the URL while `next dev` is running
 * (which reloads .env.local) takes effect without a restart.
 */
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (url !== clientUrl) {
    client = neon(url);
    clientUrl = url;
  }
  return client!;
}

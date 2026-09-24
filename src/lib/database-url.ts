/**
 * Single place that resolves the server-side Postgres connection string.
 *
 * `DATABASE_URL` stays the primary contract (a self-managed Neon/Postgres
 * instance). Netlify's managed Postgres injects its own variables instead, so
 * those are accepted as a fallback — that way the deployed app works whether
 * the connection string is set by hand or provisioned by the platform.
 *
 * Server-only: the browser bundle must never import this.
 */
const CANDIDATES = [
  "DATABASE_URL",
  "NETLIFY_DB_URL",
  "NETLIFY_DATABASE_URL",
  "NETLIFY_DATABASE_URL_UNPOOLED",
] as const;

/** Resolve the connection string, treating empty/whitespace as unset. */
export function resolveDatabaseUrl(): string | undefined {
  if (typeof process === "undefined") return undefined;
  for (const key of CANDIDATES) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** True when any Postgres connection string is configured. */
export function databaseConfigured(): boolean {
  return Boolean(resolveDatabaseUrl());
}

/** Human-readable list of the accepted variables, for error messages. */
export const DATABASE_URL_VARS = CANDIDATES.join(" or ");

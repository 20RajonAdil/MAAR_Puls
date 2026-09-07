import 'server-only';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Server-only Postgres access via Neon's serverless driver, for anything
 * that needs to outlive one device — subscriptions, watch history,
 * saved videos — keyed by the signed-in user's Google account id.
 *
 * When you connect a Postgres database to this project from the Vercel
 * Storage tab (Neon-backed, the "Vercel Postgres" of today), Vercel
 * injects DATABASE_URL for you automatically — nothing to copy/paste by
 * hand in production. POSTGRES_URL is accepted too as a fallback, since
 * some older integrations/templates still use that name. For local dev,
 * see README "Cloud sync".
 */

function getConnectionString(): string | undefined {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
}

/** True once a connection string is present. Lets callers fail soft instead of throwing. */
export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

let sqlClient: NeonQueryFunction<false, false> | null = null;

/** Lazily creates the Neon client. Only call after isDbConfigured() has been checked. */
function getSql(): NeonQueryFunction<false, false> {
  if (!sqlClient) {
    const connectionString = getConnectionString();
    if (!connectionString) {
      throw new Error('Database not configured — set DATABASE_URL (see README "Cloud sync").');
    }
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

let tablesReady: Promise<void> | null = null;

/** Creates the two tables on first use if they don't already exist. Safe to call on every request — cheap no-op once tablesReady resolves. */
export function ensureTables(): Promise<void> {
  if (!tablesReady) {
    tablesReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          user_id TEXT NOT NULL,
          channel_id TEXT NOT NULL,
          channel JSONB NOT NULL,
          subscribed_at BIGINT NOT NULL,
          PRIMARY KEY (user_id, channel_id)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS video_list_items (
          user_id TEXT NOT NULL,
          list TEXT NOT NULL CHECK (list IN ('history', 'saved')),
          video_id TEXT NOT NULL,
          video JSONB NOT NULL,
          added_at BIGINT NOT NULL,
          PRIMARY KEY (user_id, list, video_id)
        )
      `;
    })();
  }
  return tablesReady;
}

export { getSql as sql };

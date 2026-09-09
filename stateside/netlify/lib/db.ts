/**
 * Database access. Two modes, chosen at runtime:
 *
 *  - Netlify Database (NETLIFY_DB_URL present): hosted Postgres via
 *    @netlify/database. Migrations are applied by the deploy.
 *  - Any other Postgres (DATABASE_URL present): a plain `pg` pool. This is how
 *    local development works: `npm run dev` starts an embedded PGlite server
 *    (scripts/dev.mjs), applies the migrations, and serves it on localhost.
 *
 * Both expose the same tiny interface so application code never cares.
 * `netlify dev` runs every invocation in a fresh worker thread, so nothing
 * here can be cached across requests locally; production functions do reuse
 * the module between warm invocations, and the pool is cached for that case.
 */
import { env } from "./env";

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface Queryable {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
}

interface PgLike {
  query(text: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
}
interface PoolLike extends PgLike {
  connect(): Promise<PgLike & { release(): void }>;
}

let instance: Promise<Database> | null = null;

export function db(): Promise<Database> {
  if (!instance) instance = create();
  return instance;
}

async function create(): Promise<Database> {
  if (env("NETLIFY_DB_URL")) {
    const { getDatabase } = await import("@netlify/database");
    return fromPool(getDatabase().pool as unknown as PoolLike);
  }
  const url = env("DATABASE_URL");
  if (!url) {
    throw new Error("No database configured. Locally, start the app with `npm run dev` or `netlify dev` (which starts the embedded database), or set DATABASE_URL.");
  }
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString: url, max: 2, idleTimeoutMillis: 5_000 });
  return fromPool(pool as unknown as PoolLike);
}

function wrap(runner: PgLike): Queryable {
  return {
    async query<T>(text: string, params: unknown[] = []) {
      const r = await runner.query(text, params);
      return { rows: r.rows as T[], rowCount: r.rowCount ?? r.rows.length };
    },
  };
}

function fromPool(pool: PoolLike): Database {
  return {
    ...wrap(pool),
    async transaction(fn) {
      const conn = await pool.connect();
      try {
        await conn.query("BEGIN");
        const out = await fn(wrap(conn));
        await conn.query("COMMIT");
        return out;
      } catch (e) {
        await conn.query("ROLLBACK").catch(() => undefined);
        throw e;
      } finally {
        conn.release();
      }
    },
  };
}

/** Convenience: first row or null. */
export async function one<T>(q: Queryable, text: string, params: unknown[] = []): Promise<T | null> {
  const r = await q.query<T>(text, params);
  return r.rows[0] ?? null;
}

/**
 * Database access. Two modes, chosen at runtime:
 *
 *  - Netlify Database (NETLIFY_DB_URL present): hosted Postgres via
 *    @netlify/database. Migrations are applied by the deploy.
 *  - Local development (no NETLIFY_DB_URL): embedded Postgres via PGlite,
 *    persisted under STATESIDE_DATA_DIR (default `.data`). Migrations from
 *    netlify/database/migrations are applied on first use.
 *
 * Both expose the same tiny interface so application code never cares.
 */
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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

// Cached on globalThis so a dev-server rebundle reuses the open connection
// instead of opening a second embedded database on the same directory.
const g = globalThis as { __statesideDb?: Promise<Database> };

export function db(): Promise<Database> {
  if (!g.__statesideDb) g.__statesideDb = create();
  return g.__statesideDb;
}

async function create(): Promise<Database> {
  if (env("NETLIFY_DB_URL")) return netlifyDatabase();
  return pgliteDatabase();
}

async function netlifyDatabase(): Promise<Database> {
  const { getDatabase } = await import("@netlify/database");
  const client = getDatabase();
  const wrap = (runner: { query(text: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }> }): Queryable => ({
    async query<T>(text: string, params: unknown[] = []) {
      const r = await runner.query(text, params);
      return { rows: r.rows as T[], rowCount: r.rowCount ?? r.rows.length };
    },
  });
  const pool = client.pool as unknown as {
    query(text: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>;
    connect(): Promise<{ query(text: string, params?: unknown[]): Promise<{ rows: unknown[]; rowCount: number | null }>; release(): void }>;
  };
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

function migrationsDir(): string {
  // Works both from source (netlify/lib/db.ts) and from the esbuild bundle,
  // where import.meta.url points somewhere under .netlify/. Try both.
  const candidates = [
    resolve(process.cwd(), "netlify/database/migrations"),
    resolve(process.cwd(), "stateside/netlify/database/migrations"),
    resolve(dirname(fileURLToPath(import.meta.url)), "../database/migrations"),
  ];
  for (const c of candidates) {
    try {
      readdirSync(c);
      return c;
    } catch {
      // try next
    }
  }
  throw new Error(`Cannot locate migrations directory. Tried: ${candidates.join(", ")}`);
}

async function pgliteDatabase(): Promise<Database> {
  const { PGlite } = await import("@electric-sql/pglite");
  const dataDir = resolve(process.cwd(), env("STATESIDE_DATA_DIR") ?? ".data", "pglite");
  mkdirSync(dataDir, { recursive: true });
  const pg = await PGlite.create(dataDir);
  const q: Queryable = {
    async query<T>(text: string, params: unknown[] = []) {
      const r = await pg.query<T>(text, params as never[]);
      return { rows: r.rows, rowCount: r.affectedRows ?? r.rows.length };
    },
  };
  // Migration files contain many statements; `exec` runs them as a script.
  await applyLocalMigrations(q, (sql) => pg.exec(sql).then(() => undefined));
  let chain: Promise<unknown> = Promise.resolve();
  return {
    ...q,
    // PGlite is single-connection; serialize transactions so they cannot interleave.
    transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
      const run = chain.then(async () => {
        await q.query("BEGIN");
        try {
          const out = await fn(q);
          await q.query("COMMIT");
          return out;
        } catch (e) {
          await q.query("ROLLBACK").catch(() => undefined);
          throw e;
        }
      });
      chain = run.catch(() => undefined);
      return run;
    },
  };
}

async function applyLocalMigrations(q: Queryable, execScript: (sql: string) => Promise<void>): Promise<void> {
  await q.query(`CREATE TABLE IF NOT EXISTS _stateside_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = new Set((await q.query<{ name: string }>(`SELECT name FROM _stateside_migrations`)).rows.map((r) => r.name));
  const dir = migrationsDir();
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(dir, file), "utf8");
    await execScript(sql);
    await q.query(`INSERT INTO _stateside_migrations (name) VALUES ($1)`, [file]);
    console.log(`[stateside] applied local migration ${file}`);
  }
}

/** Convenience: first row or null. */
export async function one<T>(q: Queryable, text: string, params: unknown[] = []): Promise<T | null> {
  const r = await q.query<T>(text, params);
  return r.rows[0] ?? null;
}

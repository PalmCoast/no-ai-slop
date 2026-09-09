#!/usr/bin/env node
/**
 * Local development entry point (`npm run dev`, also what `netlify dev` runs).
 *
 * 1. Starts an embedded Postgres (PGlite) and serves it over the Postgres wire
 *    protocol on 127.0.0.1:$STATESIDE_DB_PORT (default 54329), persisting data
 *    under $STATESIDE_DATA_DIR (default .data).
 * 2. Applies any pending migrations from netlify/database/migrations.
 * 3. Starts Vite. Netlify Functions reach the database through DATABASE_URL
 *    (see .env.example), exactly as they would reach any Postgres.
 *
 * Production never runs this: Netlify Database is used there via NETLIFY_DB_URL.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.STATESIDE_DB_PORT ?? 54329);
const dataDir = resolve(root, process.env.STATESIDE_DATA_DIR ?? ".data", "pglite");
const migrationsDir = join(root, "netlify", "database", "migrations");
const dbOnly = process.argv.includes("--db-only");

mkdirSync(dataDir, { recursive: true });
const pg = await PGlite.create(dataDir);
await applyMigrations(pg);

// PGlite is single-connection; pglite-socket multiplexes clients onto it and
// queues queries. `netlify dev` opens a fresh connection per invocation, so
// allow plenty of them and reap idle ones.
const server = new PGLiteSocketServer({ db: pg, port, host: "127.0.0.1", maxConnections: 64, idleTimeout: 30_000 });
await server.start();
console.log(`[stateside] embedded Postgres ready at postgres://postgres:postgres@127.0.0.1:${port}/postgres (data: ${dataDir})`);

let vite = null;
if (!dbOnly) {
  const bin = process.platform === "win32" ? "vite.cmd" : "vite";
  vite = spawn(join(root, "node_modules", ".bin", bin), process.argv.slice(2), { stdio: "inherit", cwd: root, env: process.env });
  vite.on("exit", (code) => void shutdown(code ?? 0));
}

for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => void shutdown(0));

async function shutdown(code) {
  if (vite && vite.exitCode === null) vite.kill();
  await server.stop().catch(() => undefined);
  await pg.close().catch(() => undefined);
  process.exit(code);
}

async function applyMigrations(db) {
  await db.exec(`CREATE TABLE IF NOT EXISTS _stateside_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`);
  const applied = new Set((await db.query(`SELECT name FROM _stateside_migrations`)).rows.map((r) => r.name));
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
    await db.query(`INSERT INTO _stateside_migrations (name) VALUES ($1)`, [file]);
    console.log(`[stateside] applied migration ${file}`);
  }
}

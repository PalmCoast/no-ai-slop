/**
 * Storage adapter: Netlify Blobs in production, plain files during local
 * development (or whenever Blobs is unavailable).
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { getStore } from "@netlify/blobs";
import { env, isLocalDev, projectRoot } from "./env";

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  /** Where data lives, for logging and the README. */
  readonly kind: "blobs" | "file";
}

export class FileStore implements KeyValueStore {
  readonly kind = "file" as const;
  constructor(
    private readonly root: string,
    private readonly mapKey: (key: string) => string = (k) => k,
  ) {}

  private pathFor(key: string): string {
    const safe = this.mapKey(key).replace(/\.\.+/g, ".").replace(/[^A-Za-z0-9._\-/]/g, "_");
    return path.join(this.root, safe);
  }

  async get(key: string): Promise<string | null> {
    try {
      return await fs.readFile(this.pathFor(key), "utf8");
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async set(key: string, value: string): Promise<void> {
    const p = this.pathFor(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    const tmp = `${p}.${process.pid}.tmp`;
    await fs.writeFile(tmp, value, "utf8");
    await fs.rename(tmp, p);
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.pathFor(key), { force: true });
  }

  async list(prefix = ""): Promise<string[]> {
    const out: string[] = [];
    const walk = async (dir: string, rel: string): Promise<void> => {
      let entries: import("node:fs").Dirent[];
      try {
        entries = await fs.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const e of entries) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) await walk(path.join(dir, e.name), r);
        else if (!e.name.endsWith(".tmp") && e.name !== ".gitkeep") out.push(r);
      }
    };
    await walk(this.root, "");
    return out.filter((k) => k.startsWith(prefix)).sort();
  }
}

class BlobStore implements KeyValueStore {
  readonly kind = "blobs" as const;
  private readonly store: ReturnType<typeof getStore>;
  constructor(name: string) {
    this.store = getStore({ name, consistency: "strong" });
  }
  async get(key: string): Promise<string | null> {
    const v = await this.store.get(key);
    return v === null || v === undefined ? null : String(v);
  }
  async set(key: string, value: string): Promise<void> {
    await this.store.set(key, value);
  }
  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }
  async list(prefix = ""): Promise<string[]> {
    const { blobs } = await this.store.list({ prefix });
    return blobs.map((b) => b.key).sort();
  }
}

export type StoreName = "memory" | "personas" | "licenses";

const cache = new Map<string, KeyValueStore>();

/**
 * Local file layout:
 *   memory   → <project>/memory/<licenseKey>.jsonl and MEMORY-<licenseKey>.md
 *   others   → <project>/.netlify/sonaris-store/<store>/<key>
 */
function fileStoreFor(name: StoreName): FileStore {
  const root = projectRoot();
  if (name === "memory") {
    return new FileStore(path.join(root, "memory"), (key) => key.replace(/^journal\//, ""));
  }
  return new FileStore(path.join(root, ".netlify", "sonaris-store", name));
}

export function openStore(name: StoreName): KeyValueStore {
  const cached = cache.get(name);
  if (cached) return cached;
  let store: KeyValueStore;
  if (isLocalDev() || env("SONARIS_FORCE_FILE_STORE") === "true") {
    store = fileStoreFor(name);
  } else {
    try {
      store = new BlobStore(name);
    } catch {
      // "The environment has not been configured to use Netlify Blobs" — fall
      // back to files so the functions keep working in odd local setups.
      store = fileStoreFor(name);
    }
  }
  cache.set(name, store);
  return store;
}

/** Test hook. */
export function resetStores(): void {
  cache.clear();
}

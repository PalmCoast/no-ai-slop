/**
 * Object storage for clip files: Netlify Blobs in production, files during
 * local development (or whenever Blobs is unavailable), memory in tests.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getStore } from "@netlify/blobs";

export interface BinaryStore {
  readonly kind: "blobs" | "file" | "memory";
  getJSON<T>(key: string): Promise<T | null>;
  setJSON(key: string, value: unknown): Promise<void>;
  getBytes(key: string): Promise<Uint8Array | null>;
  setBytes(key: string, data: Uint8Array, contentType: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

function safeKey(key: string): string {
  return key.replace(/\.\.+/g, ".").replace(/[^A-Za-z0-9._\-/]/g, "_");
}

export class MemoryStore implements BinaryStore {
  readonly kind = "memory" as const;
  private readonly json = new Map<string, unknown>();
  private readonly bytes = new Map<string, Uint8Array>();

  async getJSON<T>(key: string): Promise<T | null> {
    const v = this.json.get(key);
    return v === undefined ? null : (structuredClone(v) as T);
  }
  async setJSON(key: string, value: unknown): Promise<void> {
    this.json.set(key, structuredClone(value));
  }
  async getBytes(key: string): Promise<Uint8Array | null> {
    const v = this.bytes.get(key);
    return v ? new Uint8Array(v) : null;
  }
  async setBytes(key: string, data: Uint8Array): Promise<void> {
    this.bytes.set(key, new Uint8Array(data));
  }
  async delete(key: string): Promise<void> {
    this.json.delete(key);
    this.bytes.delete(key);
  }
  async list(prefix = ""): Promise<string[]> {
    const keys = new Set([...this.json.keys(), ...this.bytes.keys()]);
    return [...keys].filter((k) => k.startsWith(prefix)).sort();
  }
}

export class FileStore implements BinaryStore {
  readonly kind = "file" as const;
  constructor(private readonly root: string) {}

  private pathFor(key: string): string {
    return path.join(this.root, safeKey(key));
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const text = await fs.readFile(`${this.pathFor(key)}.json`, "utf8");
      return JSON.parse(text) as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async setJSON(key: string, value: unknown): Promise<void> {
    const p = `${this.pathFor(key)}.json`;
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(value), "utf8");
  }

  async getBytes(key: string): Promise<Uint8Array | null> {
    try {
      const buf = await fs.readFile(this.pathFor(key));
      return new Uint8Array(buf);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async setBytes(key: string, data: Uint8Array): Promise<void> {
    const p = this.pathFor(key);
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, data);
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.pathFor(key), { force: true });
    await fs.rm(`${this.pathFor(key)}.json`, { force: true });
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
        else if (e.name.endsWith(".json")) out.push(r.slice(0, -5));
        else out.push(r);
      }
    };
    await walk(this.root, "");
    return [...new Set(out.filter((k) => k.startsWith(prefix)))].sort();
  }
}

class BlobStore implements BinaryStore {
  readonly kind = "blobs" as const;
  private readonly store: ReturnType<typeof getStore>;
  constructor(name: string) {
    this.store = getStore({ name, consistency: "strong" });
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const v = await this.store.get(key, { type: "json" });
    return (v as T | null) ?? null;
  }
  async setJSON(key: string, value: unknown): Promise<void> {
    await this.store.setJSON(key, value);
  }
  async getBytes(key: string): Promise<Uint8Array | null> {
    const buf = await this.store.get(key, { type: "arrayBuffer" });
    return buf ? new Uint8Array(buf) : null;
  }
  async setBytes(key: string, data: Uint8Array, contentType: string): Promise<void> {
    const copy = new Uint8Array(data.byteLength);
    copy.set(data);
    await this.store.set(key, copy.buffer, { metadata: { contentType } });
  }
  async delete(key: string): Promise<void> {
    await this.store.delete(key);
  }
  async list(prefix = ""): Promise<string[]> {
    const { blobs } = await this.store.list({ prefix });
    return blobs.map((b) => b.key).sort();
  }
}

function projectRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

function useFileStore(): boolean {
  if (process.env.FLICK_FORCE_FILE_STORE === "true") return true;
  if (process.env.NETLIFY_DEV === "true") return true;
  if (process.env.NETLIFY === "true") return false;
  return process.env.NODE_ENV !== "production";
}

let override: BinaryStore | null = null;

export function useStore(store: BinaryStore | null): void {
  override = store;
}

export function openStore(): BinaryStore {
  if (override) return override;
  if (useFileStore()) {
    return new FileStore(path.join(projectRoot(), ".netlify", "flick-store"));
  }
  try {
    return new BlobStore("flick-clips");
  } catch {
    return new FileStore(path.join(projectRoot(), ".netlify", "flick-store"));
  }
}

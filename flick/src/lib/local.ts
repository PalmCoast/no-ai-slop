import type { CaptureMode } from "../../shared/types";

const DB_NAME = "flick";
const STORE = "clips";

export interface LocalClip {
  id: string;
  remoteId?: string;
  title: string;
  createdAt: string;
  durationMs: number;
  width: number;
  height: number;
  mimeType: string;
  size: number;
  mode: CaptureMode;
  blob: Blob;
}

export type LocalClipMeta = Omit<LocalClip, "blob">;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveLocal(clip: LocalClip): Promise<void> {
  await withStore("readwrite", (store) => store.put(clip));
}

export async function getLocal(id: string): Promise<LocalClip | null> {
  const row = await withStore<LocalClip | undefined>("readonly", (store) => store.get(id));
  return row ?? null;
}

export async function deleteLocal(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function listLocal(): Promise<LocalClipMeta[]> {
  const rows = await withStore<LocalClip[]>("readonly", (store) => store.getAll());
  return rows
    .map((row) => ({
      id: row.id,
      remoteId: row.remoteId,
      title: row.title,
      createdAt: row.createdAt,
      durationMs: row.durationMs,
      width: row.width,
      height: row.height,
      mimeType: row.mimeType,
      size: row.size,
      mode: row.mode,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markPublished(id: string, remoteId: string): Promise<void> {
  const clip = await getLocal(id);
  if (!clip) return;
  await saveLocal({ ...clip, remoteId });
}

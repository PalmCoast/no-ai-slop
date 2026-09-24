import { getStore } from "@netlify/blobs";

function store() {
  return getStore({ name: "braid-stamps", consistency: "strong" });
}

export function stampBytes(bytes: Uint8Array): ArrayBuffer {
  return bytesOf(bytes);
}

function bytesOf(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export async function putPending(id: string, bytes: Uint8Array): Promise<void> {
  await store().set(`pending/${id}`, bytesOf(bytes));
}

/** Copy the pending stamp into the public key. A second call returns the public bytes. */
export async function publishStamp(id: string): Promise<Uint8Array | null> {
  const blobs = store();
  const pending = await blobs.get(`pending/${id}`, { type: "arrayBuffer" });
  if (pending) {
    const bytes = new Uint8Array(pending);
    await blobs.set(`public/${id}`, bytesOf(bytes));
    return bytes;
  }
  const existing = await blobs.get(`public/${id}`, { type: "arrayBuffer" });
  return existing ? new Uint8Array(existing) : null;
}

export async function readPublic(id: string): Promise<Uint8Array | null> {
  const existing = await store().get(`public/${id}`, { type: "arrayBuffer" });
  return existing ? new Uint8Array(existing) : null;
}

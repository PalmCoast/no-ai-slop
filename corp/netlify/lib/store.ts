import { getStore } from "@netlify/blobs";
import type { BuzzEdition } from "../../shared/buzz-seed.ts";
import type { RankedSite } from "../../shared/rank.ts";

export function hiveStore() {
  return getStore({ name: "agenthive-corp", consistency: "strong" });
}

export async function readBuzz(): Promise<BuzzEdition | null> {
  try {
    const store = hiveStore();
    const data = await store.get("buzz/latest.json", { type: "json" });
    return (data as BuzzEdition | null) ?? null;
  } catch {
    return null;
  }
}

export async function writeBuzz(edition: BuzzEdition): Promise<void> {
  const store = hiveStore();
  await store.setJSON("buzz/latest.json", edition);
  await store.setJSON(`buzz/${edition.weekOf}.json`, edition);
}

export async function readRank(): Promise<{ generatedAt: string; sites: RankedSite[] } | null> {
  try {
    const store = hiveStore();
    const data = await store.get("rank/latest.json", { type: "json" });
    return (data as { generatedAt: string; sites: RankedSite[] } | null) ?? null;
  } catch {
    return null;
  }
}

export async function writeRank(payload: { generatedAt: string; sites: RankedSite[] }): Promise<void> {
  const store = hiveStore();
  await store.setJSON("rank/latest.json", payload);
}

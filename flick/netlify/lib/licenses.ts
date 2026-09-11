import type { LicenseRecord } from "../../shared/license";
import { openStore } from "./store";

function recKey(key: string): string {
  return `lic/${key}`;
}

function sessionKey(id: string): string {
  return `sess/${id}`;
}

function freeKey(deviceId: string): string {
  return `free/${deviceId}`;
}

export interface FreeSlot {
  deviceId: string;
  clipId: string;
  usedAt: string;
}

export async function getLicenseRecord(key: string): Promise<LicenseRecord | null> {
  return openStore().getJSON<LicenseRecord>(recKey(key));
}

export async function saveLicenseRecord(rec: LicenseRecord): Promise<void> {
  await openStore().setJSON(recKey(rec.key), rec);
}

export async function licenseKeyForSession(sessionId: string): Promise<string | null> {
  const idx = await openStore().getJSON<{ key: string }>(sessionKey(sessionId));
  return idx?.key ?? null;
}

export async function bindSession(sessionId: string, key: string): Promise<void> {
  await openStore().setJSON(sessionKey(sessionId), { key });
}

export async function getFreeSlot(deviceId: string): Promise<FreeSlot | null> {
  return openStore().getJSON<FreeSlot>(freeKey(deviceId));
}

export async function consumeFreeSlot(deviceId: string, clipId: string): Promise<boolean> {
  const existing = await getFreeSlot(deviceId);
  if (existing) return false;
  await openStore().setJSON(freeKey(deviceId), {
    deviceId,
    clipId,
    usedAt: new Date().toISOString(),
  });
  return true;
}

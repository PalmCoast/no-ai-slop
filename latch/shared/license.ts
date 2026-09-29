/** Unambiguous alphabet: no 0/O or 1/I. */
export const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const DEMO_LICENSE_RE = /^LATCH-DEMO-[A-Z0-9]{4}$/;
export const TOKEN_RE = /^LATCH1\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}$/;

export function normalizeKey(raw: string | null | undefined): string {
  const trimmed = (raw ?? "").trim().replace(/\s+/g, "");
  if (trimmed.toUpperCase().startsWith("LATCH-DEMO-")) return trimmed.toUpperCase();
  return trimmed;
}

export function isDemoLicense(key: string): boolean {
  return DEMO_LICENSE_RE.test(key);
}

export function isRecordToken(key: string): boolean {
  return TOKEN_RE.test(key);
}

export function isPlausibleLicense(key: string | null | undefined): boolean {
  const clean = normalizeKey(key);
  if (!clean || clean.length > 500) return false;
  return isDemoLicense(clean) || isRecordToken(clean);
}

export function hasRecord(key: string | null | undefined): boolean {
  return isPlausibleLicense(key);
}

function randomGroup(len: number, random: () => number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += KEY_ALPHABET[Math.floor(random() * KEY_ALPHABET.length)];
  return out;
}

export function generateDemoKey(random: () => number = Math.random): string {
  return `LATCH-DEMO-${randomGroup(4, random)}`;
}

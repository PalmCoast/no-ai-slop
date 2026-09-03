/**
 * License key format shared by the console and the Netlify functions.
 *
 *   SONARIS-XXXX-XXXX-XXXX   paid license (one-time or monthly)
 *   SONARIS-DEMO-XXXX        demo license, issued only when Stripe is not configured
 */

/** Unambiguous alphabet: no 0/O or 1/I. */
export const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const LICENSE_RE = /^SONARIS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
export const DEMO_LICENSE_RE = /^SONARIS-DEMO-[A-Z0-9]{4}$/;

export type LicensePlan = "one_time" | "monthly" | "demo";

export interface LicenseRecord {
  key: string;
  plan: LicensePlan;
  issuedAt: string;
  /** Stripe Checkout Session id that produced it, when applicable. */
  sessionId?: string;
  email?: string;
}

export function normalizeKey(raw: string | null | undefined): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isWellFormedLicense(key: string): boolean {
  return LICENSE_RE.test(key);
}

export function isDemoLicense(key: string): boolean {
  return DEMO_LICENSE_RE.test(key);
}

export function isPlausibleLicense(key: string): boolean {
  return isWellFormedLicense(key) || isDemoLicense(key);
}

function randomGroup(len: number, random: () => number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += KEY_ALPHABET[Math.floor(random() * KEY_ALPHABET.length)];
  return out;
}

export function generateLicenseKey(random: () => number = Math.random): string {
  return `SONARIS-${randomGroup(4, random)}-${randomGroup(4, random)}-${randomGroup(4, random)}`;
}

export function generateDemoKey(random: () => number = Math.random): string {
  return `SONARIS-DEMO-${randomGroup(4, random)}`;
}

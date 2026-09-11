/**
 * License keys shared by the studio and Netlify functions.
 *
 *   FLICK-XXXX-XXXX-XXXX   paid (Lights monthly or Marquee founder)
 *   FLICK-DEMO-XXXX         demo, issued only when Stripe is off and demo pay is on
 */

export const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const LICENSE_RE = /^FLICK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
export const DEMO_LICENSE_RE = /^FLICK-DEMO-[A-Z0-9]{4}$/;

export type LicensePlan = "monthly" | "founder" | "demo";

export interface LicenseRecord {
  key: string;
  plan: LicensePlan;
  issuedAt: string;
  sessionId?: string;
  customerId?: string;
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
  for (let i = 0; i < len; i++) out += KEY_ALPHABET[Math.floor(random() * KEY_ALPHABET.length)]!;
  return out;
}

export function generateLicenseKey(random: () => number = Math.random): string {
  return `FLICK-${randomGroup(4, random)}-${randomGroup(4, random)}-${randomGroup(4, random)}`;
}

export function generateDemoKey(random: () => number = Math.random): string {
  return `FLICK-DEMO-${randomGroup(4, random)}`;
}

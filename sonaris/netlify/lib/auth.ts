/**
 * License validation for functions.
 *
 * Paid keys must exist in the `licenses` store. Demo keys (SONARIS-DEMO-XXXX)
 * are accepted only while Stripe is not configured, which is what "demo mode"
 * means for this product.
 */
import { isDemoLicense, isWellFormedLicense, normalizeKey, type LicenseRecord } from "../../src/license";
import { env } from "./env";
import { openStore } from "./store";

export interface LicenseCheck {
  valid: boolean;
  key: string;
  plan?: LicenseRecord["plan"];
  issuedAt?: string;
  demo?: boolean;
  reason?: "missing" | "malformed" | "unknown" | "demo_disabled";
}

export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY") && env("STRIPE_PRICE_ID"));
}

export async function getLicenseRecord(key: string): Promise<LicenseRecord | null> {
  const raw = await openStore("licenses").get(`${key}.json`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LicenseRecord;
  } catch {
    return null;
  }
}

export async function saveLicenseRecord(rec: LicenseRecord): Promise<void> {
  await openStore("licenses").set(`${rec.key}.json`, JSON.stringify(rec));
}

export async function validateLicense(rawKey: string | null | undefined): Promise<LicenseCheck> {
  const key = normalizeKey(rawKey);
  if (!key) return { valid: false, key, reason: "missing" };
  if (isDemoLicense(key)) {
    if (stripeConfigured()) return { valid: false, key, reason: "demo_disabled" };
    const rec = await getLicenseRecord(key);
    return { valid: true, key, plan: "demo", demo: true, issuedAt: rec?.issuedAt ?? new Date().toISOString() };
  }
  if (!isWellFormedLicense(key)) return { valid: false, key, reason: "malformed" };
  const rec = await getLicenseRecord(key);
  if (!rec) return { valid: false, key, reason: "unknown" };
  return { valid: true, key, plan: rec.plan, issuedAt: rec.issuedAt };
}

/** Convenience: returns the check, or a 402 response the caller can return. */
export async function requireLicense(rawKey: string | null | undefined): Promise<LicenseCheck | Response> {
  const check = await validateLicense(rawKey);
  if (check.valid) return check;
  return new Response(
    JSON.stringify({ error: "license_required", reason: check.reason, checkout: "/#pricing" }),
    { status: 402, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

import Stripe from "stripe";
import { generateLicenseKey, type LicensePlan, type LicenseRecord } from "../../src/license";
import { getLicenseRecord, saveLicenseRecord } from "./auth";
import { env } from "./env";
import { openStore } from "./store";

let client: Stripe | null = null;

export function stripe(): Stripe | null {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function priceFor(plan: "one_time" | "monthly"): string | undefined {
  return plan === "monthly" ? env("STRIPE_PRICE_ID_MONTHLY") : env("STRIPE_PRICE_ID");
}

export function siteUrl(req: Request): string {
  const configured = env("SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

/**
 * Mint a license for a paid Checkout Session exactly once. A session→key index
 * in the `licenses` store makes both the success page and the webhook idempotent.
 */
export async function mintLicenseForSession(session: Stripe.Checkout.Session): Promise<LicenseRecord> {
  const store = openStore("licenses");
  const indexKey = `by-session/${session.id}.json`;
  const existing = await store.get(indexKey);
  if (existing) {
    const rec = await getLicenseRecord((JSON.parse(existing) as { key: string }).key);
    if (rec) return rec;
  }
  const plan: LicensePlan = session.mode === "subscription" ? "monthly" : "one_time";
  let key = generateLicenseKey();
  while (await getLicenseRecord(key)) key = generateLicenseKey();
  const rec: LicenseRecord = {
    key,
    plan,
    issuedAt: new Date().toISOString(),
    sessionId: session.id,
    email: session.customer_details?.email ?? undefined,
  };
  await saveLicenseRecord(rec);
  await store.set(indexKey, JSON.stringify({ key }));
  return rec;
}

export function sessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.payment_status === "no_payment_required";
}

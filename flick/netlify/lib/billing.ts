import type Stripe from "stripe";
import { generateDemoKey, isPlausibleLicense, normalizeKey } from "../../shared/license";
import { PAID_PLANS, type PaidPlan } from "../../shared/plans";
import { env } from "./env";
import { error, json, readJson } from "./http";
import { getLicenseRecord, saveLicenseRecord } from "./licenses";
import {
  demoPaymentsAllowed,
  integrationIdentifier,
  lineItemFor,
  mintLicenseForSession,
  paymentsMode,
  sessionIsPaid,
  siteUrl,
  stripe,
  stripeConfigured,
} from "./stripe";

interface CheckoutBody {
  plan?: string;
  email?: string;
}

export async function handleCheckout(req: Request): Promise<Response> {
  const body = (await readJson<CheckoutBody>(req)) ?? {};
  const plan: PaidPlan = body.plan === "founder" ? "founder" : "monthly";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";

  if (!stripeConfigured()) {
    if (!demoPaymentsAllowed()) {
      return error(
        503,
        "payments_unconfigured",
        "Stripe is not on this stage yet. Set STRIPE_SECRET_KEY to sell Lights and Marquee.",
      );
    }
    const licenseKey = generateDemoKey();
    await saveLicenseRecord({ key: licenseKey, plan: "demo", issuedAt: new Date().toISOString() });
    return json({
      demo: true,
      licenseKey,
      plan: "demo",
      product: PAID_PLANS[plan].name,
      message: "Stripe is dark, so this is a rehearsal license. It unlocks publish on this machine only.",
    });
  }

  const s = stripe()!;
  const base = siteUrl(req);
  const spec = PAID_PLANS[plan];
  try {
    const session = await s.checkout.sessions.create({
      mode: spec.mode,
      line_items: [lineItemFor(plan)],
      success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      allow_promotion_codes: true,
      metadata: { product: "flick", plan },
      ...(email ? { customer_email: email } : {}),
      integration_identifier: integrationIdentifier(),
    });
    if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
    return json({ url: session.url, id: session.id, plan });
  } catch (e) {
    return error(502, "stripe_error", (e as Error).message);
  }
}

export async function handleClaim(req: Request): Promise<Response> {
  const body = (await readJson<{ sessionId?: string; licenseKey?: string }>(req)) ?? {};
  if (body.licenseKey) {
    const key = normalizeKey(body.licenseKey);
    if (!isPlausibleLicense(key)) return error(400, "bad_key", "That is not a Flick license.");
    const rec = await getLicenseRecord(key);
    if (!rec) return error(404, "not_found", "No license with that key.");
    return json({ licenseKey: rec.key, plan: rec.plan, email: rec.email });
  }
  const sessionId = (body.sessionId ?? "").trim();
  if (!sessionId.startsWith("cs_")) return error(400, "bad_session", "Missing Checkout session id.");
  const s = stripe();
  if (!s) return error(503, "payments_unconfigured", "Stripe is not configured.");
  let session: Stripe.Checkout.Session;
  try {
    session = await s.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    return error(404, "no_session", (e as Error).message);
  }
  if (!sessionIsPaid(session)) {
    return error(402, "unpaid", "That checkout is not paid yet.");
  }
  const rec = await mintLicenseForSession(session);
  return json({ licenseKey: rec.key, plan: rec.plan, email: rec.email });
}

export async function handlePortal(req: Request): Promise<Response> {
  const body = (await readJson<{ licenseKey?: string }>(req)) ?? {};
  const key = normalizeKey(body.licenseKey);
  const rec = key ? await getLicenseRecord(key) : null;
  if (!rec) return error(401, "bad_license", "Need a live Lights license to open the billing portal.");
  if (rec.plan !== "monthly" || !rec.customerId) {
    return error(409, "no_portal", "Marquee is a one-time seat. There is nothing to manage in Stripe.");
  }
  const s = stripe();
  if (!s) return error(503, "payments_unconfigured", "Stripe is not configured.");
  try {
    const portal = await s.billingPortal.sessions.create({
      customer: rec.customerId,
      return_url: `${siteUrl(req)}/pricing`,
    });
    return json({ url: portal.url });
  } catch (e) {
    return error(502, "stripe_error", (e as Error).message);
  }
}

export async function handleStripeWebhook(req: Request): Promise<Response> {
  const s = stripe();
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!s || !secret) return error(409, "webhook_not_configured", "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");
  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "missing_signature", "Missing stripe-signature header.");
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await s.webhooks.constructEventAsync(payload, signature, secret);
  } catch (e) {
    return error(400, "bad_signature", (e as Error).message);
  }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (sessionIsPaid(session)) {
      const rec = await mintLicenseForSession(session);
      console.log(`[flick] license ${rec.key} minted for session ${session.id}`);
    }
  }
  return json({ received: true, payments: paymentsMode() });
}

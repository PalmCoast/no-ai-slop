import { DEMO_NOTE, PRICE_CENTS } from "../../shared/offer";
import { generateDemoKey, isDemoLicense, isPlausibleLicense, isRecordToken, normalizeKey } from "../../shared/license";
import { error, json, readJson } from "./http";
import { signToken, verifyToken } from "./sign";

function stripeSecret(): string | undefined {
  const value = process.env.STRIPE_SECRET_KEY;
  return value && value.trim() ? value.trim() : undefined;
}

function siteUrl(req: Request): string {
  const configured = process.env.SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

async function checkout(req: Request): Promise<Response> {
  const secret = stripeSecret();
  if (!secret) {
    return json({
      demo: true,
      licenseKey: generateDemoKey(),
      plan: "demo",
      message: DEMO_NOTE,
    });
  }
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const base = siteUrl(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: "Latch record",
            description: "A log of time on task, a timer length you choose, and a text export. One payment. The timer stays free.",
          },
        },
      },
    ],
    success_url: `${base}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/#record`,
    metadata: { product: "latch", plan: "once" },
  });
  if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
  return json({ url: session.url, id: session.id, demo: false });
}

async function license(req: Request): Promise<Response> {
  const body = await readJson(req);
  const key = normalizeKey(typeof body?.key === "string" ? body.key : "");
  if (!isPlausibleLicense(key)) return json({ valid: false });
  const secret = stripeSecret();
  if (isDemoLicense(key)) return json({ valid: !secret, demo: !secret });
  if (!secret || !isRecordToken(key)) return json({ valid: false });
  return json({ valid: verifyToken(key, secret), demo: false });
}

async function confirm(req: Request): Promise<Response> {
  const secret = stripeSecret();
  if (!secret) return error(409, "stripe_not_configured", "Stripe is not configured.");
  const body = await readJson(req);
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  if (!sessionId.startsWith("cs_")) return error(400, "bad_session", "Missing Checkout session.");
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.product !== "latch") return error(400, "bad_session", "That payment is not for Latch.");
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return error(402, "unpaid", "That payment is not complete.");
  }
  return json({ licenseKey: signToken(session.id, secret), demo: false });
}

export async function handle(req: Request): Promise<Response> {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const path = new URL(req.url).pathname;
  try {
    if (path === "/api/checkout") return await checkout(req);
    if (path === "/api/license") return await license(req);
    if (path === "/api/confirm") return await confirm(req);
    return error(404, "not_found", "No such path.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return error(502, "request_failed", message);
  }
}

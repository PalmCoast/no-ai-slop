import { DEMO_NOTE, PRICE_CENTS, PRICE_LABEL, SELLER } from "../../shared/offer";
import { generateDemoKey, isDemoLicense, isPlausibleLicense, isRecordToken, normalizeKey } from "../../shared/license";
import { modelLines } from "../../shared/modelLines";
import { shouldIssuePass } from "../../shared/fulfill";
import { env } from "./env";
import { error, json, readJson } from "./http";
import { integrationId, signToken, verifyToken } from "./sign";

function stripeSecret(): string | undefined {
  return env("STRIPE_SECRET_KEY");
}

function siteUrl(req: Request): string {
  const configured = env("SITE_URL")?.replace(/\/$/, "");
  if (configured) return configured;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return new URL(req.url).origin;
}

function emailOf(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const email = value.trim();
  if (!/^[^\s']+@[^\s']+\.[^\s']+$/.test(email) || email.length > 200) return undefined;
  return email;
}

async function stripeClient(secret: string) {
  const { default: Stripe } = await import("stripe");
  return new Stripe(secret);
}

async function checkout(req: Request): Promise<Response> {
  const secret = stripeSecret();
  const body = await readJson(req);
  const email = emailOf(body?.email);
  if (!secret) {
    return json({
      demo: true,
      licenseKey: generateDemoKey(),
      plan: "demo",
      message: DEMO_NOTE,
    });
  }
  const stripe = await stripeClient(secret);
  const base = siteUrl(req);
  const params = {
    mode: "payment" as const,
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: "Redline",
            description: "One payment to review hospital bills and write the dispute letters. No percentage of the savings.",
          },
        },
      },
    ],
    success_url: `${base}/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/#/new`,
    customer_creation: email ? ("always" as const) : undefined,
    metadata: { product: "redline", plan: "once", ...(email ? { email } : {}) },
  };
  let session;
  try {
    session = await stripe.checkout.sessions.create({
      ...params,
      integration_identifier: integrationId(),
    } as Parameters<typeof stripe.checkout.sessions.create>[0]);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (!message.toLowerCase().includes("integration_identifier")) throw err;
    session = await stripe.checkout.sessions.create(params);
  }
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
  const stripe = await stripeClient(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.product !== "redline") return error(400, "bad_session", "That payment is not for Redline.");
  if (!shouldIssuePass("checkout.session.completed", session.payment_status)) {
    return error(402, "unpaid", "That payment is not complete.");
  }
  return json({ licenseKey: signToken(session.id, secret), demo: false });
}

async function restore(req: Request): Promise<Response> {
  const secret = stripeSecret();
  if (!secret) return error(409, "stripe_not_configured", "Stripe is not configured.");
  const body = await readJson(req);
  const email = emailOf(body?.email);
  if (!email) return error(400, "bad_email", "Enter the email you used at checkout.");
  const stripe = await stripeClient(secret);
  const customers = await stripe.customers.list({ email, limit: 5 });
  for (const customer of customers.data) {
    const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 20 });
    const session = sessions.data.find(
      (row) => row.metadata?.product === "redline" && shouldIssuePass("checkout.session.completed", row.payment_status),
    );
    if (session) return json({ licenseKey: signToken(session.id, secret), demo: false });
  }
  return error(404, "not_found", "No paid Redline pass for that email.");
}

const READ_PROMPT = `You extract hospital bill line items from text the patient pasted.
Return JSON only, shaped as {"lines":[{"description":string,"code":string|null,"quantity":number,"billedCents":number}]}.
Use only charges written in the text. code is a CPT or HCPCS if it appears on that line, otherwise null. Do not invent codes.
billedCents is the line charge in US cents. quantity defaults to 1. Skip totals, payments, adjustments, and balances.
Do not add Medicare rates, savings, or advice.`;

async function readBill(req: Request): Promise<Response> {
  const body = await readJson(req);
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 12000) : "";
  if (text.length < 20) return error(400, "short", "Paste more of the bill.");
  let content = "";
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: READ_PROMPT },
        { role: "user", content: text },
      ],
    });
    content = completion.choices[0]?.message?.content ?? "";
  } catch {
    return error(503, "model_off", "The model read is off until AI Gateway is enabled on the site.");
  }
  try {
    const parsed = modelLines(JSON.parse(content) as unknown);
    if (!parsed) return error(422, "bad_model", "The model did not return line items.");
    if (parsed.length === 0) return error(422, "no_lines", "The model did not find charges in that text.");
    return json({ lines: parsed });
  } catch {
    return error(422, "bad_model", "The model did not return line items.");
  }
}

export async function handle(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  try {
    if (path === "/api/offer" && req.method === "GET") {
      return json({
        priceCents: PRICE_CENTS,
        priceLabel: PRICE_LABEL,
        demo: !stripeSecret(),
        seller: SELLER,
      });
    }
    if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
    if (path === "/api/checkout") return await checkout(req);
    if (path === "/api/license") return await license(req);
    if (path === "/api/confirm") return await confirm(req);
    if (path === "/api/restore") return await restore(req);
    if (path === "/api/read") return await readBill(req);
    return error(404, "not_found", "No such path.");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed.";
    return error(502, "request_failed", message);
  }
}

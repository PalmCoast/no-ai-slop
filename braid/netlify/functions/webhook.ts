/**
 * POST /api/stripe-webhook
 * Stores the stamp if the buyer closes the success page before it loads.
 */
import type { Config } from "@netlify/functions";
import type Stripe from "stripe";
import { env } from "../lib/env.ts";
import { fulfillSession } from "../lib/fulfill.ts";
import { error, json } from "../lib/http.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const secret = env("STRIPE_SECRET_KEY");
  const webhook = env("STRIPE_WEBHOOK_SECRET");
  if (!secret || !webhook) {
    return error(409, "webhook_not_configured", "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "missing_signature", "Missing stripe-signature header.");

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhook);
  } catch (cause) {
    return error(400, "bad_signature", cause instanceof Error ? cause.message : "Bad signature.");
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.product === "braid") {
      const result = await fulfillSession(session);
      if (!result.ok && result.code !== "unpaid") {
        return error(result.status, result.code, result.message);
      }
    }
  }
  return json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: ["POST"],
};

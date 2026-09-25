/**
 * POST /api/stripe-webhook
 * Records a paid Aisle publish. The thanks page unlocks the shelf sheet.
 */
import type { Config } from "@netlify/functions";
import type Stripe from "stripe";
import { env } from "../lib/env.ts";
import { error, json } from "../lib/http.ts";
import { sessionIsPaid, stripe } from "../lib/stripe.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const client = stripe();
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!client || !secret) return error(409, "webhook_not_configured", "Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.");

  const signature = req.headers.get("stripe-signature");
  if (!signature) return error(400, "missing_signature", "Missing stripe-signature header.");

  let event: Stripe.Event;
  try {
    event = await client.webhooks.constructEventAsync(await req.text(), signature, secret);
  } catch (err) {
    return error(400, "bad_signature", (err as Error).message);
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (sessionIsPaid(session) && session.metadata?.product === "aisle") {
      console.log(`aisle paid ${session.id} shop=${session.metadata.shopName ?? ""}`);
    }
  }
  return json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: ["POST"],
};

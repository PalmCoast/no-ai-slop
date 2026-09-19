import type { Config } from "@netlify/functions";
import { applyBid } from "../../shared/marquee.ts";
import { readMarquee, writeMarquee } from "../lib/store.ts";
import { stripeSecret, stripeWebhookSecret } from "../lib/env.ts";

export default async (req: Request) => {
  const secret = stripeSecret();
  const webhook = stripeWebhookSecret();
  if (!secret || !webhook) return Response.json({ error: "unconfigured" }, { status: 503 });
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(secret);
  const signature = req.headers.get("stripe-signature") ?? "";
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), signature, webhook);
  } catch (error) {
    return Response.json({ error: "bad_signature", detail: error instanceof Error ? error.message : "fail" }, { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      payment_status?: string;
      metadata?: { kind?: string; name?: string; bidCents?: string };
    };
    if (session.payment_status === "paid" && session.metadata?.kind === "marquee") {
      const name = session.metadata.name ?? "";
      const bidCents = Number(session.metadata.bidCents ?? 0);
      if (name && bidCents) {
        const listings = applyBid(await readMarquee(), { name, bidCents });
        await writeMarquee(listings);
      }
    }
  }
  return Response.json({ received: true });
};

export const config: Config = {
  path: "/api/stripe-webhook",
  method: "POST",
};

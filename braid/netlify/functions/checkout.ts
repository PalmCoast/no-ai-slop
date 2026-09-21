/**
 * POST /api/checkout { stamp: base64 }
 * Holds the stamp, then opens a $29 Checkout Session on the Palm Coast AI price.
 */
import type { Config } from "@netlify/functions";
import { STAMP_PRICE_ID } from "../../src/offer.ts";
import { stampPublicId } from "../../src/host.ts";
import { decodeStamp } from "../lib/decode.ts";
import { env, siteUrl } from "../lib/env.ts";
import { error, json, readJson } from "../lib/http.ts";
import { putPending } from "../lib/store.ts";

interface CheckoutBody {
  stamp?: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = (await readJson<CheckoutBody>(req)) ?? {};
  const decoded = decodeStamp(body.stamp);
  if (!decoded.ok) return error(400, "bad_stamp", decoded.message);

  const secret = env("STRIPE_SECRET_KEY");
  if (!secret) {
    return error(
      503,
      "payments_unconfigured",
      "Set STRIPE_SECRET_KEY on the braid Netlify site. A local stamp is still free.",
    );
  }

  const id = stampPublicId(decoded.bytes);
  try {
    await putPending(id, decoded.bytes);
  } catch (cause) {
    console.error("stamp hold failed", cause);
    return error(503, "store_unavailable", "Netlify Blobs is not available for stamp storage.");
  }

  const price = env("STRIPE_PRICE_STAMP") ?? STAMP_PRICE_ID;
  const origin = siteUrl(req);
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/hosted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=1`,
      metadata: { product: "braid", kind: "stamp-desk", stampId: id },
    });
    if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
    return json({ url: session.url, id: session.id, stampId: id });
  } catch (cause) {
    return error(502, "stripe_error", cause instanceof Error ? cause.message : "Stripe checkout failed.");
  }
};

export const config: Config = {
  path: "/api/checkout",
  method: ["POST"],
};

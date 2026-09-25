/**
 * POST /api/checkout { shopName, query }
 * $29 Stripe Checkout for a named aisle, or a demo claim when Stripe is unset.
 */
import type { Config } from "@netlify/functions";
import { PUBLISH_CENTS, PUBLISH_LABEL, validQuery, validShopName } from "../../shared/offers.ts";
import { error, json, readJson } from "../lib/http.ts";
import { siteUrl, stripe } from "../lib/stripe.ts";

interface CheckoutBody {
  shopName?: string;
  query?: string;
  email?: string;
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = (await readJson<CheckoutBody>(req)) ?? {};
  const shopName = (body.shopName ?? "").trim().slice(0, 48);
  const query = (body.query ?? "").trim().slice(0, 180);
  if (!validShopName(shopName)) return error(400, "bad_name", "Give the shop a name, 2 to 48 characters.");
  if (!validQuery(query)) return error(400, "bad_query", "The spec needs to be at least 3 characters.");

  const base = siteUrl(req);
  const thanks = `${base}/thanks?name=${encodeURIComponent(shopName)}&q=${encodeURIComponent(query)}`;
  const client = stripe();
  if (!client) {
    return json({
      demo: true,
      amountCents: PUBLISH_CENTS,
      amountLabel: PUBLISH_LABEL,
      url: `${thanks}&demo=1`,
    });
  }

  try {
    const session = await client.checkout.sessions.create({
      mode: "payment",
      ...(body.email?.includes("@") ? { customer_email: body.email } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PUBLISH_CENTS,
            product_data: {
              name: `Aisle publish: ${shopName}`,
              description: query,
            },
          },
        },
      ],
      metadata: {
        product: "aisle",
        shopName,
        query: query.slice(0, 450),
      },
      success_url: `${thanks}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/publish?name=${encodeURIComponent(shopName)}&q=${encodeURIComponent(query)}`,
    });
    if (!session.url) return error(502, "no_url", "Stripe did not return a Checkout URL.");
    return json({ url: session.url, id: session.id, amountCents: PUBLISH_CENTS, amountLabel: PUBLISH_LABEL });
  } catch (err) {
    return error(502, "stripe_error", (err as Error).message);
  }
};

export const config: Config = {
  path: "/api/checkout",
  method: ["POST"],
};

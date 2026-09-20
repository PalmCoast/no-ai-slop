import { afterEach, describe, expect, it } from "vitest";
import checkout, { config as checkoutConfig } from "../netlify/functions/checkout.ts";
import { config as orderConfig } from "../netlify/functions/order.ts";
import { config as webhookConfig } from "../netlify/functions/stripe-webhook.ts";
import { priceIdFor } from "../netlify/lib/stripe.ts";
import { OFFERS, isOfferId, offerById } from "../shared/offers.ts";

const saved = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in saved)) delete process.env[key];
  }
  Object.assign(process.env, saved);
});

describe("offers", () => {
  it("keeps five priced SKUs on live Palm Coast AI prices", () => {
    expect(OFFERS.map((o) => o.id)).toEqual(["rack", "desk", "consult30", "consultHour", "pack"]);
    expect(new Set(OFFERS.map((o) => o.defaultPriceId)).size).toBe(5);
    expect(offerById("rack")?.cents).toBe(150_000);
    expect(offerById("desk")?.cents).toBe(25_000);
    expect(offerById("desk")?.mode).toBe("subscription");
    expect(offerById("consult30")?.fallbackHref).toContain("buy.stripe.com");
    expect(offerById("rack")?.fallbackHref).toContain("buy.stripe.com");
    expect(offerById("desk")?.fallbackHref).toContain("buy.stripe.com");
    expect(isOfferId("rack")).toBe(true);
    expect(isOfferId("enterprise")).toBe(false);
  });
});

describe("function routes", () => {
  it("serves checkout, order, and webhook on first-class /api paths", () => {
    expect(checkoutConfig).toMatchObject({ path: "/api/checkout", method: ["POST"] });
    expect(orderConfig).toMatchObject({ path: "/api/order", method: ["GET"] });
    expect(webhookConfig).toMatchObject({ path: "/api/stripe-webhook", method: ["POST"] });
  });
});

describe("checkout without a Stripe secret", () => {
  it("rejects unknown offers", async () => {
    const res = await checkout(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: "enterprise" }),
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("unknown_offer");
  });

  it("returns the live payment-link fallback for rack and desk", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await checkout(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: "rack", shop: "Harbor HVAC" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url?: string; fallback?: boolean; offer?: string };
    expect(body.offer).toBe("rack");
    expect(body.fallback).toBe(true);
    expect(body.url).toBe("https://buy.stripe.com/dRm6oH6UI9P5ePb0PM2ZO1n");
  });

  it("returns the consult Stripe payment link", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await checkout(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: "consult30" }),
      }),
    );
    const body = (await res.json()) as { url?: string };
    expect(body.url).toBe("https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h");
  });
});

describe("price ids", () => {
  it("uses the env override, then the live default", () => {
    delete process.env.STRIPE_PRICE_ID_RACK;
    expect(priceIdFor("rack")).toBe("price_1UHpioFJWYd4pYuxawfgIoHJ");
    process.env.STRIPE_PRICE_ID_RACK = "price_override";
    expect(priceIdFor("rack")).toBe("price_override");
  });
});

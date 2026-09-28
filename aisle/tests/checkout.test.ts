import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import checkout, { config as checkoutConfig } from "../netlify/functions/checkout.ts";
import order, { config as orderConfig } from "../netlify/functions/order.ts";
import webhook, { config as webhookConfig } from "../netlify/functions/stripe-webhook.ts";
import { PUBLISH_CENTS, PUBLISH_LABEL } from "../shared/offers.ts";
import { PAGE_SEO, canonicalFor, pageForPath } from "../shared/seo.ts";

const saved = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in saved)) delete process.env[key];
  }
  Object.assign(process.env, saved);
});

describe("publish checkout", () => {
  it("serves checkout, order, and webhook on /api paths", () => {
    expect(checkoutConfig).toMatchObject({ path: "/api/checkout", method: ["POST"] });
    expect(orderConfig).toMatchObject({ path: "/api/order", method: ["GET"] });
    expect(webhookConfig).toMatchObject({ path: "/api/stripe-webhook", method: ["POST"] });
  });

  it("returns a $29 demo claim when Stripe is unset", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await checkout(
      new Request("https://aisle.firstdeploy.ai/api/checkout", {
        method: "POST",
        body: JSON.stringify({ shopName: "Flange Tube", query: "4 inch aluminum tube with a flange" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { demo: boolean; amountCents: number; amountLabel: string; url: string };
    expect(body.demo).toBe(true);
    expect(body.amountCents).toBe(PUBLISH_CENTS);
    expect(body.amountLabel).toBe(PUBLISH_LABEL);
    expect(body.url).toContain("/thanks?");
    expect(body.url).toContain("demo=1");
    expect(body.url).toContain("Flange");
  });

  it("rejects a blank shop name and a non-POST", async () => {
    const bad = await checkout(
      new Request("https://aisle.firstdeploy.ai/api/checkout", {
        method: "POST",
        body: JSON.stringify({ shopName: "A", query: "tube" }),
      }),
    );
    expect(bad.status).toBe(400);
    const wrong = await checkout(new Request("https://aisle.firstdeploy.ai/api/checkout"));
    expect(wrong.status).toBe(405);
  });

  it("asks for a session on the order route and refuses an unconfigured webhook", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const missing = await order(new Request("https://aisle.firstdeploy.ai/api/order"));
    expect(missing.status).toBe(400);
    const hook = await webhook(new Request("https://aisle.firstdeploy.ai/api/stripe-webhook", { method: "POST" }));
    expect(hook.status).toBe(409);
  });
});

describe("routes", () => {
  it("gives the two shops and the publish page their own canonical URLs", () => {
    expect(canonicalFor("/")).toBe("https://aisle.firstdeploy.ai/");
    expect(pageForPath("/shop/brown-wool").h1).toBe("Brown Wool");
    expect(pageForPath("/shop/flange-tube").title).toContain("4 inch aluminum tube");
    expect(PAGE_SEO.map((page) => page.path)).toEqual([
      "/",
      "/build",
      "/shop/brown-wool",
      "/shop/flange-tube",
      "/publish",
      "/door",
      "/thanks",
    ]);
    const toml = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../netlify.toml"), "utf8");
    for (const page of PAGE_SEO) {
      if (page.path === "/") continue;
      expect(toml).toContain(`from = "${page.path}"`);
    }
  });
});

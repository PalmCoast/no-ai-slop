import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { router } from "../netlify/functions/api";
import { MemoryStore, useStore } from "../netlify/lib/store";

function req(path: string, init: RequestInit = {}): Request {
  return new Request(`http://flick.test${path}`, init);
}

function clipBody(over: Record<string, unknown> = {}) {
  return {
    title: "Demo",
    mimeType: "video/webm",
    durationMs: 1200,
    width: 640,
    height: 360,
    size: 128,
    chunkCount: 1,
    mode: "demo",
    ...over,
  };
}

describe("payment gate", () => {
  const prevDemo = process.env.ALLOW_DEMO_PAYMENTS;
  const prevKey = process.env.STRIPE_SECRET_KEY;
  const prevContext = process.env.CONTEXT;

  beforeEach(() => {
    useStore(new MemoryStore());
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.CONTEXT;
    process.env.ALLOW_DEMO_PAYMENTS = "true";
  });

  afterEach(() => {
    useStore(null);
    if (prevDemo === undefined) delete process.env.ALLOW_DEMO_PAYMENTS;
    else process.env.ALLOW_DEMO_PAYMENTS = prevDemo;
    if (prevKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prevKey;
    if (prevContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = prevContext;
  });

  it("lets the first short street-pass publish through", async () => {
    const res = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Flick-Device": "streetpass01" },
        body: JSON.stringify(clipBody()),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("blocks a second street-pass publish on the same device", async () => {
    const headers = { "Content-Type": "application/json", "X-Flick-Device": "streetpass02" };
    const first = await router.handle(req("/api/clips", { method: "POST", headers, body: JSON.stringify(clipBody()) }));
    expect(first.status).toBe(201);
    const second = await router.handle(req("/api/clips", { method: "POST", headers, body: JSON.stringify(clipBody({ title: "Two" })) }));
    expect(second.status).toBe(402);
    const body = (await second.json()) as { error: string };
    expect(body.error).toBe("paywall");
  });

  it("blocks a three-minute clip without a paid seat", async () => {
    const res = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Flick-Device": "streetpass03" },
        body: JSON.stringify(clipBody({ durationMs: 3 * 60 * 1000 })),
      }),
    );
    expect(res.status).toBe(402);
  });

  it("issues a demo license and unlocks publish", async () => {
    const checkout = await router.handle(
      req("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly" }),
      }),
    );
    expect(checkout.status).toBe(200);
    const paid = (await checkout.json()) as { demo: boolean; licenseKey: string };
    expect(paid.demo).toBe(true);
    expect(paid.licenseKey).toMatch(/^FLICK-DEMO-/);

    const long = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Flick-Device": "paiddevice0001",
          "X-Flick-License": paid.licenseKey,
        },
        body: JSON.stringify(clipBody({ durationMs: 3 * 60 * 1000 })),
      }),
    );
    expect(long.status).toBe(201);
  });

  it("refuses demo checkout in production", async () => {
    process.env.CONTEXT = "production";
    const res = await router.handle(
      req("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "founder" }),
      }),
    );
    expect(res.status).toBe(503);
  });

  it("rejects a webhook without a Stripe signature", async () => {
    const res = await router.handle(req("/api/stripe-webhook", { method: "POST", body: "{}" }));
    expect([400, 409]).toContain(res.status);
  });

  it("keeps the street pass when Stripe is configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_placeholder_not_a_real_key";
    delete process.env.ALLOW_DEMO_PAYMENTS;
    const res = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Flick-Device": "streetpass99" },
        body: JSON.stringify(clipBody()),
      }),
    );
    expect(res.status).toBe(201);
    const me = await router.handle(req("/api/me", { headers: { "X-Flick-Device": "streetpass99" } }));
    const body = (await me.json()) as { plan: string; payments: string; freeRemaining: number };
    expect(body.plan).toBe("street");
    expect(body.payments).toBe("stripe");
    expect(body.freeRemaining).toBe(0);
  });

  it("reports the seat on /api/me", async () => {
    const res = await router.handle(req("/api/me", { headers: { "X-Flick-Device": "streetpass01" } }));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { plan: string; payments: string };
    expect(body.plan).toBe("street");
    expect(body.payments).toBe("demo");
  });
});

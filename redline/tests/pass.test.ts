import { afterEach, describe, expect, it } from "vitest";
import { shouldIssuePass } from "../shared/fulfill";
import { isPlausibleLicense } from "../shared/license";
import { modelLines } from "../shared/modelLines";
import { handle } from "../netlify/lib/api";
import { handleWebhook } from "../netlify/lib/webhook";
import { signToken, verifyToken } from "../netlify/lib/sign";

const envKeys = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] as const;
const previous = new Map<string, string | undefined>();

afterEach(() => {
  for (const key of envKeys) {
    const value = previous.get(key);
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  previous.clear();
});

function hideStripe() {
  for (const key of envKeys) {
    previous.set(key, process.env[key]);
    delete process.env[key];
  }
}

describe("pass", () => {
  it("issues a demo pass when Stripe is unset", async () => {
    hideStripe();
    const response = await handle(new Request("http://local/api/checkout", { method: "POST", body: "{}" }));
    const body = (await response.json()) as { demo: boolean; licenseKey: string; message: string };
    expect(response.status).toBe(200);
    expect(body.demo).toBe(true);
    expect(body.licenseKey).toMatch(/^REDLINE-DEMO-[A-Z0-9]{4}$/);
    expect(body.message).toContain("No card was charged");
    expect(isPlausibleLicense(body.licenseKey)).toBe(true);
  });

  it("tells the offer page that checkout is a demo", async () => {
    hideStripe();
    const response = await handle(new Request("http://local/api/offer"));
    const body = (await response.json()) as { priceCents: number; demo: boolean };
    expect(body.priceCents).toBe(900);
    expect(body.demo).toBe(true);
  });

  it("accepts a demo key only while Stripe is unset", async () => {
    hideStripe();
    const ok = await handle(
      new Request("http://local/api/license", { method: "POST", body: JSON.stringify({ key: "REDLINE-DEMO-ABCD" }) }),
    );
    expect(((await ok.json()) as { valid: boolean }).valid).toBe(true);
    process.env.STRIPE_SECRET_KEY = "stripe-secret-for-test";
    const later = await handle(
      new Request("http://local/api/license", { method: "POST", body: JSON.stringify({ key: "REDLINE-DEMO-ABCD" }) }),
    );
    expect(((await later.json()) as { valid: boolean }).valid).toBe(false);
  });

  it("signs a token that verifies with the same secret", () => {
    const token = signToken("cs_test_123", "secret");
    expect(verifyToken(token, "secret")).toBe(true);
    expect(verifyToken(token, "other")).toBe(false);
  });
});

describe("webhook decisions", () => {
  it("grants on paid completion and refuses an unpaid completion", () => {
    expect(shouldIssuePass("checkout.session.completed", "paid")).toBe(true);
    expect(shouldIssuePass("checkout.session.completed", "unpaid")).toBe(false);
    expect(shouldIssuePass("checkout.session.async_payment_succeeded", "paid")).toBe(true);
    expect(shouldIssuePass("checkout.session.async_payment_succeeded", "unpaid")).toBe(false);
    expect(shouldIssuePass("checkout.session.async_payment_failed", "paid")).toBe(false);
  });

  it("refuses an unsigned webhook", async () => {
    hideStripe();
    const response = await handleWebhook(new Request("http://local/api/stripe-webhook", { method: "POST", body: "{}" }));
    expect(response.status).toBe(500);
  });
});

describe("model lines", () => {
  it("keeps a real charge and drops a bad row", () => {
    const lines = modelLines({
      lines: [
        { description: "CBC", code: "85025", quantity: 1, billedCents: 18600 },
        { description: "", billedCents: -1 },
        { description: "Made up", code: "not-a-code", quantity: 1, billedCents: 500 },
      ],
    });
    expect(lines).toHaveLength(2);
    expect(lines?.[0].code).toBe("85025");
    expect(lines?.[1].code).toBeNull();
  });

  it("returns null when the payload is not a line list", () => {
    expect(modelLines("no")).toBeNull();
    expect(modelLines({ note: "hello" })).toBeNull();
  });
});

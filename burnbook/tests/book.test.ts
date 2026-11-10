import { afterEach, describe, expect, it } from "vitest";
import type Stripe from "stripe";
import checkout, { config as checkoutConfig } from "../netlify/functions/checkout.ts";
import order, { config as orderConfig } from "../netlify/functions/order.ts";
import { config as webhookConfig } from "../netlify/functions/stripe-webhook.ts";
import { packetPriceId, paymentLink, sessionIsPacket } from "../netlify/lib/stripe.ts";
import { PACKET_CENTS, PAYMENT_LINK, PRICE_ID, PRODUCT_ID } from "../shared/brand.ts";
import { runBook } from "../shared/book.ts";
import { fileSlug, memoText, packetPlain } from "../shared/memo.ts";
import { formatUsd } from "../shared/money.ts";
import { sampleBook } from "../shared/sample.ts";

const saved = { ...process.env };

afterEach(() => {
  for (const key of Object.keys(process.env)) {
    if (!(key in saved)) delete process.env[key];
  }
  Object.assign(process.env, saved);
});

describe("the packet offer", () => {
  it("is $750 paid in full on the live Palm Coast AI price", () => {
    expect(PACKET_CENTS).toBe(75_000);
    expect(PRICE_ID).toBe("price_1UaJ40FJWYd4pYuxxNJ078sT");
    expect(PRODUCT_ID).toBe("prod_VbW6VdFl9ZxAni");
    expect(PAYMENT_LINK).toBe("https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O");
    expect(formatUsd(750)).toBe("$750.00");
  });
});

describe("Northline sample", () => {
  it("prices idle seats, the duplicate coding tool, and support rework", () => {
    const book = runBook(sampleBook());
    expect(book.company).toBe("Northline");
    expect(book.monthLabel).toBe("October 2026");
    expect(book.burnUsd).toBe(15_540);
    expect(book.idleWasteUsd).toBe(3_999);
    expect(book.reworkUsd).toBe(9_880);
    expect(book.vendorSaveUsd).toBe(4_170);
    expect(book.laborSaveUsd).toBe(7_600);
    expect(book.keepUsd).toBe(11_370);
    expect(book.vendorRunRateUsd).toBe(50_040);
    expect(book.laborRunRateUsd).toBe(91_200);

    const byName = Object.fromEntries(book.vendors.map((vendor) => [vendor.name, vendor]));
    expect(byName.Cursor.cut.kind).toBe("drop-seats");
    expect(byName.Cursor.cut.vendorSaveUsd).toBe(2_160);
    expect(byName.Cursor.costPerJobUsd).toBe(80);
    expect(byName.Copilot.cut.kind).toBe("duplicate");
    expect(byName.Copilot.cut.vendorSaveUsd).toBe(1_140);
    expect(byName.Copilot.cut.line).toContain("Cursor already covers coding at $80.00");
    expect(byName["ChatGPT Team"].cut.kind).toBe("drop-seats");
    expect(byName["ChatGPT Team"].idleWasteUsd).toBe(870);
    expect(byName.Line.cut.kind).toBe("rebuild");
    expect(byName.Line.cut.laborSaveUsd).toBe(7_600);
    expect(byName.Line.idleWasteUsd).toBe(0);
    expect(byName.Clay.cut.kind).toBe("keep");
    expect(byName.Clay.cut.saveUsd).toBe(0);

    const memo = memoText(book);
    expect(memo).toContain("This month's AI bill is $15,540.00.");
    expect(memo).toContain("$4,170.00 of vendor spend");
    expect(memo).toContain("It is not a prediction.");
    expect(packetPlain(book)).toContain("LETTERS");
    expect(fileSlug("Northline")).toBe("northline");
  });
});

describe("cut rules", () => {
  const rate = { company: "Shop", monthLabel: "May", reworkRateUsd: 100, vendors: [] as ReturnType<typeof sampleBook>["vendors"] };

  it("cancels a bill with no active seat and no finished job", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "a",
          name: "IdleBot",
          monthlyUsd: 500,
          seats: 4,
          activeSeats: 0,
          job: "ops",
          finishedJobs: 0,
          reworkHours: 0,
        },
      ],
    });
    expect(book.vendors[0].cut.kind).toBe("cancel");
    expect(book.vendorSaveUsd).toBe(500);
  });

  it("keeps a platform that has no seats and did finish jobs", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "p",
          name: "Desk",
          monthlyUsd: 1000,
          seats: 0,
          activeSeats: 0,
          job: "support",
          finishedJobs: 10,
          reworkHours: 0,
        },
      ],
    });
    expect(book.vendors[0].cut.kind).toBe("keep");
    expect(book.vendors[0].idleWasteUsd).toBe(0);
  });

  it("caps an active tool that finished nothing", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "c",
          name: "Shelf",
          monthlyUsd: 400,
          seats: 2,
          activeSeats: 2,
          job: "finance",
          finishedJobs: 0,
          reworkHours: 0,
        },
      ],
    });
    expect(book.vendors[0].cut.kind).toBe("cap");
    expect(book.vendorSaveUsd).toBe(200);
  });

  it("does not stack an idle-seat cut on top of a duplicate cancel", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "keep",
          name: "Keeper",
          monthlyUsd: 100,
          seats: 1,
          activeSeats: 1,
          job: "coding",
          finishedJobs: 10,
          reworkHours: 0,
        },
        {
          id: "lose",
          name: "Loser",
          monthlyUsd: 900,
          seats: 10,
          activeSeats: 1,
          job: "coding",
          finishedJobs: 1,
          reworkHours: 0,
        },
      ],
    });
    const loser = book.vendors.find((vendor) => vendor.name === "Loser");
    expect(loser?.cut.kind).toBe("duplicate");
    expect(loser?.cut.vendorSaveUsd).toBe(900);
    expect(loser?.idleWasteUsd).toBe(810);
    expect(book.vendorSaveUsd).toBe(900);
  });

  it("clamps active seats to the seats on the bill and skips a blank row", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "x",
          name: "Over",
          monthlyUsd: 100,
          seats: 3,
          activeSeats: 9,
          job: "other",
          finishedJobs: 1,
          reworkHours: 0,
        },
        {
          id: "blank",
          name: "  ",
          monthlyUsd: 0,
          seats: 0,
          activeSeats: 0,
          job: "other",
          finishedJobs: 0,
          reworkHours: 0,
        },
      ],
    });
    expect(book.vendors).toHaveLength(1);
    expect(book.vendors[0].activeSeats).toBe(3);
    expect(book.vendors[0].idleSeats).toBe(0);
  });

  it("ignores idle waste under $100", () => {
    const book = runBook({
      ...rate,
      vendors: [
        {
          id: "s",
          name: "Small",
          monthlyUsd: 100,
          seats: 10,
          activeSeats: 9,
          job: "ops",
          finishedJobs: 2,
          reworkHours: 0,
        },
      ],
    });
    expect(book.vendors[0].idleWasteUsd).toBe(10);
    expect(book.vendors[0].cut.kind).toBe("keep");
  });
});

describe("function routes", () => {
  it("serves checkout, order, and webhook on /api paths", () => {
    expect(checkoutConfig).toMatchObject({ path: "/api/checkout", method: ["POST"] });
    expect(orderConfig).toMatchObject({ path: "/api/order", method: ["GET"] });
    expect(webhookConfig).toMatchObject({ path: "/api/stripe-webhook", method: ["POST"] });
  });
});

describe("checkout without a Stripe secret", () => {
  it("returns the live $750 payment link", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await checkout(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: "packet" }),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string; fallback?: boolean; cents: number };
    expect(body.fallback).toBe(true);
    expect(body.url).toBe(PAYMENT_LINK);
    expect(body.cents).toBe(75_000);
  });

  it("rejects GET", async () => {
    const res = await checkout(new Request("http://localhost/api/checkout", { method: "GET" }));
    expect(res.status).toBe(405);
  });
});

describe("order without a Stripe secret", () => {
  it("does not pretend a session is paid", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const res = await order(new Request("http://localhost/api/order?session_id=cs_test_123"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { paid: boolean; configured: boolean };
    expect(body.paid).toBe(false);
    expect(body.configured).toBe(false);
  });

  it("requires a session id", async () => {
    const res = await order(new Request("http://localhost/api/order"));
    expect(res.status).toBe(400);
  });
});

describe("paid session check", () => {
  it("accepts the packet price and rejects a different paid session", () => {
    const paid = {
      payment_status: "paid",
      amount_total: 75_000,
      line_items: { data: [{ price: { id: PRICE_ID } }] },
      metadata: {},
    } as unknown as Stripe.Checkout.Session;
    expect(sessionIsPacket(paid, PRICE_ID)).toBe(true);

    const other = {
      payment_status: "paid",
      amount_total: 2_900,
      line_items: { data: [{ price: { id: "price_other" } }] },
      metadata: { product: "latch" },
    } as unknown as Stripe.Checkout.Session;
    expect(sessionIsPacket(other, PRICE_ID)).toBe(false);
    expect(packetPriceId()).toBe(PRICE_ID);
    expect(paymentLink()).toBe(PAYMENT_LINK);
  });
});

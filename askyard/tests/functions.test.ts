import { describe, expect, it } from "vitest";
import { config as ask } from "../netlify/functions/ask";
import { config as board } from "../netlify/functions/board";
import { config as hunt } from "../netlify/functions/hunt";
import { config as tally } from "../netlify/functions/tally";
import { config as huntWeekly } from "../netlify/functions/hunt-weekly";
import { config as rep } from "../netlify/functions/rep";
import { config as rate } from "../netlify/functions/rate";
import { config as marquee } from "../netlify/functions/marquee";
import { config as marqueeConfirm } from "../netlify/functions/marquee-confirm";
import { config as stripeWebhook } from "../netlify/functions/stripe-webhook";
import { fallbackAnswer } from "../netlify/lib/draft";

describe("function routes", () => {
  it("serves ask, board, hunt, tally, rep, rate, and marquee on first-class /api paths", () => {
    expect(ask).toMatchObject({ path: "/api/ask", method: "POST" });
    expect(board).toMatchObject({ path: "/api/board", method: "GET" });
    expect(hunt).toMatchObject({ path: "/api/hunt", method: "GET" });
    expect(tally).toMatchObject({ path: "/api/tally", method: "POST" });
    expect(rep).toMatchObject({ path: "/api/rep" });
    expect(rate).toMatchObject({ path: "/api/rate", method: "POST" });
    expect(marquee).toMatchObject({ path: "/api/marquee" });
    expect(marqueeConfirm).toMatchObject({ path: "/api/marquee/confirm", method: "GET" });
    expect(stripeWebhook).toMatchObject({ path: "/api/stripe-webhook", method: "POST" });
  });

  it("refreshes the hunt on a published daily schedule", () => {
    expect(huntWeekly).toMatchObject({ schedule: "@daily" });
  });
});

describe("draft fallback", () => {
  it("still names a priced offer when the gateway is cold", () => {
    const text = fallbackAnswer("How do I stop missing night calls?");
    expect(text).toMatch(/First Deploy AI|after-hours|AskYard/);
    expect(text).toMatch(/\$1,500|\$250|free 30|JobProof|Consult/);
  });
});

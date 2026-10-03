import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ctaKind, isAuditVisit } from "../src/analytics";

describe("PostHog click tracking", () => {
  it("classifies buy and booking links", () => {
    expect(ctaKind("https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u")).toBe("checkout");
    expect(ctaKind("/go/concierge")).toBe("checkout");
    expect(ctaKind("https://calendly.com/coltsinsider/30min")).toBe("booking");
    expect(ctaKind("https://firstdeploy.ai/go/start")).toBe("checkout");
    expect(ctaKind("https://firstdeploy.ai/")).toBe("handoff");
    expect(ctaKind("/about")).toBe("");
  });

  it("flags audit runs", () => {
    expect(isAuditVisit("?src=audit", null, false, "Mozilla/5.0")).toBe(true);
    expect(isAuditVisit("", "1", false, "Mozilla/5.0")).toBe(true);
    expect(isAuditVisit("", null, true, "Mozilla/5.0")).toBe(true);
    expect(isAuditVisit("", null, false, "Mozilla/5.0 HeadlessChrome/140")).toBe(true);
    expect(isAuditVisit("?src=gads", null, false, "Mozilla/5.0")).toBe(false);
  });

  it("ships only the public project token, never a personal API key", () => {
    const src = readFileSync(new URL("../src/analytics.ts", import.meta.url), "utf8");
    expect(src).toContain("phc_");
    expect(src).not.toMatch(/phx_[A-Za-z0-9]/);
  });
});

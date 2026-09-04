import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  generateDemoKey,
  generateLicenseKey,
  isDemoLicense,
  isPlausibleLicense,
  isWellFormedLicense,
  KEY_ALPHABET,
  normalizeKey,
} from "../src/license";
import { saveLicenseRecord, validateLicense } from "../netlify/lib/auth";
import { resetStores } from "../netlify/lib/store";

describe("license key format", () => {
  it("generates SONARIS-XXXX-XXXX-XXXX from the unambiguous alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const k = generateLicenseKey();
      expect(k).toMatch(/^SONARIS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      for (const ch of k.replace(/^SONARIS-/, "").replace(/-/g, "")) expect(KEY_ALPHABET).toContain(ch);
    }
  });

  it("generates demo keys in the SONARIS-DEMO-XXXX shape", () => {
    const k = generateDemoKey(() => 0);
    expect(k).toBe("SONARIS-DEMO-AAAA");
    expect(isDemoLicense(k)).toBe(true);
    expect(isWellFormedLicense(k)).toBe(false);
  });

  it("validates format strictly", () => {
    expect(isWellFormedLicense("SONARIS-ABCD-EFGH-JKLM")).toBe(true);
    expect(isWellFormedLicense("SONARIS-ABCD-EFGH")).toBe(false);
    expect(isWellFormedLicense("sonaris-abcd-efgh-jklm")).toBe(false);
    expect(isWellFormedLicense("SONARIS-ABCD-EFGH-JKLM-NOPQ")).toBe(false);
    expect(isPlausibleLicense("SONARIS-DEMO-1234")).toBe(true);
    expect(isPlausibleLicense("hello")).toBe(false);
  });

  it("normalizes user input (case, whitespace)", () => {
    expect(normalizeKey("  sonaris-abcd-efgh-jklm \n")).toBe("SONARIS-ABCD-EFGH-JKLM");
    expect(normalizeKey(null)).toBe("");
  });
});

describe("validateLicense against the store (file adapter, demo mode)", () => {
  let dir: string;
  const saved = { ...process.env };
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "sonaris-lic-"));
    process.env.SONARIS_LOCAL = "true";
    process.env.SONARIS_ROOT = dir;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_PRICE_ID;
    resetStores();
  });
  afterEach(() => {
    process.env = { ...saved };
    resetStores();
    rmSync(dir, { recursive: true, force: true });
  });

  it("rejects missing, malformed and unknown keys with reasons", async () => {
    expect(await validateLicense("")).toMatchObject({ valid: false, reason: "missing" });
    expect(await validateLicense("bad")).toMatchObject({ valid: false, reason: "malformed" });
    expect(await validateLicense("SONARIS-ABCD-EFGH-JKLM")).toMatchObject({ valid: false, reason: "unknown" });
  });

  it("accepts a stored paid key and reports its plan", async () => {
    await saveLicenseRecord({ key: "SONARIS-ABCD-EFGH-JKLM", plan: "one_time", issuedAt: "2026-01-01T00:00:00.000Z" });
    const r = await validateLicense("sonaris-abcd-efgh-jklm");
    expect(r).toMatchObject({ valid: true, plan: "one_time", issuedAt: "2026-01-01T00:00:00.000Z" });
  });

  it("accepts demo keys only while Stripe is not configured", async () => {
    expect(await validateLicense("SONARIS-DEMO-QQQQ")).toMatchObject({ valid: true, plan: "demo", demo: true });
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_ID = "price_x";
    expect(await validateLicense("SONARIS-DEMO-QQQQ")).toMatchObject({ valid: false, reason: "demo_disabled" });
  });
});

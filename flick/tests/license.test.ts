import { describe, expect, it } from "vitest";
import { generateDemoKey, generateLicenseKey, isDemoLicense, isWellFormedLicense, normalizeKey } from "../shared/license";
import { formatUsd, MONTHLY_CENTS } from "../shared/plans";

describe("license keys", () => {
  it("formats paid and demo keys", () => {
    const paid = generateLicenseKey(() => 0);
    expect(paid).toBe("FLICK-AAAA-AAAA-AAAA");
    expect(isWellFormedLicense(paid)).toBe(true);
    const demo = generateDemoKey(() => 0);
    expect(demo).toBe("FLICK-DEMO-AAAA");
    expect(isDemoLicense(demo)).toBe(true);
  });

  it("normalizes pasted keys", () => {
    expect(normalizeKey(" flick-ab12-cd34-ef56 ")).toBe("FLICK-AB12-CD34-EF56");
  });

  it("formats USD without cents noise", () => {
    expect(formatUsd(MONTHLY_CENTS)).toBe("$19");
  });
});

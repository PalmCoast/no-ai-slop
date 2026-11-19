import { describe, expect, it } from "vitest";
import { PRICE_CENTS } from "../shared/offer";
import { parseBill, reviewLines, sumCents, totalGap } from "../shared/review";
import { SAMPLE_BILL } from "../shared/sample";

describe("sample bill", () => {
  const parsed = parseBill(SAMPLE_BILL);
  const lines = reviewLines(parsed.lines);

  it("reads the header and every charge", () => {
    expect(parsed.hospital).toBe("RIVERSIDE GENERAL HOSPITAL");
    expect(parsed.patient).toBe("Jordan Hale");
    expect(parsed.account).toBe("4482190");
    expect(parsed.serviceDate).toBe("03/14/2026");
    expect(parsed.payer).toBe("Northwind PPO");
    expect(parsed.patientOwesCents).toBe(428000);
    expect(parsed.lines).toHaveLength(14);
    expect(sumCents(lines, (line) => line.billedCents)).toBe(1_627_740);
    expect(totalGap(parsed.statedTotalCents, parsed.lines)).toBeNull();
  });

  it("marks the duplicate, the panel parts, the second visit, and the multiples", () => {
    const duplicate = lines.filter((line) => line.flags.some((flag) => flag.kind === "duplicate"));
    expect(duplicate).toHaveLength(1);
    expect(duplicate[0].code).toBe("99284");
    expect(duplicate[0].askCents).toBe(0);

    const unbundled = lines.filter((line) => line.flags.some((flag) => flag.kind === "unbundled"));
    expect(unbundled.map((line) => line.code).sort()).toEqual(["84450", "84460"]);

    const second = lines.filter((line) => line.flags.some((flag) => flag.kind === "second_visit"));
    expect(second.map((line) => line.code)).toEqual(["99283"]);

    const keeper = lines.find((line) => line.code === "99284" && line.askCents > 0);
    expect(keeper?.askCents).toBe(63945);
    expect(keeper?.flags.some((flag) => flag.kind === "severe")).toBe(true);

    expect(lines.find((line) => line.description.startsWith("PHARMACY"))?.savingsCents).toBe(0);
    expect(sumCents(lines, (line) => line.savingsCents)).toBe(1_392_189);
    expect(sumCents(lines, (line) => line.askCents)).toBe(235_551);
  });

  it("stops calling a line a duplicate after the amount changes", () => {
    const tweaked = parsed.lines.map((line, index) => (index === 1 ? { ...line, billedCents: line.billedCents - 1 } : line));
    const reviewed = reviewLines(tweaked);
    expect(reviewed[1].flags.some((flag) => flag.kind === "duplicate")).toBe(false);
    expect(reviewed[1].flags.some((flag) => flag.kind === "second_visit")).toBe(true);
  });

  it("drops the unbundle flag when the panel is gone", () => {
    const withoutPanel = parsed.lines.filter((line) => line.code !== "80053");
    const reviewed = reviewLines(withoutPanel);
    expect(reviewed.some((line) => line.flags.some((flag) => flag.kind === "unbundled"))).toBe(false);
  });

  it("flags a modest multiple when the ask is cut to 1.5 times", () => {
    const reviewed = reviewLines([{ id: "a", description: "ED visit level 4", code: "99284", quantity: 1, billedCents: 70000 }]);
    expect(reviewed[0].askCents).toBe(63945);
    expect(reviewed[0].flags.map((flag) => flag.kind)).toEqual(["over_reference"]);
  });

  it("prices the pass under ten dollars", () => {
    expect(PRICE_CENTS).toBe(900);
    expect(PRICE_CENTS).toBeLessThan(1000);
    expect(sumCents(lines, (line) => line.savingsCents)).toBeGreaterThan(PRICE_CENTS);
  });
});

describe("messy lines", () => {
  it("reads a charge with a dollar sign and no quantity", () => {
    const parsed = parseBill("COUNTY HOSPITAL\nCBC with differential $186.00\n");
    expect(parsed.lines).toEqual([
      expect.objectContaining({ code: "85025", billedCents: 18600, quantity: 1 }),
    ]);
  });

  it("flags a printed total that does not match the lines", () => {
    const parsed = parseBill("Clinic\n99284 ED visit level 4 1 100.00\nTOTAL CHARGES 50.00\n");
    expect(totalGap(parsed.statedTotalCents, parsed.lines)).toBe(-5000);
  });
});

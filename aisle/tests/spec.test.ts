import { describe, expect, it } from "vitest";
import { parseSpec, specChips } from "../shared/spec";

describe("spec parser", () => {
  it("reads a brown wool sweater", () => {
    const spec = parseSpec("brown wool sweater");
    expect(spec.product).toBe("sweater");
    expect(spec.materials).toEqual(["wool"]);
    expect(spec.colors).toEqual(["brown"]);
    expect(spec.features).toEqual([]);
    expect(specChips(spec)).toEqual(["brown", "wool", "sweater"]);
  });

  it("reads 4 inch aluminum tube with a flange, including inch marks", () => {
    for (const raw of ["4 inch aluminum tube with a flange", '4" aluminum tube with a flange', "4-inch aluminum tube with a flange"]) {
      const spec = parseSpec(raw);
      expect(spec.product).toBe("tube");
      expect(spec.materials).toEqual(["aluminum"]);
      expect(spec.features).toEqual(["flange"]);
      expect(spec.dimensions[0]?.inches).toBeCloseTo(4);
      expect(spec.dimensions[0]?.role).toBe("diameter");
    }
  });

  it("treats 102 mm aluminium as a 4 inch aluminum diameter", () => {
    const spec = parseSpec("102 mm aluminium tube, flanged end");
    expect(spec.materials).toEqual(["aluminum"]);
    expect(spec.features).toEqual(["flange"]);
    expect(spec.dimensions[0]?.inches).toBeCloseTo(4.016, 2);
    expect(spec.dimensions[0]?.role).toBe("diameter");
  });

  it("keeps wool blend distinct from wool, and merino as wool", () => {
    expect(parseSpec("brown wool blend sweater").materials).toEqual(["blend"]);
    const merino = parseSpec("chocolate brown merino wool crewneck sweater");
    expect(merino.materials).toEqual(["wool"]);
    expect(merino.colors).toEqual(["brown"]);
    expect(merino.features).toContain("merino");
    expect(merino.features).toContain("crewneck");
  });

  it("reads a half-inch stainless tube and a 4 foot length", () => {
    const half = parseSpec("1/2 inch stainless tube");
    expect(half.dimensions[0]?.inches).toBeCloseTo(0.5);
    expect(half.materials).toEqual(["stainless"]);
    const long = parseSpec("4 ft aluminum tube with a flange");
    expect(long.dimensions[0]?.role).toBe("length");
    expect(long.dimensions[0]?.inches).toBeCloseTo(48);
  });

  it("does not call a slip-on flange a tube", () => {
    const spec = parseSpec("Slip-on flange, fits 4 inch aluminum tube", "listing");
    expect(spec.product).toBe("flange");
    expect(spec.features).toContain("flange");
  });

  it("ignores a negated flange on a listing", () => {
    const spec = parseSpec("4 inch aluminum tube. No flange.", "listing");
    expect(spec.features).not.toContain("flange");
  });
});

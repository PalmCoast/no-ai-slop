import { describe, expect, it } from "vitest";
import { formatProof, prove } from "../src/prove.ts";

describe("proof", () => {
  it("matches the bytecode machine and CPython on the mixed-radix loop", () => {
    const proof = prove();
    console.log(formatProof(proof));
    expect(proof.checksum).toMatch(/^\d+$/);
    expect(proof.pythonMatch).toBe(true);
    expect(proof.repetitivePacked).toBeLessThan(proof.repetitiveRaw / 10);
    expect(proof.stampBytes).toBeLessThan(proof.hexTextChars);
    expect(proof.agrees).toBe(1);
    expect(proof.jsRunMs).toBeGreaterThan(0);
    expect(proof.vmRunMs).toBeGreaterThan(0);
  }, 60_000);
});

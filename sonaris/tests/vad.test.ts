import { describe, expect, it } from "vitest";
import { clampSilence, rms, shouldEndUtterance, VoiceActivityDetector } from "../src/vad";

describe("rms", () => {
  it("computes root mean square", () => {
    expect(rms([0, 0, 0])).toBe(0);
    expect(rms([1, -1, 1, -1])).toBe(1);
    expect(rms(new Float32Array([0.5, -0.5]))).toBeCloseTo(0.5);
    expect(rms([])).toBe(0);
  });
});

describe("VoiceActivityDetector", () => {
  it("stays silent on noise near the floor and fires on speech after the attack debounce", () => {
    const vad = new VoiceActivityDetector({ initialFloor: 0.01, attackFrames: 2, releaseFrames: 3 });
    for (let i = 0; i < 20; i++) expect(vad.push(0.008 + (i % 2) * 0.002).voiced).toBe(false);
    expect(vad.push(0.2).voiced).toBe(false); // first loud frame: debounce
    expect(vad.push(0.2).voiced).toBe(true); // second: speech
    expect(vad.push(0.01).voiced).toBe(true); // hangover
    expect(vad.push(0.01).voiced).toBe(true);
    expect(vad.push(0.01).voiced).toBe(false); // released after 3 quiet frames
  });

  it("adapts the noise floor upward in a louder room", () => {
    const vad = new VoiceActivityDetector({ initialFloor: 0.005 });
    const before = vad.threshold;
    for (let i = 0; i < 200; i++) vad.push(0.02);
    expect(vad.threshold).toBeGreaterThan(before);
    // Steady room noise must still not count as speech.
    expect(vad.push(0.02).voiced).toBe(false);
  });

  it("keeps the floor far below speech level during a long monologue", () => {
    const vad = new VoiceActivityDetector({ initialFloor: 0.01 });
    let last = vad.push(0.3);
    for (let i = 0; i < 300; i++) last = vad.push(0.25 + (i % 3) * 0.05);
    expect(last.voiced).toBe(true);
    expect(last.floor).toBeLessThan(0.08);
    expect(last.threshold).toBeLessThan(0.2);
  });
});

describe("shouldEndUtterance", () => {
  const base = { silenceMs: 900, hasInterim: false, lastFinalAt: 1000 };

  it("never fires before the user has spoken", () => {
    expect(shouldEndUtterance({ ...base, now: 5000, lastVoiceAt: null })).toBe(false);
  });

  it("fires only after silenceMs of silence following the last voiced frame", () => {
    expect(shouldEndUtterance({ ...base, now: 1899, lastVoiceAt: 1000 })).toBe(false);
    expect(shouldEndUtterance({ ...base, now: 1900, lastVoiceAt: 1000 })).toBe(true);
  });

  it("waits an extra grace period while interim text is still pending, then fires anyway", () => {
    const i = { ...base, hasInterim: true, lastVoiceAt: 1000, finalizeGraceMs: 600 };
    expect(shouldEndUtterance({ ...i, now: 1900 })).toBe(false);
    expect(shouldEndUtterance({ ...i, now: 2499 })).toBe(false);
    expect(shouldEndUtterance({ ...i, now: 2500 })).toBe(true);
  });

  it("honours a user-adjusted silence window", () => {
    expect(shouldEndUtterance({ ...base, silenceMs: 400, now: 1400, lastVoiceAt: 1000 })).toBe(true);
    expect(shouldEndUtterance({ ...base, silenceMs: 2000, now: 2999, lastVoiceAt: 1000 })).toBe(false);
  });
});

describe("clampSilence", () => {
  it("keeps the slider inside 400..2000 ms and rounds", () => {
    expect(clampSilence(100)).toBe(400);
    expect(clampSilence(5000)).toBe(2000);
    expect(clampSilence(899.6)).toBe(900);
    expect(clampSilence(Number.NaN)).toBe(900);
  });
});

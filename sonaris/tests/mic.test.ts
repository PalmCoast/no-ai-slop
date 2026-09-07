import { describe, expect, it } from "vitest";
import { setAudioTracksEnabled } from "../src/audio/mic";

function fakeStream(n: number) {
  const tracks = Array.from({ length: n }, () => ({ enabled: true }));
  return { tracks, getAudioTracks: () => tracks };
}

describe("setAudioTracksEnabled", () => {
  it("mutes every audio track and unmutes them again", () => {
    const s = fakeStream(3);
    expect(setAudioTracksEnabled(s, false)).toBe(3);
    expect(s.tracks.map((t) => t.enabled)).toEqual([false, false, false]);
    expect(setAudioTracksEnabled(s, true)).toBe(3);
    expect(s.tracks.map((t) => t.enabled)).toEqual([true, true, true]);
  });

  it("is idempotent", () => {
    const s = fakeStream(1);
    setAudioTracksEnabled(s, false);
    setAudioTracksEnabled(s, false);
    expect(s.tracks[0]!.enabled).toBe(false);
  });

  it("does nothing on a missing stream (typed input and ?demo=1 have no microphone)", () => {
    expect(setAudioTracksEnabled(null, false)).toBe(0);
    expect(setAudioTracksEnabled(undefined, true)).toBe(0);
  });

  it("reports zero for a stream with no audio tracks", () => {
    expect(setAudioTracksEnabled(fakeStream(0), false)).toBe(0);
  });
});

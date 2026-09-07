import { describe, expect, it } from "vitest";
import { CLIP_NAMES, clipForState } from "../src/companion";
import { TurnState } from "../src/turn";

describe("clipForState", () => {
  it("rests while idle and on first render", () => {
    expect(clipForState(null, TurnState.Idle)).toEqual({ clip: "sleep", loop: true });
    expect(clipForState(TurnState.Listening, TurnState.Idle)).toEqual({ clip: "sleep", loop: true });
  });

  it("keeps a quiet alive loop while listening", () => {
    expect(clipForState(TurnState.Idle, TurnState.Listening)).toEqual({ clip: "alert", loop: true });
    expect(clipForState(TurnState.Speaking, TurnState.Listening)).toEqual({ clip: "alert", loop: true });
  });

  it("wakes up once when the user starts talking from idle or listening, then stays alert", () => {
    expect(clipForState(TurnState.Listening, TurnState.UserSpeaking)).toEqual({ clip: "wake", loop: false, then: "alert" });
    expect(clipForState(TurnState.Idle, TurnState.UserSpeaking)).toEqual({ clip: "wake", loop: false, then: "alert" });
    expect(clipForState(null, TurnState.UserSpeaking)).toEqual({ clip: "wake", loop: false, then: "alert" });
  });

  it("does not replay the wake-up when the user is already mid-conversation", () => {
    expect(clipForState(TurnState.Interrupted, TurnState.UserSpeaking)).toEqual({ clip: "alert", loop: true });
    expect(clipForState(TurnState.Thinking, TurnState.UserSpeaking)).toEqual({ clip: "alert", loop: true });
  });

  it("smiles once while thinking and holds the last frame", () => {
    const plan = clipForState(TurnState.UserSpeaking, TurnState.Thinking);
    expect(plan.clip).toBe("smile");
    expect(plan.loop).toBe(false);
    expect(plan.then).toBeUndefined();
  });

  it("bounces while speaking", () => {
    expect(clipForState(TurnState.Thinking, TurnState.Speaking)).toEqual({ clip: "speak", loop: true });
  });

  it("holds the current frame briefly on an interruption, then goes alert", () => {
    const plan = clipForState(TurnState.Speaking, TurnState.Interrupted);
    expect(plan.clip).toBe("alert");
    expect(plan.loop).toBe(true);
    expect(plan.holdMs).toBeGreaterThan(0);
  });

  it("only ever names clips the build script produces", () => {
    const states = Object.values(TurnState);
    for (const prev of [null, ...states]) {
      for (const next of states) {
        const plan = clipForState(prev, next);
        expect(CLIP_NAMES).toContain(plan.clip);
        if (plan.then) expect(CLIP_NAMES).toContain(plan.then);
      }
    }
  });
});

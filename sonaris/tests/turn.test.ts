import { describe, expect, it } from "vitest";
import { canSpeak, nextState, TurnMachine, TurnState, userHasFloor } from "../src/turn";

describe("turn state transitions", () => {
  it("walks the happy path idle → listening → user_speaking → thinking → speaking → listening", () => {
    let s = TurnState.Idle;
    s = nextState(s, "start");
    expect(s).toBe(TurnState.Listening);
    s = nextState(s, "voice_start");
    expect(s).toBe(TurnState.UserSpeaking);
    s = nextState(s, "end_of_utterance");
    expect(s).toBe(TurnState.Thinking);
    s = nextState(s, "reply_ready");
    expect(s).toBe(TurnState.Speaking);
    s = nextState(s, "reply_done");
    expect(s).toBe(TurnState.Listening);
  });

  it("ignores events that do not apply to the current state", () => {
    expect(nextState(TurnState.Idle, "reply_ready")).toBe(TurnState.Idle);
    expect(nextState(TurnState.Listening, "end_of_utterance")).toBe(TurnState.Listening);
    expect(nextState(TurnState.UserSpeaking, "reply_ready")).toBe(TurnState.UserSpeaking);
  });

  it("interrupts a reply when the user barges in, then lets the user speak", () => {
    let s = nextState(TurnState.Speaking, "user_barge_in");
    expect(s).toBe(TurnState.Interrupted);
    s = nextState(s, "voice_start");
    expect(s).toBe(TurnState.UserSpeaking);
    s = nextState(s, "end_of_utterance");
    expect(s).toBe(TurnState.Thinking);
  });

  it("discards an utterance with no final text and returns to listening", () => {
    expect(nextState(TurnState.UserSpeaking, "utterance_discarded")).toBe(TurnState.Listening);
  });

  it("stop always returns to idle", () => {
    for (const s of Object.values(TurnState)) {
      if (s === TurnState.Idle) continue;
      expect(nextState(s, "stop")).toBe(TurnState.Idle);
    }
  });

  it("only permits TTS while speaking, never while the user holds the floor", () => {
    expect(canSpeak(TurnState.Speaking)).toBe(true);
    for (const s of [TurnState.Idle, TurnState.Listening, TurnState.UserSpeaking, TurnState.Thinking, TurnState.Interrupted]) {
      expect(canSpeak(s)).toBe(false);
    }
    expect(userHasFloor(TurnState.UserSpeaking)).toBe(true);
    expect(userHasFloor(TurnState.Interrupted)).toBe(true);
    expect(userHasFloor(TurnState.Speaking)).toBe(false);
  });
});

describe("TurnMachine barge-in timing", () => {
  function speakingMachine(opts: { bargeInMs?: number; neverTalkOver?: boolean } = {}) {
    const m = new TurnMachine(opts);
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    m.send("reply_ready");
    expect(m.state).toBe(TurnState.Speaking);
    return m;
  }

  it("does not interrupt on a brief blip shorter than the barge-in threshold", () => {
    const m = speakingMachine({ bargeInMs: 250 });
    m.onVoiceFrame(true, 1000);
    m.onVoiceFrame(true, 1100);
    m.onVoiceFrame(true, 1200);
    expect(m.state).toBe(TurnState.Speaking);
    m.onVoiceFrame(false, 1250);
    m.onVoiceFrame(true, 1300); // timer restarts
    m.onVoiceFrame(true, 1500);
    expect(m.state).toBe(TurnState.Speaking);
  });

  it("interrupts once the user has been speaking for the threshold and takes the floor", () => {
    const events: string[] = [];
    const m = new TurnMachine({ bargeInMs: 250, onChange: (s) => events.push(s) });
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    m.send("reply_ready");
    m.onVoiceFrame(true, 1000);
    m.onVoiceFrame(true, 1249);
    expect(m.state).toBe(TurnState.Speaking);
    m.onVoiceFrame(true, 1250);
    expect(m.state).toBe(TurnState.UserSpeaking);
    expect(events).toContain(TurnState.Interrupted);
    expect(m.canSpeak()).toBe(false);
  });

  it("interrupts the thinking phase too so TTS never starts over the user", () => {
    const m = new TurnMachine({ bargeInMs: 250 });
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    expect(m.state).toBe(TurnState.Thinking);
    m.onVoiceFrame(true, 0);
    m.onVoiceFrame(true, 300);
    expect(m.state).toBe(TurnState.UserSpeaking);
    expect(nextState(m.state, "reply_ready")).toBe(TurnState.UserSpeaking);
  });

  it("keeps talking when 'never talk over me' is off", () => {
    const m = speakingMachine({ bargeInMs: 250, neverTalkOver: false });
    m.onVoiceFrame(true, 0);
    m.onVoiceFrame(true, 2000);
    expect(m.state).toBe(TurnState.Speaking);
  });

  it("moves from listening to user_speaking on the first voiced frame", () => {
    const m = new TurnMachine();
    m.send("start");
    m.onVoiceFrame(true, 10);
    expect(m.state).toBe(TurnState.UserSpeaking);
  });
});

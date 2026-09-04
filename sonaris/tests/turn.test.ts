import { describe, expect, it } from "vitest";
import { canSpeak, micMuted, nextState, TurnMachine, TurnState, userHasFloor } from "../src/turn";

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

  it("ignores voice_start while speaking: the mic is muted, so that is our own voice", () => {
    expect(nextState(TurnState.Speaking, "voice_start")).toBe(TurnState.Speaking);
  });

  it("interrupts a reply on an explicit user interrupt, then lets the user speak", () => {
    let s = nextState(TurnState.Speaking, "user_interrupt");
    expect(s).toBe(TurnState.Interrupted);
    s = nextState(s, "voice_start");
    expect(s).toBe(TurnState.UserSpeaking);
    s = nextState(s, "end_of_utterance");
    expect(s).toBe(TurnState.Thinking);
  });

  it("lets an explicit interrupt cancel a reply that is still being thought up", () => {
    expect(nextState(TurnState.Thinking, "user_interrupt")).toBe(TurnState.Interrupted);
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

  it("mutes the microphone in exactly one state: speaking", () => {
    for (const s of Object.values(TurnState)) {
      expect(micMuted(s)).toBe(s === TurnState.Speaking);
    }
  });
});

describe("TurnMachine while the assistant speaks", () => {
  function speakingMachine(onChange?: (s: TurnState, prev: TurnState, event: string) => void) {
    const m = new TurnMachine({ bargeInMs: 250, onChange });
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    m.send("reply_ready");
    expect(m.state).toBe(TurnState.Speaking);
    expect(m.micMuted()).toBe(true);
    return m;
  }

  it("ignores voiced VAD frames for any length of time: no transition, no interruption", () => {
    const changes: string[] = [];
    const m = speakingMachine((s) => changes.push(s));
    changes.length = 0;
    for (let t = 0; t <= 5000; t += 25) m.onVoiceFrame(true, t);
    expect(m.state).toBe(TurnState.Speaking);
    expect(m.canSpeak()).toBe(true);
    expect(changes).toEqual([]);
  });

  it("ignores a voice_start event sent directly while speaking", () => {
    const m = speakingMachine();
    expect(m.send("voice_start")).toBe(TurnState.Speaking);
  });

  it("stops on an explicit user interrupt and hands the floor to the user", () => {
    const changes: string[] = [];
    const m = speakingMachine((s) => changes.push(s));
    m.send("user_interrupt");
    expect(m.state).toBe(TurnState.Interrupted);
    expect(m.canSpeak()).toBe(false);
    expect(m.micMuted()).toBe(false);
    // Space held or voice right after: the user is talking.
    m.onVoiceFrame(true, 10);
    expect(m.state).toBe(TurnState.UserSpeaking);
    expect(changes).toContain(TurnState.Interrupted);
  });

  it("returns to listening when playback finishes (reply_done) and unmutes", () => {
    const changes: Array<[TurnState, TurnState, string]> = [];
    const m = speakingMachine((s, prev, event) => changes.push([s, prev, event]));
    changes.length = 0;
    m.send("reply_done");
    expect(m.state).toBe(TurnState.Listening);
    expect(m.micMuted()).toBe(false);
    expect(changes).toEqual([[TurnState.Listening, TurnState.Speaking, "reply_done"]]);
    // The first voiced frame after playback is the user again.
    m.onVoiceFrame(true, 1);
    expect(m.state).toBe(TurnState.UserSpeaking);
  });

  it("returns to listening when the reply fails", () => {
    const m = speakingMachine();
    m.send("reply_failed");
    expect(m.state).toBe(TurnState.Listening);
  });
});

describe("TurnMachine while thinking (mic open, speakers silent)", () => {
  function thinkingMachine() {
    const m = new TurnMachine({ bargeInMs: 250 });
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    expect(m.state).toBe(TurnState.Thinking);
    return m;
  }

  it("does not cancel the reply on a brief blip shorter than the threshold", () => {
    const m = thinkingMachine();
    m.onVoiceFrame(true, 1000);
    m.onVoiceFrame(true, 1200);
    expect(m.state).toBe(TurnState.Thinking);
    m.onVoiceFrame(false, 1250);
    m.onVoiceFrame(true, 1300); // timer restarts
    m.onVoiceFrame(true, 1500);
    expect(m.state).toBe(TurnState.Thinking);
  });

  it("cancels the pending reply once the user has talked for the threshold, so TTS never starts over them", () => {
    const events: string[] = [];
    const m = new TurnMachine({ bargeInMs: 250, onChange: (s) => events.push(s) });
    m.send("start");
    m.send("voice_start");
    m.send("end_of_utterance");
    m.onVoiceFrame(true, 0);
    m.onVoiceFrame(true, 249);
    expect(m.state).toBe(TurnState.Thinking);
    m.onVoiceFrame(true, 250);
    expect(m.state).toBe(TurnState.UserSpeaking);
    expect(events).toContain(TurnState.Interrupted);
    expect(nextState(m.state, "reply_ready")).toBe(TurnState.UserSpeaking);
  });

  it("does not carry the held-for clock from thinking into speaking", () => {
    const m = thinkingMachine();
    m.onVoiceFrame(true, 0);
    m.onVoiceFrame(true, 200);
    m.send("reply_ready");
    m.onVoiceFrame(true, 260);
    m.onVoiceFrame(true, 1000);
    expect(m.state).toBe(TurnState.Speaking);
  });

  it("moves from listening to user_speaking on the first voiced frame", () => {
    const m = new TurnMachine();
    m.send("start");
    m.onVoiceFrame(true, 10);
    expect(m.state).toBe(TurnState.UserSpeaking);
  });
});
